import * as cheerio from "cheerio"
import { safeFetch, assertNotChallenged } from "./safeFetch"
import { scanSource, redact } from "./secretPatterns"
import { finding, summarize, sortFindings, detectStack } from "./findings"

const MAX_SCRIPTS = 20
const MAX_SOURCE_MAPS = 3
const CORS_TEST_ORIGIN = "https://cors-check.estebot.invalid"
const SESSION_COOKIE = /sess|sid|token|auth|jwt|login/i

// Files that should never be publicly downloadable. `looksReal` filters out
// SPAs that answer every path with index.html.
const EXPOSED_FILES = [
  { path: "/.env", label: ".env file", looksReal: isEnvFile },
  { path: "/.env.local", label: ".env.local file", looksReal: isEnvFile },
  { path: "/.env.production", label: ".env.production file", looksReal: isEnvFile },
  { path: "/.git/config", label: "Git repository (.git/config)", looksReal: b => /^\s*\[core\]/m.test(b) },
  { path: "/.git/HEAD", label: "Git repository (.git/HEAD)", looksReal: b => /^ref: refs\//.test(b) }
]

export async function runSecurityChecks(inputUrl) {
  const url = /^https?:\/\//i.test(inputUrl)
    ? inputUrl
    : `https://${inputUrl}`

  // Headers are read from the first response, so redirects aren't followed.
  const first = await safeFetch(url, {
    timeout: 10000,
    maxRedirects: 0,
    headers: { Origin: CORS_TEST_ORIGIN }
  })

  // The page content may live behind a redirect (e.g. apex → www).
  const page =
    first.status >= 300 && first.status < 400
      ? await safeFetch(url, { timeout: 15000, maxRedirects: 5 }).catch(() => first)
      : first

  assertNotChallenged(first)
  assertNotChallenged(page)

  const headers = first.headers
  const pageUrl = page.url
  const html = typeof page.data === "string" ? page.data : ""
  const isHttps = pageUrl.startsWith("https:")

  const [httpRedirects, scripts, exposedFiles] = await Promise.all([
    isHttps ? checkHttpRedirect(pageUrl) : Promise.resolve(false),
    collectScripts(html, pageUrl),
    probeExposedFiles(pageUrl)
  ])

  const sourceMaps = await probeSourceMaps(scripts)

  // -----------------------------
  // SECRET SCAN
  // -----------------------------
  const sources = [{ file: new URL(pageUrl).pathname || "/", body: html }, ...scripts]
  const secretsByValue = new Map()
  let supabaseAnon = false
  let supabaseUrl = false
  let firebase = false

  for (const { file, body } of sources) {
    const result = scanSource(body)
    supabaseAnon ||= result.supabaseAnon
    supabaseUrl ||= result.supabaseUrl
    firebase ||= result.firebase
    for (const s of result.secrets) {
      if (!secretsByValue.has(s.value)) secretsByValue.set(s.value, { ...s, file })
    }
  }

  const secrets = [...secretsByValue.values()].map(s => ({
    name: s.name,
    severity: s.severity,
    file: s.file,
    preview: redact(s.value)
  }))

  // -----------------------------
  // HEADER VALUES
  // -----------------------------
  const csp = headers["content-security-policy"] || ""
  const hsts = headers["strict-transport-security"] || ""
  const hstsMaxAge = Number(hsts.match(/max-age=(\d+)/i)?.[1] || 0)
  const acao = headers["access-control-allow-origin"] || ""
  const acac = String(headers["access-control-allow-credentials"] || "") === "true"
  const cookies = [].concat(headers["set-cookie"] || [])
  const devServer = /\/@vite\/client|webpack-hmr|__webpack_hmr|react-refresh\/runtime|_next\/static\/development\//.test(html)

  const checks = {
    transport: {
      https: isHttps,
      hsts: !!hsts,
      httpRedirectsToHttps: httpRedirects
    },

    headers: {
      csp: !!csp,
      xFrame: !!headers["x-frame-options"] || /frame-ancestors/i.test(csp),
      xContentType: !!headers["x-content-type-options"],
      referrerPolicy: !!headers["referrer-policy"],
      permissionsPolicy: !!headers["permissions-policy"]
    },

    exposure: {
      server: headers["server"] || null,
      xPoweredBy: headers["x-powered-by"] || null
    },

    secrets,
    exposedFiles: exposedFiles.map(f => f.path),
    sourceMaps,
    scriptsScanned: scripts.length,
    backend: { supabase: supabaseUrl || supabaseAnon, firebase }
  }

  // -----------------------------
  // FINDINGS
  // -----------------------------
  const findings = []
  const passed = []
  const check = (ok, passLabel, f) => (ok ? passed.push(passLabel) : findings.push(f()))

  if (secrets.length === 0) {
    passed.push(`No secret keys found in page or ${scripts.length} JavaScript file${scripts.length === 1 ? "" : "s"}`)
  }
  for (const s of secrets) {
    findings.push(finding(`secret-${s.name}`, s.severity, `${s.name} exposed in your website code`,
      "Anyone can open your site's JavaScript and copy this key, then use it to run up bills, read your data or impersonate your app. AI builders often put keys in frontend code because it 'just works'. Treat this key as compromised.",
      `My ${s.name} is exposed in frontend code (${s.file}). 1) Revoke/rotate the key in the provider's dashboard now. 2) Move every call that needs it into a server-side API route or edge function that reads it from a server-only environment variable (not one prefixed NEXT_PUBLIC_ or VITE_). 3) Make the frontend call that route instead.`,
      `${s.preview} in ${s.file}`))
  }

  if (exposedFiles.length === 0) passed.push("No .env or .git files publicly accessible")
  for (const f of exposedFiles) {
    findings.push(finding(`exposed-${f.path}`, "critical", `${f.label} is publicly downloadable`,
      f.path.startsWith("/.env")
        ? "Your environment file, which usually holds passwords and API keys, can be downloaded by anyone. Contents are not shown here. Assume every secret in it is compromised."
        : "Your Git repository metadata is public. Attackers can often reconstruct your full source code, including history and any secrets ever committed.",
      `${f.path} is publicly accessible on my site. Block access to dotfiles (/.env*, /.git) in the hosting/server config, remove them from the deployed files, and rotate every secret they contained.`,
      f.path))
  }

  check(sourceMaps.length === 0, "No source maps exposed", () =>
    finding("source-maps", "medium", "Source maps are public",
      "Source maps let anyone read your original, un-minified source code, including comments and any hard-coded values.",
      "Disable production source maps (e.g. `build.sourcemap: false` in vite.config, `productionBrowserSourceMaps: false` in next.config) or stop serving *.map files publicly.",
      sourceMaps[0]))

  check(!devServer, "Not running a development server", () =>
    finding("dev-server", "high", "Development server running in production",
      "The site is being served by a dev server (hot-reload scripts detected). Dev servers are slow, leak internal paths and errors, and aren't built to be exposed to the internet. Common on Replit and similar hosts.",
      "My production site is running the dev server (`npm run dev`). Change the deploy/run command to build the app (`npm run build`) and serve the production output (`npm start` / `vite preview` / static hosting)."))

  check(isHttps, "Served over HTTPS", () =>
    finding("https", "critical", "Site is not using HTTPS",
      "Everything your visitors send, including passwords and form data, travels in plain text.",
      "Enable HTTPS for my domain (most hosts do this for free) and redirect all HTTP traffic to HTTPS."))

  if (isHttps) {
    check(httpRedirects, "HTTP redirects to HTTPS", () =>
      finding("http-redirect", "medium", "HTTP version doesn't redirect to HTTPS",
        "Visitors who type your address without https:// get an insecure version of the site.",
        "Configure a permanent (301/308) redirect from http:// to https:// for every path."))

    if (!hsts) {
      findings.push(finding("hsts", "medium", "HSTS header missing",
        "Strict-Transport-Security tells browsers to always use HTTPS, preventing downgrade attacks on public Wi-Fi.",
        "Add the header `Strict-Transport-Security: max-age=31536000; includeSubDomains`."))
    } else if (hstsMaxAge < 15552000) {
      findings.push(finding("hsts-short", "low", "HSTS duration is short",
        `max-age is ${hstsMaxAge} seconds; at least 6 months (15552000) is recommended.`,
        "Set `Strict-Transport-Security: max-age=31536000; includeSubDomains`.",
        hsts))
    } else {
      passed.push("HSTS enabled")
    }
  }

  if (!csp) {
    findings.push(finding("csp", "medium", "No Content-Security-Policy",
      "A CSP limits which scripts can run on your site, which is your main defence against cross-site scripting (XSS).",
      "Add a Content-Security-Policy header. Start with `default-src 'self'` and add only the third-party domains my app actually uses (analytics, fonts, Supabase, Stripe, etc.)."))
  } else if (/'unsafe-eval'|script-src[^;]*\s\*(\s|;|$)/i.test(csp)) {
    findings.push(finding("csp-weak", "low", "Content-Security-Policy is weak",
      "Your CSP allows `unsafe-eval` or scripts from any domain, which removes most of its protection.",
      "Tighten the Content-Security-Policy: remove 'unsafe-eval' and wildcard (*) script sources.",
      csp.slice(0, 120)))
  } else {
    passed.push("Content-Security-Policy set")
  }

  check(checks.headers.xFrame, "Protected against clickjacking", () =>
    finding("clickjacking", "medium", "Site can be embedded by other websites",
      "Without X-Frame-Options or CSP frame-ancestors, attackers can load your site invisibly inside theirs and trick users into clicking buttons (clickjacking).",
      "Add `X-Frame-Options: DENY` (or CSP `frame-ancestors 'none'`)."))

  check(checks.headers.xContentType, "X-Content-Type-Options set", () =>
    finding("nosniff", "low", "X-Content-Type-Options missing",
      "Stops browsers guessing file types, which can turn uploaded files into scripts.",
      "Add the header `X-Content-Type-Options: nosniff`."))

  check(checks.headers.referrerPolicy, "Referrer-Policy set", () =>
    finding("referrer", "low", "Referrer-Policy missing",
      "Without it, full URLs (which can contain tokens or IDs) may leak to other sites your visitors click through to.",
      "Add the header `Referrer-Policy: strict-origin-when-cross-origin`."))

  check(checks.headers.permissionsPolicy, "Permissions-Policy set", () =>
    finding("permissions", "low", "Permissions-Policy missing",
      "Restricts which browser features (camera, microphone, location) your site and embedded content can use.",
      "Add a Permissions-Policy header disabling features I don't use, e.g. `camera=(), microphone=(), geolocation=()`."))

  if (acao === CORS_TEST_ORIGIN && acac) {
    findings.push(finding("cors-reflect", "high", "CORS trusts any website, with credentials",
      "Your server echoes back any Origin and allows credentials, so any website a logged-in user visits can read their data from your API.",
      "Fix CORS: only allow my own domains in Access-Control-Allow-Origin (an explicit allowlist), never reflect the request Origin when Access-Control-Allow-Credentials is true.",
      `Access-Control-Allow-Origin: ${acao}`))
  } else if (acao === "*" || acao === CORS_TEST_ORIGIN) {
    findings.push(finding("cors-wildcard", "low", "CORS allows any website",
      "Any site can read responses from this URL. Fine for public assets, risky for APIs that return private data.",
      "Restrict Access-Control-Allow-Origin to my own domains unless this endpoint is meant to be public.",
      `Access-Control-Allow-Origin: ${acao}`))
  }

  const insecureCookies = cookies
    .map(c => ({ name: c.split("=")[0].trim(), attrs: c.toLowerCase() }))
    .filter(c =>
      (isHttps && !c.attrs.includes("secure")) ||
      (SESSION_COOKIE.test(c.name) && !c.attrs.includes("httponly")) ||
      !c.attrs.includes("samesite"))

  if (cookies.length > 0) {
    check(insecureCookies.length === 0, "Cookies have secure flags", () =>
      finding("cookies", SESSION_COOKIE.test(insecureCookies.map(c => c.name).join(" ")) ? "medium" : "low",
        "Cookies missing security flags",
        "Cookies should be marked Secure (HTTPS only), HttpOnly (hidden from JavaScript, for session cookies) and SameSite (blocks cross-site request forgery).",
        `Set Secure, HttpOnly and SameSite=Lax (or Strict) on these cookies: ${insecureCookies.map(c => c.name).join(", ")}.`,
        insecureCookies.map(c => c.name).join(", ")))
  }

  const versionLeak = [headers["server"], headers["x-powered-by"]].find(v => v && /\d/.test(v))
  check(!headers["x-powered-by"] && !versionLeak, "No technology/version headers leaked", () =>
    finding("powered-by", "low", "Server reveals its technology",
      "Headers like X-Powered-By or a versioned Server header help attackers look up known vulnerabilities for your exact stack.",
      "Remove the X-Powered-By header (e.g. `poweredByHeader: false` in next.config, `app.disable('x-powered-by')` in Express) and hide version numbers in the Server header.",
      [headers["server"], headers["x-powered-by"]].filter(Boolean).join(" / ")))

  if (supabaseUrl || supabaseAnon) {
    findings.push(finding("supabase-rls", "info", "Supabase detected: check Row Level Security",
      "Your Supabase public (anon) key is in the frontend. That's expected, but it means anyone can query your database directly. Only Row Level Security (RLS) policies stop them reading or changing other users' data. EsteBot does not test this, because doing so would mean accessing your data.",
      "In Supabase, enable Row Level Security on every table in the public schema and add policies so users can only read/write their own rows. Then run the Supabase Security Advisor and fix every warning."))
  }
  if (firebase) {
    findings.push(finding("firebase-rules", "info", "Firebase detected: check Security Rules",
      "Firebase config in the frontend is normal, but Firestore/Realtime Database/Storage rules are what protect your data. Rules left in 'test mode' let anyone read and write everything.",
      "Review my Firestore, Realtime Database and Storage security rules: remove any `allow read, write: if true` or test-mode expiry rules and require `request.auth` with per-user checks."))
  }

  const sorted = sortFindings(findings.filter(Boolean))

  return {
    url: pageUrl,
    status: first.status,
    stack: detectStack(html, new URL(pageUrl).hostname),
    summary: summarize(sorted),
    findings: sorted,
    passed,
    checks
  }
}

// -----------------------------
// HELPERS
// -----------------------------
async function checkHttpRedirect(httpsUrl) {
  const httpUrl = httpsUrl.replace(/^https:/, "http:")
  try {
    const res = await safeFetch(httpUrl, { timeout: 5000, maxRedirects: 0, readBody: false })
    return res.status >= 300 && res.status < 400 && /^https:/i.test(res.headers.location || "")
  } catch {
    // http not reachable at all is fine
    return true
  }
}

async function collectScripts(html, pageUrl) {
  if (!html) return []
  const $ = cheerio.load(html)
  const pageHost = new URL(pageUrl).hostname
  const baseDomain = pageHost.replace(/^www\./, "")

  const srcs = new Set()
  $("script[src], link[rel=modulepreload][href]").each((i, el) => {
    const raw = $(el).attr("src") || $(el).attr("href")
    try {
      const abs = new URL(raw, pageUrl)
      // Only the site's own bundles, not third-party CDNs.
      if (abs.hostname === pageHost || abs.hostname.endsWith(`.${baseDomain}`)) {
        srcs.add(abs.toString())
      }
    } catch {
      // ignore bad URLs
    }
  })

  const inline = $("script:not([src])")
    .map((i, el) => $(el).html())
    .get()
    .join("\n")

  const results = await Promise.allSettled(
    [...srcs].slice(0, MAX_SCRIPTS).map(async src => {
      const res = await safeFetch(src, { timeout: 8000, maxBytes: 5 * 1024 * 1024 })
      if (res.status !== 200 || typeof res.data !== "string") return null
      return { file: new URL(src).pathname, url: res.url, body: res.data }
    })
  )

  const scripts = results
    .filter(r => r.status === "fulfilled" && r.value)
    .map(r => r.value)

  if (inline.trim()) scripts.push({ file: "inline <script> tags", body: inline })
  return scripts
}

async function probeExposedFiles(pageUrl) {
  const results = await Promise.allSettled(
    EXPOSED_FILES.map(async f => {
      const res = await safeFetch(new URL(f.path, pageUrl).toString(), {
        timeout: 5000,
        maxBytes: 64 * 1024,
        maxRedirects: 0
      })
      // Body is only inspected here and never returned.
      return res.status === 200 && typeof res.data === "string" && f.looksReal(res.data) ? f : null
    })
  )
  return results.filter(r => r.status === "fulfilled" && r.value).map(r => r.value)
}

async function probeSourceMaps(scripts) {
  const candidates = scripts
    .filter(s => s.url)
    .map(s => ({ s, ref: s.body.match(/\/\/# sourceMappingURL=(\S+)\s*$/)?.[1] }))
    .filter(x => x.ref && !x.ref.startsWith("data:"))
    .slice(0, MAX_SOURCE_MAPS)

  const results = await Promise.allSettled(
    candidates.map(async ({ s, ref }) => {
      const mapUrl = new URL(ref, s.url).toString()
      const res = await safeFetch(mapUrl, { timeout: 5000, maxRedirects: 0, readBody: false })
      const type = res.headers["content-type"] || ""
      return res.status === 200 && !type.includes("text/html") ? new URL(mapUrl).pathname : null
    })
  )
  return results.filter(r => r.status === "fulfilled" && r.value).map(r => r.value)
}

function isEnvFile(body) {
  if (/^\s*</.test(body)) return false
  return /^\s*(export\s+)?[A-Z][A-Z0-9_]*\s*=/m.test(body)
}

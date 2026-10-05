import { runSeoChecks } from "@/app/lib/seoChecks"
import { safeFetch, validateUrl, FetchError, assertNotChallenged } from "@/app/lib/safeFetch"
import { rateLimit } from "@/app/lib/rateLimit"

export async function POST(req) {
  const limited = rateLimit(req)
  if (limited) return limited

  let body
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { url } = body || {}
  if (!url || typeof url !== "string") {
    return Response.json({ error: "URL required" }, { status: 400 })
  }

  let normalizedUrl
  try {
    normalizedUrl = validateUrl(url).toString()
  } catch (err) {
    return Response.json({ error: err.message }, { status: 400 })
  }

  try {
    const [res, robotsTxt] = await Promise.all([
      safeFetch(normalizedUrl, {
        timeout: 15000,
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
        }
      }),
      fetchText(new URL("/robots.txt", normalizedUrl).toString())
    ])

    assertNotChallenged(res)

    const contentType = res.headers["content-type"] || ""

    if (!contentType.includes("text/html")) {
      return Response.json(
        { error: "URL did not return HTML" },
        { status: 415 }
      )
    }

    const sitemapFound = await findSitemap(res.url, robotsTxt)

    const report = runSeoChecks(res.data, res.url, res.status, {
      headers: res.headers,
      robotsTxt,
      sitemapFound
    })
    report.robotsTxt = robotsTxt

    return Response.json(report)
  } catch (err) {
    if (err instanceof FetchError) {
      return Response.json({ error: err.message }, { status: err.status })
    }

    console.error("SEO audit error:", err)
    return Response.json({ error: "Failed to fetch URL" }, { status: 500 })
  }
}

// Returns the body of a small text file, or null if missing/unreachable.
async function fetchText(url, maxBytes = 512 * 1024) {
  try {
    const res = await safeFetch(url, { timeout: 5000, maxBytes })
    if (res.status !== 200 || typeof res.data !== "string") return null
    // SPAs often answer every path with index.html.
    if (/^\s*<(!doctype|html)/i.test(res.data)) return null
    return res.data
  } catch {
    return null
  }
}

async function findSitemap(pageUrl, robotsTxt) {
  const declared = robotsTxt?.match(/^\s*sitemap:\s*(\S+)/im)?.[1]
  const candidates = [declared, new URL("/sitemap.xml", pageUrl).toString()]
    .filter(Boolean)

  for (const candidate of candidates) {
    let sitemapUrl
    try {
      sitemapUrl = new URL(candidate, pageUrl).toString()
    } catch {
      continue
    }
    const xml = await fetchText(sitemapUrl, 10 * 1024 * 1024)
    if (xml && /<(urlset|sitemapindex)\b/i.test(xml)) return true
  }
  return false
}

// Shared shape for audit results: a list of findings plus a score/grade.

export const SEVERITY_ORDER = ["critical", "high", "medium", "low", "info"]

const WEIGHTS = { critical: 30, high: 15, medium: 7, low: 3, info: 0 }

/**
 * @param {string} id        stable identifier
 * @param {"critical"|"high"|"medium"|"low"|"info"} severity
 * @param {string} title     short, plain-English headline
 * @param {string} detail    what it means and why it matters
 * @param {string} fix       instruction to paste into an AI coding tool
 * @param {string} [evidence] what was found (never a full secret)
 */
export function finding(id, severity, title, detail, fix, evidence) {
  return { id, severity, title, detail, fix, ...(evidence ? { evidence } : {}) }
}

export function summarize(findings) {
  const counts = Object.fromEntries(SEVERITY_ORDER.map(s => [s, 0]))
  let score = 100

  for (const f of findings) {
    counts[f.severity]++
    score -= WEIGHTS[f.severity]
  }

  score = Math.max(0, score)
  // Any critical issue means the site fails, whatever else is right.
  if (counts.critical > 0) score = Math.min(score, 49)

  const grade =
    score >= 90 ? "A" : score >= 80 ? "B" : score >= 65 ? "C" : score >= 50 ? "D" : "F"

  return { score, grade, counts }
}

export function sortFindings(findings) {
  return [...findings].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  )
}

/**
 * Detect common AI builders / frameworks from the page HTML.
 */
export function detectStack(html, hostname = "") {
  const stack = []
  const has = re => re.test(html)

  if (has(/gptengineer\.js|lovable-tagger|lovable\.dev|cdn\.gpteng\.co/i) || hostname.endsWith(".lovable.app")) {
    stack.push("Lovable")
  }
  if (has(/bolt\.new|stackblitz/i) || hostname.endsWith(".bolt.host")) stack.push("Bolt")
  if (has(/v0\.dev|v0\.app|name="generator" content="v0/i)) stack.push("v0")
  if (hostname.endsWith(".replit.app") || hostname.endsWith(".repl.co") || has(/replit\.com\/public\/js/i)) {
    stack.push("Replit")
  }
  if (has(/__NEXT_DATA__|\/_next\/static\//)) stack.push("Next.js")
  else if (has(/<script[^>]+type="module"[^>]+src="\/assets\/index-[^"]+\.js"/i) || has(/\/@vite\/client/)) {
    stack.push("Vite")
  }
  if (has(/content="Framer/i)) stack.push("Framer")
  if (has(/content="Webflow"/i)) stack.push("Webflow")
  if (hostname.endsWith(".vercel.app")) stack.push("Vercel")
  if (hostname.endsWith(".netlify.app")) stack.push("Netlify")

  return stack
}

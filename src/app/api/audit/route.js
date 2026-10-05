import { runSeoChecks } from "@/app/lib/seoChecks"
import { safeFetch, validateUrl, FetchError } from "@/app/lib/safeFetch"
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

  const robotsUrl = new URL("/robots.txt", normalizedUrl).toString()

  let robotsTxt = null
  try {
    const robotsRes = await safeFetch(robotsUrl, {
      timeout: 5000,
      maxBytes: 512 * 1024
    })
    if (robotsRes.status === 200) robotsTxt = robotsRes.data
  } catch {
    robotsTxt = null
  }

  try {
    const res = await safeFetch(normalizedUrl, {
      timeout: 15000,
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    })

    const contentType = res.headers["content-type"] || ""

    if (!contentType.includes("text/html")) {
      return Response.json(
        { error: "URL did not return HTML" },
        { status: 415 }
      )
    }

    const report = runSeoChecks(res.data, res.url, res.status)
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

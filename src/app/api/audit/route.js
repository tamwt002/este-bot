import axios from "axios"
import { runSeoChecks } from "@/app/lib/seoChecks"
import { parse as parseUrl } from "url"

export async function POST(req) {
  const { url } = await req.json()

  if (!url) {
    return Response.json({ error: "URL required" }, { status: 400 })
  }

  let normalizedUrl
  try {
    normalizedUrl = new URL(url).toString()
  } catch {
    return Response.json({ error: "Invalid URL format" }, { status: 400 })
  }

  const { host, protocol } = parseUrl(normalizedUrl)
  const robotsUrl = `${protocol}//${host}/robots.txt`

  let robotsTxt = null
  try {
    const robotsRes = await axios.get(robotsUrl, {
      timeout: 5000,
      headers: { "User-Agent": "WozSEO-Bot/1.0" }
    })
    robotsTxt = robotsRes.data
  } catch {
    robotsTxt = null
  }

  try {
    const res = await axios.get(normalizedUrl, {
      timeout: 15000,
      maxRedirects: 5,
      decompress: true,
      validateStatus: () => true,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; WozSEO-Bot/1.0; +https://yourdomain.com/bot)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br"
      }
    })

    const contentType = res.headers["content-type"] || ""

    if (!contentType.includes("text/html")) {
      return Response.json(
        { error: "URL did not return HTML", contentType },
        { status: 415 }
      )
    }

    const report = runSeoChecks(res.data, normalizedUrl, res.status)
    report.robotsTxt = robotsTxt

    return Response.json(report)
  } catch (err) {
    console.error("SEO Fetch Error:", err.message)

    return Response.json(
      { error: "Failed to fetch URL", details: err.message },
      { status: 500 }
    )
  }
}

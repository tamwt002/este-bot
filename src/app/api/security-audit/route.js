import { runSecurityChecks } from "@/app/lib/securityChecks"
import { FetchError } from "@/app/lib/safeFetch"
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

  const { url, consent } = body || {}
  if (!url || typeof url !== "string") {
    return Response.json(
      { error: "URL required" },
      { status: 400 }
    )
  }

  if (consent !== true) {
    return Response.json(
      { error: "Please confirm you own this site or have permission to test it." },
      { status: 400 }
    )
  }

  try {
    const report = await runSecurityChecks(url)
    return Response.json(report)
  } catch (err) {
    if (err instanceof FetchError) {
      return Response.json({ error: err.message }, { status: err.status })
    }

    console.error("Security audit error:", err)
    return Response.json(
      { error: "Security audit failed" },
      { status: 500 }
    )
  }
}

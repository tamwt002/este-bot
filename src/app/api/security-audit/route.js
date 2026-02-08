import { runSecurityChecks } from "@/app/lib/securityChecks"

export async function POST(req) {
  const { url } = await req.json()

  if (!url) {
    return Response.json(
      { error: "URL required" },
      { status: 400 }
    )
  }

  try {
    const report = await runSecurityChecks(url)
    return Response.json(report)
  } catch (err) {
    return Response.json(
      { error: "Security audit failed" },
      { status: 500 }
    )
  }
}

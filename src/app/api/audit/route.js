import axios from "axios"
import { runSeoChecks } from "@/app/lib/seoChecks"

export async function POST(req) {
  const { url } = await req.json()

  if (!url) {
    return Response.json({ error: "URL required" }, { status: 400 })
  }

  try {
    const res = await axios.get(url, {
      timeout: 15000,
      headers: {
        "User-Agent": "WozSEO-Bot/1.0"
      }
    })

    const report = runSeoChecks(res.data, url, res.status)

    return Response.json(report)
  } catch (err) {
    return Response.json(
      { error: "Failed to fetch URL" },
      { status: 500 }
    )
  }
}

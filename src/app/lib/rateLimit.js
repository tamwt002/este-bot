// Simple in-memory fixed-window rate limiter, keyed by client IP.
// Note: state is per server instance. On serverless hosts (e.g. Vercel)
// each instance keeps its own counts; use a shared store such as
// Upstash Redis if you need a strict global limit.

const WINDOW_MS = 60 * 1000
const MAX_REQUESTS = 10

const hits = new Map()

export function getClientIp(req) {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return req.headers.get("x-real-ip") || "unknown"
}

/**
 * Returns null if allowed, or a 429 Response if the limit is exceeded.
 */
export function rateLimit(req) {
  const ip = getClientIp(req)
  const now = Date.now()

  // Drop expired entries so the map can't grow forever.
  if (hits.size > 10000) {
    for (const [key, entry] of hits) {
      if (now - entry.start > WINDOW_MS) hits.delete(key)
    }
  }

  const entry = hits.get(ip)
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 })
    return null
  }

  entry.count++
  if (entry.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.start + WINDOW_MS - now) / 1000)
    return Response.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    )
  }

  return null
}

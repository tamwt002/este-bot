import { SITE_URL } from "./lib/site"

// Public pages only. Never list API routes or anything private here.
const ROUTES = [
  { path: "/", priority: 1 },
  { path: "/security", priority: 0.9 },
  { path: "/accessibility", priority: 0.9 },
  { path: "/bot", priority: 0.3 },
  { path: "/privacy", priority: 0.2 },
  { path: "/disclaimer", priority: 0.2 }
]

export default function sitemap() {
  const lastModified = new Date()
  return ROUTES.map(({ path, priority }) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: "monthly",
    priority
  }))
}

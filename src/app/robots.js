import { SITE_URL } from "./lib/site"

// Crawlers may index the public pages; API routes are kept out.
export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/api/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  }
}

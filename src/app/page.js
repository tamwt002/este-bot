"use client"

import AuditPage from "./components/AuditPage"
import AuditSection from "./components/AuditSection"

const STEPS = [
  "Fetching your page",
  "Reading titles, descriptions and headings",
  "Checking robots.txt and sitemap",
  "Looking for blank-page problems",
  "Working out your score"
]

const CHECKS = [
  {
    title: "Can Google see it?",
    icon: "eye",
    items: [
      "Blank pages from client-side React apps",
      "Leftover noindex tags",
      "robots.txt blocking everyone",
      "sitemap.xml"
    ]
  },
  {
    title: "Template leftovers",
    icon: "file",
    items: [
      "\"Vite + React\" style titles",
      "Default descriptions and favicons",
      "Builder placeholder share images",
      "localhost links in your metadata"
    ]
  },
  {
    title: "The basics",
    icon: "search",
    items: [
      "Title and description length",
      "Headings, alt text, mobile viewport",
      "Social previews (Open Graph)",
      "Structured data and HTTPS"
    ]
  }
]

export default function SeoAuditPage() {
  return (
    <AuditPage
      kind="SEO"
      endpoint="/api/audit"
      title="Can Google actually see your site?"
      intro="Built with Lovable, Bolt, v0, Cursor or Replit? Paste your URL and EsteBot checks for the SEO mistakes AI-built sites make most, then hands you a fix prompt for each one."
      greeting="Kia ora! Kiwis have nostrils on the tip of their beak. I'll sniff out what Google can't see."
      steps={STEPS}
      checks={CHECKS}
      Details={AuditSection}
    />
  )
}

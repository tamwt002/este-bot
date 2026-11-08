import SeoAudit from "./components/audits/SeoAudit"
import Faq from "./components/Faq"
import JsonLd from "./components/JsonLd"
import { PAGES, auditPageJsonLd } from "./lib/site"

const page = PAGES.seo

export const metadata = {
  title: { absolute: page.title },
  description: page.description,
  alternates: { canonical: page.path },
  openGraph: { title: page.title, description: page.description, url: page.path },
  twitter: { title: page.title, description: page.description }
}

const FAQS = [
  {
    q: "Why isn't Google showing my Lovable or Bolt site?",
    a: "Most Lovable, Bolt and Vite apps send Google an almost empty page and build the content with JavaScript in the browser. Google can render JavaScript, but it's slower and less reliable, and many other crawlers and link previews see nothing at all. Leftover noindex tags from preview builds are the other common cause. Pre-rendering or server rendering your pages, removing noindex and submitting a sitemap in Google Search Console fixes most cases."
  },
  {
    q: "How long does it take for a new site to show up on Google?",
    a: "Google usually discovers and indexes a new site within a few days to a few weeks, faster if you submit a sitemap in Google Search Console. Ranking well for competitive searches typically takes several months, and depends on useful content and links from other sites."
  },
  {
    q: "What does EsteBot's SEO check look at?",
    a: "Whether search engines can see your content, leftover template titles and descriptions, noindex tags, robots.txt rules, sitemap.xml, localhost links in your metadata, canonical URLs, headings, image alt text, mobile viewport, social preview tags, structured data and HTTPS."
  },
  {
    q: "Does EsteBot change anything on my site?",
    a: "No. EsteBot only reads the public page you enter, plus your robots.txt and sitemap. It never logs in, submits forms or changes anything, and your results aren't stored."
  },
  {
    q: "What is a fix prompt?",
    a: "Every issue comes with a ready-written instruction you can paste into Lovable, Bolt, Cursor, v0 or any AI coding tool, so it knows exactly what to change. You can copy them one at a time or all at once."
  }
]

export default function Home() {
  return (
    <>
      <JsonLd data={auditPageJsonLd({ name: "EsteBot SEO Checker", path: page.path, description: page.description, faqs: FAQS })} />
      <SeoAudit />
      <Faq faqs={FAQS} />
    </>
  )
}

import AccessibilityAudit from "../components/audits/AccessibilityAudit"
import Faq from "../components/Faq"
import JsonLd from "../components/JsonLd"
import { PAGES, auditPageJsonLd } from "../lib/site"

const page = PAGES.accessibility

export const metadata = {
  title: page.title,
  description: page.description,
  alternates: { canonical: page.path },
  // Page-level openGraph replaces the root one, so the shared image is set again here.
  openGraph: { title: `${page.title} | EsteBot`, description: page.description, url: page.path, images: "/opengraph-image" },
  twitter: { title: `${page.title} | EsteBot`, description: page.description, images: "/twitter-image" }
}

const FAQS = [
  {
    q: "Why does accessibility matter for my site?",
    a: "The World Health Organization estimates around 1 in 6 people live with a significant disability. If your site doesn't work with screen readers, keyboards or zoom, you're shutting those people out. Many countries also have laws that can apply to websites, and accessible sites tend to be easier for everyone to use."
  },
  {
    q: "What accessibility mistakes do AI-built sites make most?",
    a: "Icon-only buttons and links with no label, form fields that only use placeholder text, zoom switched off in the viewport tag, images without alt text, clickable divs instead of real buttons, and focus outlines removed so keyboard users can't see where they are."
  },
  {
    q: "Can EsteBot check colour contrast?",
    a: "Not yet. Contrast depends on how the page is rendered, so EsteBot reminds you to check it yourself. Chrome DevTools shows the contrast ratio when you inspect text: body text needs at least 4.5:1 and large text 3:1."
  },
  {
    q: "Does passing this check mean my site is WCAG compliant?",
    a: "No. Automated checks only catch some accessibility problems. Use EsteBot to fix the common ones quickly, then test with a keyboard and a screen reader, and use a tool like Lighthouse or axe for a deeper look."
  },
  {
    q: "My site was marked as a partial check. Why?",
    a: "Your page is built almost entirely by JavaScript, so the HTML EsteBot receives is nearly empty and most checks can't run. Run Lighthouse's accessibility audit in Chrome DevTools on your live pages to check what's inside your app."
  }
]

export default function AccessibilityPage() {
  return (
    <>
      <JsonLd data={auditPageJsonLd({ name: "EsteBot Accessibility Checker", path: page.path, description: page.description, faqs: FAQS })} />
      <AccessibilityAudit />
      <Faq faqs={FAQS} />
    </>
  )
}

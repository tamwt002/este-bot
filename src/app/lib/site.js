// Public site facts used for SEO metadata, the sitemap and structured data.
// Only public information belongs here: no emails, keys or personal data.

export const SITE_URL = "https://estebot.woztech.world"
export const SITE_NAME = "EsteBot"

export const PAGES = {
  seo: {
    path: "/",
    title: "SEO Checker for Lovable, Bolt & Vibe-Coded Sites | EsteBot",
    description:
      "Check if Google can actually see your AI-built site. EsteBot finds blank pages, template titles, noindex tags and missing sitemaps, with a fix prompt for each."
  },
  security: {
    path: "/security",
    title: "Check Your Site for Exposed API Keys & .env Files",
    description:
      "Scan your vibe-coded site for leaked OpenAI, Stripe and Supabase keys, public .env and .git files, and missing security headers. Secrets are always redacted."
  },
  accessibility: {
    path: "/accessibility",
    title: "Accessibility Checker for AI-Built Websites",
    description:
      "Find the accessibility mistakes AI builders make: unlabelled icon buttons, placeholder-only forms, disabled zoom and missing alt text, with plain-English fixes."
  }
}

/** Organization + WebSite structured data, shared by every page. */
export const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: "WozTech",
      url: "https://www.woztech.world"
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#org` }
    }
  ]
}

/** SoftwareApplication + FAQPage structured data for one audit page. */
export function auditPageJsonLd({ name, path, description, faqs }) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name,
        url: `${SITE_URL}${path}`,
        description,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        publisher: { "@id": `${SITE_URL}/#org` }
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map(f => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a }
        }))
      }
    ]
  }
}

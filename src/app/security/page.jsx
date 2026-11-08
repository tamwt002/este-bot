import SecurityAudit from "../components/audits/SecurityAudit"
import Faq from "../components/Faq"
import JsonLd from "../components/JsonLd"
import { PAGES, auditPageJsonLd } from "../lib/site"

const page = PAGES.security

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
    q: "Is it safe to have my Supabase anon key in my frontend?",
    a: "Yes, the anon (publishable) key is designed to be public, but only if Row Level Security is switched on for every table with policies that limit what each user can read and write. Without RLS, anyone with that key can read or change your whole database. Your service_role or secret key must never be in frontend code."
  },
  {
    q: "What should I do if my API key is exposed?",
    a: "Revoke or rotate the key straight away in the provider's dashboard, then move any code that uses it into a server-side route or function that reads it from a private environment variable. Check the provider's usage and billing for anything unexpected. Just deleting the key from your code isn't enough, because old versions can still be cached or sitting in your git history."
  },
  {
    q: "Why is a public .env file so dangerous?",
    a: "A .env file usually holds every password, API key and database URL your app uses. If it can be downloaded from your site, anyone can take them all at once. Block access to it on your host, remove it from your deployed files and rotate every secret it contained."
  },
  {
    q: "Will scanning my site show my secrets to anyone?",
    a: "No. Any key EsteBot finds is redacted on the server, so only a few characters are ever shown. It checks whether sensitive files are reachable but never displays their contents, and nothing is stored. Only scan sites you own or have permission to test."
  },
  {
    q: "Is this a full security audit or penetration test?",
    a: "No. EsteBot checks the public parts of your site for the most common mistakes in AI-built apps. A good result doesn't guarantee your site is secure, so for anything handling payments or sensitive data, consider a professional review."
  }
]

export default function SecurityPage() {
  return (
    <>
      <JsonLd data={auditPageJsonLd({ name: "EsteBot Security Checker", path: page.path, description: page.description, faqs: FAQS })} />
      <SecurityAudit />
      <Faq faqs={FAQS} />
    </>
  )
}

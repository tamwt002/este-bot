"use client"
import AuditPage from "../components/AuditPage"
import SecurityAuditSection from "../components/SecurityAuditSection"

const STEPS = [
  "Connecting to your site",
  "Checking HTTPS and security headers",
  "Sniffing your JavaScript for leaked keys",
  "Checking for exposed .env and .git files",
  "Checking cookies and CORS",
  "Working out your score"
]

const CHECKS = [
  {
    title: "Leaked secrets",
    icon: "key",
    items: [
      "OpenAI, Anthropic, Stripe keys in your JS",
      "Supabase service_role and AWS keys",
      "Database URLs with passwords",
      "Downloadable .env and .git files"
    ]
  },
  {
    title: "Vibe-code slip-ups",
    icon: "file",
    items: [
      "Dev server running in production",
      "Public source maps",
      "Supabase RLS and Firebase rules reminders",
      "Version-leaking headers"
    ]
  },
  {
    title: "Locks on the doors",
    icon: "shield",
    items: [
      "HTTPS and HTTP→HTTPS redirect",
      "HSTS, CSP and clickjacking protection",
      "Cookie flags",
      "Risky CORS settings"
    ]
  }
]

export default function SecurityAuditPage() {
  return (
    <AuditPage
      kind="Security"
      endpoint="/api/security-audit"
      title="Is your site leaking secrets?"
      intro="AI tools ship fast, and sometimes they ship your API keys too. EsteBot checks your live site for the security mistakes vibe-coded apps make most."
      greeting="Only point me at sites you own, eh? I'll keep anything I find to myself."
      steps={STEPS}
      checks={CHECKS}
      note="Any keys I find are redacted, so you'll only see a few characters. I never show what's inside exposed files, never log in, and never try anything sneaky."
      requireConsent
      timeoutMs={60000}
      Details={SecurityAuditSection}
    />
  )
}

// Patterns for credentials that should never ship in browser JavaScript.
// Matches are always redacted before leaving the server.

export const SECRET_PATTERNS = [
  { name: "Anthropic API key", severity: "critical", re: /\bsk-ant-(?:api|admin)\d{2}-[A-Za-z0-9_-]{80,}/g },
  { name: "OpenAI API key", severity: "critical", re: /\bsk-(?:proj|svcacct|admin)-[A-Za-z0-9_-]{40,}/g },
  { name: "OpenAI API key", severity: "critical", re: /\bsk-[A-Za-z0-9]{20}T3BlbkFJ[A-Za-z0-9]{20}\b/g },
  { name: "OpenRouter API key", severity: "critical", re: /\bsk-or-v1-[a-f0-9]{64}\b/g },
  { name: "Groq API key", severity: "critical", re: /\bgsk_[A-Za-z0-9]{48,}\b/g },
  { name: "Replicate API token", severity: "critical", re: /\br8_[A-Za-z0-9]{37}\b/g },
  { name: "Hugging Face token", severity: "high", re: /\bhf_[A-Za-z0-9]{34,}\b/g },
  { name: "Stripe secret key", severity: "critical", re: /\b(?:sk|rk)_live_[A-Za-z0-9]{20,}\b/g },
  { name: "Stripe test secret key", severity: "medium", re: /\b(?:sk|rk)_test_[A-Za-z0-9]{20,}\b/g },
  { name: "Supabase secret key", severity: "critical", re: /\bsb_secret_[A-Za-z0-9_-]{20,}/g },
  { name: "AWS access key ID", severity: "high", re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g },
  { name: "GitHub token", severity: "critical", re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/g },
  { name: "GitHub token", severity: "critical", re: /\bgithub_pat_[A-Za-z0-9_]{60,}\b/g },
  { name: "Slack token", severity: "high", re: /\bxox[abprs]-[A-Za-z0-9-]{10,}/g },
  { name: "SendGrid API key", severity: "critical", re: /\bSG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}\b/g },
  { name: "Private key", severity: "critical", re: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/g },
  {
    name: "Database connection string with password",
    severity: "critical",
    re: /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|rediss):\/\/[^\s:@/"'`]+:[^\s@/"'`]+@[^\s"'`<>]+/g
  }
]

const JWT_RE = /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g

/**
 * Shows enough to recognise the key, never enough to use it.
 */
export function redact(value) {
  if (value.startsWith("-----BEGIN")) return value
  const protoMatch = value.match(/^([a-z+]+:\/\/)/i)
  if (protoMatch) return `${protoMatch[1]}…:••••@…`
  const prefix = value.match(/^[A-Za-z]+[_-](?:[A-Za-z]+[_-])?/)?.[0] || value.slice(0, 4)
  return `${prefix.slice(0, 12)}…${value.slice(-4)}`
}

/**
 * Scan one JavaScript/HTML source.
 * @returns {{ secrets: Array, supabaseAnon: boolean, supabaseUrl: boolean, firebase: boolean }}
 */
export function scanSource(source) {
  const secrets = []

  for (const { name, severity, re } of SECRET_PATTERNS) {
    for (const match of source.matchAll(re)) {
      secrets.push({ name, severity, value: match[0] })
    }
  }

  // Supabase keys are JWTs; the role claim says which kind.
  let supabaseAnon = false
  for (const match of source.matchAll(JWT_RE)) {
    const payload = decodeJwtPayload(match[0])
    if (!payload) continue
    if (payload.role === "service_role") {
      secrets.push({ name: "Supabase service_role key", severity: "critical", value: match[0] })
    } else if (payload.role === "anon" && /supabase/i.test(payload.iss || "")) {
      supabaseAnon = true
    }
  }

  return {
    secrets,
    supabaseAnon: supabaseAnon || /\bsb_publishable_[A-Za-z0-9_-]{20,}/.test(source),
    supabaseUrl: /https:\/\/[a-z0-9]{20}\.supabase\.co/.test(source),
    firebase: /\.firebaseapp\.com|firebaseio\.com|firebasestorage\.app/.test(source)
  }
}

function decodeJwtPayload(token) {
  try {
    const part = token.split(".")[1]
    return JSON.parse(Buffer.from(part, "base64url").toString("utf8"))
  } catch {
    return null
  }
}

# EsteBot

**EsteBot is a pre-launch checker for vibe-coded websites.** If you built your app with Lovable, Bolt, v0, Cursor, Replit or any other AI tool, paste in the URL and EsteBot checks for the SEO and security mistakes AI-built sites make most: API keys shipped in frontend JavaScript, downloadable `.env` files, blank pages that Google can't read, template titles, leftover `noindex` tags, and more.

Every issue comes with a plain-English explanation, a severity, an A–F grade, and a **"Copy fix prompt"** button that produces a ready-to-paste instruction for your AI coding tool.

Live at **https://www.woztech.world/Esteban**. Built by [Tinotenda Tamangani](https://wallace.woztech.world) / WozTech.

> ⚠️ Only scan sites you own or have permission to test. See the [Disclaimer & Acceptable Use](https://www.woztech.world/Esteban/disclaimer) policy.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [API Reference](#api-reference)
- [Scoring](#scoring)
- [Deployment](#deployment)
- [Security](#security)
- [Legal Pages](#legal-pages)
- [Known Limitations & Roadmap](#known-limitations--roadmap)

---

## Features

### SEO Audit (`/Esteban`)
Focused on what goes wrong with AI-built sites:
- **Blank page for crawlers**: detects client-side-rendered SPA shells (empty `#root`/`#app`, almost no text in the HTML). This is the #1 SEO problem for Vite/React apps.
- **Template defaults**: titles like "Vite + React", "Create Next App" or "Lovable App", default descriptions, `vite.svg` favicons, and the builder's placeholder social image.
- **Blocked indexing**: `noindex` in meta robots or the `X-Robots-Tag` header, and `robots.txt` that disallows everything.
- **Leftover dev URLs**: `localhost` in canonical or Open Graph tags.
- **Basics**: title and description presence and length, canonical, viewport, `lang`, H1, image alt text, Open Graph/Twitter tags, `sitemap.xml`, structured data, HTTPS, mixed content.
- **Stack detection**: Lovable, Bolt, v0, Replit, Next.js, Vite, Framer, Webflow and more.

### Security Audit (`/Esteban/security`)
Requires the user to confirm they own the site or have permission to test it.
- **Secret keys in frontend code**: scans the page and up to 20 of the site's own JavaScript bundles for OpenAI, Anthropic, OpenRouter, Groq, Replicate, Hugging Face, Stripe, Supabase `service_role`/`sb_secret_`, AWS, GitHub, Slack and SendGrid keys, private keys, and database URLs with passwords. **Values are always redacted**, e.g. `sk-proj-…a1b2`.
- **Exposed files**: `/.env`, `/.env.local`, `/.env.production`, `/.git/config`, `/.git/HEAD`. Content is validated to avoid SPA false positives and **never returned**.
- **Public source maps** and a **dev server running in production** (Vite HMR, webpack-hmr, React Refresh).
- **Transport**: HTTPS, HTTP→HTTPS redirect, HSTS presence and `max-age`.
- **Headers**: CSP presence and weakness (`unsafe-eval`, wildcards), clickjacking protection, `nosniff`, Referrer-Policy, Permissions-Policy, `X-Powered-By`/version leaks.
- **CORS**: wildcard, or reflected origin combined with credentials.
- **Cookies**: missing `Secure`, `HttpOnly` (session cookies) and `SameSite`.
- **Supabase / Firebase detected**: reminders to check RLS and Security Rules. EsteBot never queries the database itself.

### Report
- A–F grade and 0–100 score, issue counts by severity
- Each finding has a plain-English explanation, evidence and a "How to fix" note, plus a **Copy fix prompt** button
- Passed checks and raw technical details shown in collapsible sections

---

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Framework  | [Next.js 16](https://nextjs.org) (App Router) with the React Compiler enabled |
| UI         | React 19, Tailwind CSS v4, Inter (via `next/font`) |
| HTTP       | `axios` via an SSRF-safe wrapper (`lib/safeFetch.js`) |
| Parsing    | `cheerio` (server-side HTML parsing) |
| Linting    | ESLint 9 + `eslint-config-next` |
| Language   | JavaScript (path alias `@/*` → `src/*`, see `jsconfig.json`) |

---

## Getting Started

### Prerequisites
- **Node.js 20.9+** (required by Next.js 16)
- npm (a `package-lock.json` is committed)

### Install & run

```bash
git clone https://github.com/tamwt002/este-bot.git
cd este-bot
npm install
npm run dev
```

Open [http://localhost:3000/Esteban](http://localhost:3000/Esteban) (`/` redirects there).

- `/Esteban` – SEO Audit
- `/Esteban/security` – Security Audit
- `/Esteban/bot` – info page for site owners about the EsteBot crawler

The app runs under the `/Esteban` base path (see `next.config.mjs`) because production lives at **https://www.woztech.world/Esteban**.

### Environment variables
None required. The app has no database, API keys, or external services — it only makes outbound HTTP requests to the URLs you audit.

---

## Available Scripts

| Command         | Description |
|-----------------|-------------|
| `npm run dev`   | Start the dev server on port 3000 |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint`  | Run ESLint |

---

## Project Structure

```
src/app/
├── layout.js                     # Root layout, Navbar, Footer, global metadata
├── page.js                       # SEO Audit page
├── opengraph-image.js            # Generated 1200×630 social preview image
├── twitter-image.js              # Same image for Twitter/X cards
├── globals.css                   # Tailwind entry
├── security/page.jsx             # Security Audit page (with permission checkbox)
├── privacy/page.jsx              # Privacy Policy
├── disclaimer/page.jsx           # Disclaimer & Acceptable Use
├── bot/page.jsx                  # Info page for site owners about the EsteBot crawler
├── api/
│   ├── audit/route.js            # POST /api/audit – SEO audit (+ robots.txt, sitemap)
│   └── security-audit/route.js   # POST /api/security-audit – security audit (consent required)
├── lib/
│   ├── seoChecks.js              # SEO checks → findings
│   ├── securityChecks.js         # Headers, bundles, exposed files, CORS, cookies → findings
│   ├── secretPatterns.js         # Secret-key regexes, Supabase JWT role detection, redaction
│   ├── findings.js               # Finding shape, scoring/grade, stack detection
│   ├── safeFetch.js              # SSRF-safe HTTP client, bot-challenge detection, User-Agent
│   └── rateLimit.js              # Per-IP rate limiter for API routes
└── components/
    ├── Navbar.jsx / Footer.jsx
    ├── UrlForm.jsx               # URL input, optional permission checkbox
    ├── FindingsReport.jsx        # Grade, findings, copy-prompt buttons, passed checks
    ├── AuditSection.jsx          # Raw SEO details
    ├── SecurityAuditSection.jsx  # Raw security details
    ├── ScoreCard.jsx
    └── LegalSection.jsx          # Shared layout for legal pages
```

---

## How It Works

```
Browser (UrlForm) ──POST {url}──▶ Next.js API route ──HTTP GET (safeFetch)──▶ Target site
        ▲                               │                                      (page, JS bundles,
        └──── JSON report (findings) ◀──┘                                       robots, sitemap, probes)
```

1. The user submits a URL; Security Audits also send `consent: true` from the checkbox.
2. The API route fetches the target **server-side** through `safeFetch` (SSRF-protected).
3. Bot-protection challenges (e.g. Cloudflare "Just a moment…") are detected and reported as an error, **not bypassed**.
4. Checks in `src/app/lib/` produce a list of findings, which `findings.js` scores.
5. `FindingsReport` renders the grade, findings and fix prompts; raw data is under "Technical details".

**SEO fetches:** page (15s, 5 MB, up to 5 redirects), `robots.txt` (5s), `sitemap.xml` or the one declared in robots.txt (5s, 10 MB).

**Security fetches:** first response without following redirects (for headers, sent with a test `Origin` to detect CORS reflection), the final page if it redirected, `http://` version (redirect check), up to 20 same-site scripts (8s, 5 MB each), 5 sensitive-file probes (64 KB cap), up to 3 source maps (headers only).

---

## API Reference

### `POST /api/audit`

Request:
```json
{ "url": "https://example.com" }
```

### `POST /api/security-audit`

Request:
```json
{ "url": "example.com", "consent": true }
```
`consent` must be `true`, or the request is rejected with `400`.

### Response (both endpoints, abridged)
```json
{
  "url": "https://example.com/",
  "status": 200,
  "stack": ["Lovable", "Vite"],
  "summary": { "score": 42, "grade": "F", "counts": { "critical": 1, "high": 1, "medium": 2, "low": 3, "info": 0 } },
  "findings": [
    {
      "id": "empty-shell",
      "severity": "critical",
      "title": "Search engines see a blank page",
      "detail": "Plain-English explanation…",
      "fix": "Instruction to paste into an AI coding tool…",
      "evidence": "optional, never a full secret"
    }
  ],
  "passed": ["Mobile viewport is set", "…"],
  "onPage": { "…": "SEO endpoint only: raw on-page data" },
  "checks": { "…": "security endpoint only: raw header/secret/exposure data" }
}
```

### Errors
| Status | Meaning |
|--------|---------|
| 400 | Missing/invalid URL, blocked address (private/internal), bad scheme/port/credentials, missing consent |
| 413 | Page too large |
| 415 | URL did not return HTML (SEO) |
| 422 | Blocked by the site's bot protection |
| 429 | Rate limit exceeded (+ `Retry-After`) |
| 502 / 504 | Site not found, unreachable, too many redirects, or timed out |
| 500 | Unexpected error |

---

## Scoring

Each audit starts at 100 and loses points per finding: **critical −30, high −15, medium −7, low −3, info 0**. Any critical finding caps the score at 49 (grade F).

| Grade | Score |
|-------|-------|
| A | 90–100 |
| B | 80–89 |
| C | 65–79 |
| D | 50–64 |
| F | 0–49 |

---

## Deployment

Production URL: **https://www.woztech.world/Esteban**

The app is configured with `basePath: "/Esteban"`, so every page, API route and asset is served under that prefix. Deploy it as its own project (e.g. on [Vercel](https://vercel.com)), then have the main `woztech.world` site forward `/Esteban` traffic to it.

If the main site is also a Next.js app, add a rewrite there ([multi-zones](https://nextjs.org/docs/app/guides/multi-zones)):

```js
// next.config.js of the main woztech.world site
async rewrites() {
  return [
    { source: "/Esteban", destination: "https://<este-bot-deployment>.vercel.app/Esteban" },
    { source: "/Esteban/:path*", destination: "https://<este-bot-deployment>.vercel.app/Esteban/:path*" }
  ]
}
```

On any other host, the equivalent is a reverse-proxy rule sending `/Esteban/*` to this app **without stripping the prefix**.

Notes:
- The path is case-sensitive: `/Esteban` works, `/esteban` returns 404. Add a redirect on the main site if you want lowercase to work.
- `metadataBase` in `src/app/layout.js` is set to the production URL so social previews (generated by `opengraph-image.js`) resolve correctly.
- Behind a proxy, make sure the real visitor IP is forwarded in `x-forwarded-for`, or every visitor will share one rate-limit bucket.
- API calls in client components use `process.env.NEXT_PUBLIC_BASE_PATH`, because `fetch()` does not add `basePath` automatically.

Local production build:

```bash
npm run build
npm run start
```

Before going public, read the [Security](#security) section.

---

## Security

All outbound requests go through `src/app/lib/safeFetch.js`, which protects against SSRF:

- Only `http:`/`https:` on ports 80/443; URLs with embedded credentials are rejected.
- Hostnames are resolved **at connect time** and any private, loopback, link-local (cloud metadata), CGNAT, multicast or reserved IPv4/IPv6 address is blocked (also defeats DNS rebinding).
- Redirects are followed manually (max 5) and **every hop** is re-validated.
- Timeouts (15s page / 10s headers / 5s robots.txt) and a 5 MB response cap.
- Users only ever see generic error messages, never raw network errors.

Both API routes are rate-limited to **10 requests per minute per IP** (`src/app/lib/rateLimit.js`). The limiter is in-memory, so on serverless hosts each instance counts separately; swap in a shared store (e.g. Upstash Redis) for a strict global limit. Client IPs come from `x-forwarded-for`, which is trustworthy on Vercel but should be set by your reverse proxy elsewhere.

Detected secrets are redacted on the server and sensitive-file contents are never returned. Bot-protection challenges are respected, never bypassed.

Bot requests identify as `EsteBot/1.0 (+https://www.woztech.world/Esteban/bot)`; the info page lives at `/Esteban/bot`.

---

## Legal Pages

- `/Esteban/privacy`: Privacy Policy (no accounts, cookies or analytics; URLs and results aren't stored; IPs held in memory for rate limiting).
- `/Esteban/disclaimer`: Disclaimer & Acceptable Use (authorised testing only, no harvesting, no warranty, limitation of liability).

These are written as sensible defaults, not legal advice. Have them reviewed if EsteBot becomes a commercial service.

---

## Known Limitations & Roadmap

- Sites behind bot protection (Cloudflare challenge, etc.) can't be audited unless the owner allows the EsteBot user agent.
- Only the submitted page is audited (no multi-page crawl).
- Script scanning covers the site's own domain/subdomains, not third-party CDNs.
- Supabase RLS and Firebase rules are flagged as reminders, not tested, by design.
- Secret detection is pattern-based; unusual key formats can be missed.
- No automated test suite in the repo yet.

---

## License

Private — © WozTech. All rights reserved.

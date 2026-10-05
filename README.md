# EsteBot

**EsteBot** is a lightweight web auditing tool built with Next.js. Paste in a URL and it runs either an **SEO audit** (on-page metadata, headings, content, links, social tags, structured data) or a **Security audit** (HTTPS, HSTS, security headers, server information exposure).

Built by [Tinotenda Tamangani](https://wallace.woztech.world) / WozTech.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [API Reference](#api-reference)
- [Audit Rules](#audit-rules)
- [Deployment](#deployment)
- [Security](#security)
- [Known Limitations & Roadmap](#known-limitations--roadmap)

---

## Features

### SEO Audit (`/`)
- **Title tag** – value, length, and count (flags duplicates)
- **Meta description** – value and length
- **Canonical URL** – detects missing or mismatched canonicals
- **Robots meta** – detects `noindex` / `nofollow`
- **Viewport** – checks for `width=device-width`
- **Headings** – full H1–H6 outline and H1 count
- **Content** – word count with thin-content flag (< 300 words)
- **Images** – total count, images missing `alt`, `http://` (mixed content) sources
- **Links** – internal vs. external link counts
- **Open Graph** and **Twitter Card** tags
- **Structured data** – parses all `application/ld+json` blocks
- **robots.txt** – fetched from the site root and included in the report
- **HTTPS** status

### Security Audit (`/security`)
- **Transport** – HTTPS and `Strict-Transport-Security` (HSTS)
- **Security headers** – `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` (scored out of 5)
- **Information exposure** – leaked `Server` and `X-Powered-By` headers
- Summary score cards (Good / Needs work)

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
git clone <repo-url> este-bot
cd este-bot
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- `/` – SEO Audit
- `/security` – Security Audit

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
├── layout.js                     # Root layout, Navbar, global metadata & Open Graph
├── page.js                       # SEO Audit page (client component)
├── globals.css                   # Tailwind entry
├── security/
│   └── page.jsx                  # Security Audit page (client component)
├── bot/
│   └── page.jsx                  # /bot – info page for site owners about EsteBot
├── api/
│   ├── audit/route.js            # POST /api/audit – SEO audit endpoint
│   └── security-audit/route.js   # POST /api/security-audit – security endpoint
├── lib/
│   ├── seoChecks.js              # runSeoChecks(html, url, status) – cheerio-based checks
│   ├── securityChecks.js         # runSecurityChecks(url) – header inspection
│   ├── safeFetch.js              # SSRF-safe HTTP client + EsteBot User-Agent
│   └── rateLimit.js              # Per-IP rate limiter for API routes
└── components/
    ├── Navbar.jsx                # Top nav with active-route highlighting
    ├── UrlForm.jsx               # Shared URL input + submit button
    ├── AuditSection.jsx          # Renders the SEO report
    ├── SecurityAuditSection.jsx  # Renders the security report
    └── ScoreCard.jsx             # Summary card (Good / Needs work)
```

---

## How It Works

```
Browser (UrlForm) ──POST {url}──▶ Next.js API route ──HTTP GET──▶ Target site
        ▲                               │
        └──────── JSON report ◀─────────┘
```

1. The user submits a URL through `UrlForm`.
2. The page POSTs `{ url }` to the matching API route.
3. The route fetches the target **server-side** (avoiding CORS) and runs the checks in `src/app/lib/`.
4. A JSON report is returned and rendered by `AuditSection` or `SecurityAuditSection`.

**SEO fetch details:** 15s timeout, up to 5 redirects (each re-validated), 5 MB cap. Non-HTML responses are rejected with `415`. `robots.txt` is fetched separately with a 5s timeout (failure is non-fatal).

**Security fetch details:** redirects are not followed, so headers are read from the *first* response. A URL without a scheme is prefixed with `https://`.

---

## API Reference

### `POST /api/audit`

Request:
```json
{ "url": "https://example.com" }
```

Response `200` (abridged):
```json
{
  "url": "https://example.com/",
  "status": 200,
  "robotsTxt": "User-agent: *\n...",
  "onPage": {
    "title":           { "value": "...", "length": 42, "count": 1, "all": ["..."], "ok": true },
    "metaDescription": { "value": "...", "length": 150, "ok": true },
    "canonical":       { "value": "...", "selfReferencing": true, "mismatch": false },
    "robots":          { "value": "index,follow", "noindex": false, "nofollow": false },
    "viewport":        { "value": "width=device-width, initial-scale=1", "ok": true },
    "headings":        { "h1Count": 1, "h1s": ["..."], "all": [{ "tag": "h1", "text": "..." }] },
    "content":         { "wordCount": 812, "thin": false },
    "images":          { "total": 10, "missingAlt": 2, "mixedContent": [] },
    "links":           { "internal": [], "external": [], "internalCount": 30, "externalCount": 4 },
    "openGraph":       { "title": "", "description": "", "image": "", "url": "" },
    "twitter":         { "card": "", "title": "", "description": "", "image": "" },
    "schema":          [],
    "security":        { "https": true, "mixedContent": false }
  }
}
```

Errors:
| Status | Body |
|--------|------|
| 400 | `{ "error": "URL required" }` / `{ "error": "Invalid URL format" }` |
| 400 | `{ "error": "That address is not allowed" }` (private/internal target), bad scheme/port/credentials |
| 413 | `{ "error": "The page is too large to audit" }` |
| 415 | `{ "error": "URL did not return HTML" }` |
| 429 | `{ "error": "Too many requests..." }` (+ `Retry-After` header) |
| 502 / 504 | Site not found, unreachable, too many redirects, or timed out |
| 500 | `{ "error": "Failed to fetch URL" }` |

### `POST /api/security-audit`

Request:
```json
{ "url": "example.com" }
```

Response `200`:
```json
{
  "url": "https://example.com",
  "status": 200,
  "checks": {
    "transport": { "https": true, "hsts": true },
    "headers": {
      "csp": false,
      "xFrame": true,
      "xContentType": true,
      "referrerPolicy": true,
      "permissionsPolicy": false
    },
    "exposure": { "server": "nginx", "xPoweredBy": null }
  }
}
```

Errors: same as above (`400`, `429`, `502`, `504`), plus `500 { "error": "Security audit failed" }`.

---

## Audit Rules

| Check | Passes when |
|-------|-------------|
| Title | Exactly one `<title>`, 30–60 characters |
| Meta description | 120–160 characters |
| Canonical | `href` exactly equals the audited URL (otherwise flagged as mismatch) |
| Viewport | Contains `width=device-width` |
| Content | ≥ 300 words in `<body>` |
| Images | Every `<img>` has a non-empty `alt` |
| Security headers card | ≥ 4 of 5 headers present |
| Info exposure card | Neither `Server` nor `X-Powered-By` is sent |

---

## Deployment

The app is a standard Next.js project with Node.js API routes, so it deploys as-is to [Vercel](https://vercel.com) or any Node host:

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

Bot requests identify as `EsteBot/1.0 (+https://wallace.woztech.world/bot)`; the info page lives at `/bot`.

---

## Known Limitations & Roadmap

- Header checks are presence-only; header *values* (e.g. weak CSP, short HSTS `max-age`) aren't evaluated.
- Canonical comparison is an exact string match, so `https://example.com` vs `https://example.com/` or relative canonicals are flagged as mismatches.
- An empty `<body>` reports a word count of 1.
- Internal/external link classification is a simple string match on the host.
- `ScoreCard` and the `ok` flags on title/description aren't yet surfaced in the SEO report UI.
- No automated tests yet.

---

## License

Private — © WozTech. All rights reserved.

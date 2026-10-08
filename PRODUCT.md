# Product

## Register

product

## Users
Vibe coders: people who build websites and apps with AI tools (Lovable, Bolt, v0, Cursor, Replit), often without a security or SEO background. They arrive just before (or just after) launching, paste their URL, and want to know "is my site OK?" in plain English. Many are non-technical founders, indie hackers and students; most work in dark-mode editors.

## Product Purpose
EsteBot scans a live site for the SEO and security mistakes AI-built sites make most (leaked API keys in frontend code, exposed .env files, blank pages for crawlers, template titles, missing headers) and turns each into a plain-English finding with a copy-paste fix prompt for their AI tool. Success: a user goes from URL to "I know exactly what to fix, and I've pasted the fixes into my AI tool" in under two minutes, without feeling stupid or scared.

## Brand Personality
Friendly, cheeky, encouraging. The kiwi is a character, not just a logo: warm, a bit of humour, never condescending. Serious problems are stated clearly and calmly (a leaked key is urgent, not a joke), but the overall tone is "your helpful mate checked your homework", not "security scanner found violations".

## Anti-references
- Generic AI-startup SaaS: purple/indigo gradients, glassy hero cards, stock "trusted by" strips, hero metrics.
- Enterprise security dashboards: red-alert walls, dense tables, fear-driven copy.
- Bare template look (default Next.js/Tailwind, black buttons on white) — ironic for a tool that flags template defaults.

Positive reference: Duolingo — mascot-led, colourful, chunky friendly shapes, encouraging feedback, clear progress.

## Design Principles
1. **Practice what we preach.** EsteBot's own site must pass its own audits and never look like a template.
2. **Plain English first, detail on demand.** Lead with what it means and what to do; technical evidence is one tap away.
3. **Fix, don't frighten.** Every problem comes with a next action (copy fix prompt). Severity is honest, tone is calm.
4. **Kiwi warmth, report clarity.** Personality lives in the chrome, empty/loading states and microcopy; the report itself stays scannable and precise.
5. **Respect the reader's site and others'.** Ethics (permission, redaction) are visible, not buried.

## Accessibility & Inclusion
WCAG 2.1 AA: 4.5:1 text contrast in both themes, severity never conveyed by colour alone (labels/icons too), full keyboard use, visible focus, `prefers-reduced-motion` respected. Dark theme is the default; light theme available.

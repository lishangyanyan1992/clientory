# Clientory

**Marketing site and blog for the Clientory AI visibility platform.**

The public website at [clientory.org](https://clientory.org) contains Clientory's landing pages, educational content, comparisons, pricing information, and blog. Product CTAs send visitors to the application at [app.clientory.org](https://app.clientory.org), where authentication, scans, account management, and payments are handled.

**This repository is marketing-only.** The product is built and deployed separately. Its former implementation — API server, database, integrations, and eval suite — was removed on 8 August 2026; see [LEGACY_APP_ARCHIVE.md](./LEGACY_APP_ARCHIVE.md).

---

## What Clientory does

Clientory checks whether AI assistants recommend a law firm when prospective clients ask for one.

| Tier | Prompts per scan | AI models |
|---|---|---|
| Free report | 5 | ChatGPT, Claude |
| Subscription ($10/mo per firm) | 25 | ChatGPT, Claude, Gemini |

Perplexity, Copilot, and other AI search engines are on the roadmap and are **not** live. Marketing copy must not present them as current coverage.

These numbers are defined in `artifacts/clientory/src/lib/model-coverage.ts` and `src/lib/billing-config.ts`. Edit the constants rather than the prose, and keep them matched to what the product actually runs.

---

## Repository structure

```
artifacts/
  clientory/          React + Vite marketing site (deployed on Vercel)
  mockup-sandbox/     Design sandbox, not deployed

lib/
  billing/            Plan numbers read by the pricing page

scripts/              Workspace tooling
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Site | React 19, Vite, Tailwind CSS v4, Radix UI, shadcn/ui |
| Routing | React Router |
| Observability | Sentry (errors), PostHog (analytics) |
| Monorepo | pnpm workspaces |

---

## Local development

### Prerequisites

- Node.js 24+
- pnpm

### Setup

```bash
pnpm install

# Start the site (default port 5173)
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/clientory run dev
```

No database, API server, or API keys are needed — the site is fully static.

### Other useful commands

```bash
# Type-check all packages
pnpm run typecheck

# Production build (what Vercel runs)
sh ../build-vercel.sh
```

---

## Environment variables

All optional — the site builds and runs without any of them.

| Variable | Description |
|---|---|
| `VITE_SENTRY_DSN` | Sentry DSN for error tracking |
| `VITE_POSTHOG_KEY` | PostHog project key; analytics is disabled when absent |
| `VITE_POSTHOG_HOST` | Optional PostHog API host; defaults to the US cloud endpoint |

There are deliberately **no payment or AI provider keys here.** Payments are handled entirely at app.clientory.org, and this is a static build with no server to keep a secret in.

---

## Deployment

| Service | Platform | Notes |
|---|---|---|
| Marketing site | Vercel | `artifacts/clientory`; build output at `dist/public`; routing and security headers from the root `vercel.json` |

The Railway service that hosted the former API server was shut down on 8 August 2026.

---

## Security

- **XSS** — React auto-escapes JSX; `dangerouslySetInnerHTML` usage is HTML-escaped before injection
- **CSP** — `Content-Security-Policy` header delivered via `vercel.json`
- **Secrets** — none required; `.env*` files are gitignored

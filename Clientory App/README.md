# Clientory

**AI visibility scanner for immigration law firms.**

Clientory tells immigration attorneys whether ChatGPT, Claude, and Gemini recommend their firm when a prospective client asks about green cards, visas, naturalization, or removal defense. It generates a visibility score, surfaces which AI assistants mention the firm and on which queries, and gives concrete steps to improve.

Live at → **[clientory.org](https://clientory.org)**

---

## How it works

1. **Firm profile** — an attorney enters their firm name, location, services, and competitors.
2. **Prompt generation** — Claude Haiku generates a set of realistic prospect queries ("symptom queries") tailored to the firm's deliverables and geography.
3. **Multi-provider scan** — each prompt is sent to GPT, Claude Sonnet, and Gemini in parallel. Responses are checked for firm mentions.
4. **Visibility score** — percentage of AI responses that mention the firm, broken down by provider.
5. **Report** — a detailed report with provider-by-provider results, recommendations, and a 30-day result cache so re-runs on the same firm are instant.

**Free tier:** one scan per account, no credit card required.  
**Paid tier:** $10/month per firm, 4 scans per billing cycle.

---

## Monorepo structure

```
artifacts/
  clientory/          React + Vite frontend (deployed on Vercel)
  api-server/         Express 5 API (deployed on Railway)

lib/
  api-spec/           OpenAPI spec (source of truth for the API contract)
  api-zod/            Zod validation schemas generated from the spec
  api-client-react/   React Query hooks generated from the spec
  billing/            Plan config shared between frontend and backend
  db/                 PostgreSQL schema + Drizzle ORM client
  integrations-openai-ai-server/   OpenAI helpers for the API server
  integrations-openai-ai-react/    OpenAI helpers for the frontend
  integrations-anthropic-ai/       Anthropic helpers
  integrations-gemini-ai/          Gemini helpers

evals/                PromptFoo eval suite for the symptom-query prompt
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, Radix UI, shadcn/ui |
| Backend | Node.js 24, Express 5, TypeScript |
| Database | PostgreSQL, Drizzle ORM |
| AI providers | OpenAI (GPT), Anthropic (Claude), Google (Gemini) |
| Auth | Email OTP + optional password; HMAC-signed tokens |
| Billing | Stripe (checkout + customer portal) |
| Email | Resend |
| Observability | Langfuse (AI traces via OpenTelemetry), Sentry (errors) |
| Bot protection | Cloudflare Turnstile |
| Monorepo | pnpm workspaces |

---

## Local development

### Prerequisites

- Node.js 24+
- pnpm
- A PostgreSQL database (local or remote)

### Setup

```bash
# 1. Install all workspace dependencies
pnpm install

# 2. Copy the env template and fill in your keys
cp .env.example .env.local   # or create .env.local manually — see env vars below

# 3. Push the database schema
pnpm --filter @workspace/db run push

# 4. Start the API server (default port 3003)
pnpm --filter @workspace/api-server run dev

# 5. Start the frontend in a second terminal (default port 5173)
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/clientory run dev
```

The frontend proxies all `/api/*` requests to `http://localhost:3003` during development.

### Other useful commands

```bash
# Type-check all packages
pnpm run typecheck

# Build all packages
pnpm run build

# Run tests (api-server)
pnpm --filter @workspace/api-server run test

# Regenerate API client + Zod schemas from the OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Run the PromptFoo eval suite
npx promptfoo eval --config evals/promptfooconfig.yaml
```

---

## Environment variables

### Backend (`artifacts/api-server`) — required

| Variable | Description |
|---|---|
| `PORT` | Port the API server listens on |
| `DATABASE_URL` | PostgreSQL connection string |
| `EMAIL_TOKEN_SECRET` | Secret used to sign email/session tokens (min 32 chars) |
| `OPENAI_API_KEY` | OpenAI key — used for GPT visibility queries |
| `ANTHROPIC_API_KEY` | Anthropic key — used for Claude visibility queries and Haiku prompt generation |
| `GOOGLE_API_KEY` | Google AI key — used for Gemini visibility queries |

### Backend — optional

| Variable | Default | Description |
|---|---|---|
| `OPENAI_MODEL` | `gpt-5.2` | OpenAI model used for scan queries |
| `ANTHROPIC_QUERY_MODEL` | `claude-sonnet-4-6` | Anthropic model used for scan queries |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Gemini model used for scan queries |
| `SYMPTOM_MODEL` | `claude-haiku-4-5` | Haiku model used for symptom-query generation |
| `RESEND_API_KEY` | — | Resend key; falls back to console logging OTP codes when absent |
| `EMAIL_FROM` | — | From address for OTP emails |
| `TURNSTILE_SECRET_KEY` | — | Cloudflare Turnstile secret; CAPTCHA check is skipped when absent |
| `STRIPE_SECRET_KEY` | — | Stripe secret key for billing |
| `STRIPE_WEBHOOK_SECRET` | — | Stripe webhook signing secret |
| `STRIPE_PRICE_ID` | — | Stripe price ID for the subscription plan |
| `APP_BASE_URL` | auto-detected | Public frontend URL — used for Stripe redirect URLs and report email links |
| `APP_BASE_PATH` | — | Optional path prefix when the app URL is inferred from Vercel (e.g. `/app`) |
| `PUBLIC_APP_URL` | — | Legacy alias for `APP_BASE_URL` |
| `LANGFUSE_PUBLIC_KEY` | — | Langfuse public key; AI tracing is disabled when absent |
| `LANGFUSE_SECRET_KEY` | — | Langfuse secret key |
| `LANGFUSE_BASE_URL` | — | Langfuse endpoint (e.g. `https://us.cloud.langfuse.com`) |

### Frontend (`artifacts/clientory`) — optional

| Variable | Description |
|---|---|
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key (public); widget is hidden when absent |
| `VITE_SENTRY_DSN` | Sentry DSN for frontend error tracking |
| `API_PROXY_TARGET` | Dev-only API proxy target; defaults to `http://localhost:3003` |

---

## Deployment

| Service | Platform | Notes |
|---|---|---|
| Frontend | Vercel | `artifacts/clientory`; build output at `dist/public`; `vercel.json` proxies `/api/*` to Railway |
| API server | Railway | `artifacts/api-server`; `clientory-production.up.railway.app` |
| Database | Railway (PostgreSQL) | Connection string via `DATABASE_URL` |

### First deploy checklist

1. Set all required backend env vars in Railway.
2. Set `APP_BASE_URL` to your production frontend URL (e.g. `https://clientory.org`).
3. Configure Stripe webhook endpoint → `https://<railway-url>/api/webhooks/stripe`.
4. Set `VITE_TURNSTILE_SITE_KEY` in Vercel env vars.
5. Vercel auto-reads `vercel.json` from `artifacts/clientory` for routing and security headers.

---

## AI observability

All scan traces are sent to [Langfuse](https://langfuse.com) when `LANGFUSE_*` env vars are set. The integration uses the OpenTelemetry-native v5 SDK:

- **OpenAI calls** — auto-captured via `observeOpenAI` wrapper (model, tokens, latency, cost)
- **Anthropic + Gemini calls** — manually instrumented `generation` spans
- Each scan becomes a `visibility-scan` trace with business metadata and a nested `run-scan` span tree

Configure at [us.cloud.langfuse.com](https://us.cloud.langfuse.com).

---

## Security

- **Input validation** — all route bodies validated with Zod schemas before any DB access
- **SQL injection** — not possible; Drizzle ORM parameterises all queries
- **XSS** — React auto-escapes JSX; `dangerouslySetInnerHTML` usage is HTML-escaped before injection
- **Auth tokens** — HMAC-SHA256 signed, short-lived (email tokens: 1 h; session tokens: 30 d), token version revocation on logout
- **Rate limiting** — IP and email-level limits on login (10/15 min), OTP send (5/hr), OTP verify (5 attempts/email)
- **CORS** — explicit allowlist; only `clientory.org` and Vercel preview URLs accepted
- **CSP** — `Content-Security-Policy` header delivered via `vercel.json` on the frontend
- **Secrets** — all secrets in env vars; `.env*` files are gitignored

---

## Evals

A [PromptFoo](https://promptfoo.dev) eval suite lives in `evals/` and tests the symptom-query prompt against 15 golden deliverables using two providers (Claude Haiku production + GPT-4o-mini baseline). Assertions check word count (8–20 words), first-person phrasing, and no meta-commentary.

```bash
npx promptfoo eval --config evals/promptfooconfig.yaml
```

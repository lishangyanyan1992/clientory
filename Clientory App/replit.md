# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **AI Providers**: OpenAI, Anthropic, Gemini (via Replit AI Integrations)
- **Email**: Resend (for OTP and report delivery)

## Application: Clientory – AI Visibility Scanner

A web application that helps small personal service businesses understand how visible they are when people ask AI assistants for recommendations.

### User Flow
1. Landing page → explains the product
2. Business form → enter business info + email → email OTP verification
3. Scan progress → live SSE stream showing prompts being tested across AI providers
4. Results dashboard → visibility score, per-provider breakdown, prompt-level results, recommendations
5. Report emailed to user automatically after scan completes

### Key Features
- Generates 5 realistic search prompts using OpenAI
- Tests each prompt against ChatGPT (OpenAI), Claude (Anthropic), and Gemini
- Detects business mentions using name matching
- Calculates visibility score (0-100%)
- Provides actionable recommendations
- Results persist in database and can be revisited via URL
- Email OTP verification before scanning (abuse prevention)
- Cloudflare Turnstile CAPTCHA on OTP send (optional, enabled when TURNSTILE_SECRET_KEY is set)
- Rate limiting: 5 OTP sends/hour per IP, 10 OTP verifications/15min per IP, 5/15min per email, 1 scan per email per 30 days
- Scan result caching: same business+email combination returns cached results within 30 days
- Report email delivery via Resend after scan completion
- LLM response tokens capped at 1024 for cost efficiency

### Billing & Access Control (Stripe)
- **Free tier**: 1 free report total per user (tracked by `users.free_report_used_at`)
- **Pro tier**: $5/month per business, 4 scans per billing cycle
- Entitlement checks enforced on backend before any LLM work begins (returns HTTP 402 with `entitlementCode`)
- Business profiles (`businesses` table) created automatically on first paid subscription
- Stripe webhook handler with idempotency (`stripe_events` table)
- Usage tracking per billing period (`business_usage_periods`, `business_usage_events`)
- `/pricing` page with feature comparison
- `/settings/billing` page showing all businesses and subscription status
- Upgrade modal triggered on 402 responses in the scan form
- Feature gating in scan results (exports, history, extra recommendations locked for free users)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   │   └── src/
│   │       ├── routes/
│   │       │   ├── auth/   # OTP send + verify endpoints
│   │       │   └── scans/  # Scan CRUD + SSE stream + engine
│   │       └── services/   # email, otp, rate-limit, turnstile, scan-cache, validation
│   └── clientory/          # React + Vite frontend (landing, form, progress, results)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   ├── integrations-openai-ai-server/    # OpenAI SDK client
│   ├── integrations-openai-ai-react/     # OpenAI React hooks
│   ├── integrations-anthropic-ai/        # Anthropic SDK client
│   └── integrations-gemini-ai/           # Gemini SDK client
├── scripts/
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema

- **scans** — business info, status, score, user_email, ip_hash, business_id (nullable), is_free_report
- **scan_prompts** — generated prompts per scan with categories
- **scan_results** — per-prompt per-provider AI response and mention flag
- **otp_codes** — email verification codes (hashed), expiry, used flag
- **rate_limits** — rate limit tracking by key + time window
- **scan_cache** — cache key (hash of business+email) → scan_id mapping
- **users** — registered users with email, stripe_customer_id, free_report_used_at
- **businesses** — business profiles linked to users
- **business_subscriptions** — Stripe subscription records per business (status, periods)
- **business_usage_periods** — usage periods per business/billing cycle (scans_used, scans_limit)
- **business_usage_events** — individual scan events for usage tracking
- **stripe_events** — idempotency table for Stripe webhook events

## API Endpoints

- `GET /api/healthz` — Health check
- `POST /api/auth/send-otp` — Send OTP verification code (requires Turnstile token if configured)
- `POST /api/auth/verify-otp` — Verify OTP code, returns signed email token; upserts user record
- `POST /api/scans` — Create new scan (requires `x-email-token`; enforces entitlement before LLM work; returns 402 on limit exceeded)
- `GET /api/scans/:id` — Get scan results with prompts, results, recommendations
- `GET /api/scans/:id/stream` — SSE stream for live scan progress
- `GET /api/businesses` — List user's businesses with subscription + usage info
- `POST /api/businesses` — Create a business profile
- `POST /api/billing/subscribe` — Create Stripe checkout session for a business
- `POST /api/billing/portal` — Create Stripe billing portal session
- `GET /api/billing/status/:businessId` — Get subscription status and usage for a business
- `POST /webhooks/stripe` — Stripe webhook handler (checkout, subscription updates, invoices)

## Environment Variables

### Required
- `DATABASE_URL` — PostgreSQL connection string (auto-set by Replit)
- `EMAIL_TOKEN_SECRET` — HMAC secret for email verification tokens
- `RESEND_API_KEY` — Resend API key for sending OTP and report emails
- `EMAIL_FROM` — Sender email address (default: `Clientory <noreply@clientory.com>`)

### Optional
- `TURNSTILE_SITE_KEY` — Cloudflare Turnstile site key (frontend, set as `VITE_TURNSTILE_SITE_KEY`)
- `TURNSTILE_SECRET_KEY` — Cloudflare Turnstile secret key (backend)
- `STRIPE_SECRET_KEY` — Stripe secret key for billing
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret
- `STRIPE_PRICE_ID` — Stripe price ID for the $5/month pro plan
- `VITE_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key (frontend)

### AI Integrations (auto-configured by Replit)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` + `AI_INTEGRATIONS_OPENAI_API_KEY`
- `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` + `AI_INTEGRATIONS_ANTHROPIC_API_KEY`
- `AI_INTEGRATIONS_GEMINI_BASE_URL` + `AI_INTEGRATIONS_GEMINI_API_KEY`

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Key Commands

- `pnpm --filter @workspace/api-server run dev` — Start API server
- `pnpm --filter @workspace/clientory run dev` — Start frontend dev server
- `pnpm --filter @workspace/api-spec run codegen` — Regenerate API client hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — Push database schema changes

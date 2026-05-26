# Clientory App

Clientory App is a pnpm workspace monorepo for the Clientory product. It contains:

- `artifacts/clientory` - the React + Vite frontend
- `artifacts/api-server` - the Express API server
- `lib/*` - shared packages for billing, database access, API schemas, and provider integrations

## Stack

- Node.js 24
- pnpm workspaces
- TypeScript
- React + Vite + Tailwind CSS
- Express 5
- PostgreSQL + Drizzle ORM
- Stripe for billing
- Resend for email

## Local development

Install workspace dependencies:

```bash
pnpm install
```

Run the API server:

```bash
pnpm --filter @workspace/api-server run dev
```

Run the frontend:

```bash
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/clientory run dev
```

Useful workspace commands:

```bash
pnpm run typecheck
pnpm run build
pnpm --filter @workspace/api-spec run codegen
pnpm --filter @workspace/db run push
```

## Environment variables

Required backend variables:

- `DATABASE_URL`
- `EMAIL_TOKEN_SECRET`
- `RESEND_API_KEY`

Optional backend variables:

- `EMAIL_FROM`
- `TURNSTILE_SECRET_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID`
- `APP_BASE_URL` - public frontend URL used for Stripe redirects and report email links
- `PUBLIC_APP_URL` - legacy alias for `APP_BASE_URL`
- `APP_BASE_PATH` - optional path prefix appended when the app URL is inferred from Vercel, for example `/app`

Optional frontend variables:

- `VITE_TURNSTILE_SITE_KEY`
- `API_PROXY_TARGET` - defaults to `http://localhost:3003`

## Deployment notes

- The frontend is built separately from the API server.
- Stripe success, cancel, portal, and report-email links depend on `APP_BASE_URL` when the frontend and API are deployed on different hosts.
- Vercel deployments can infer the public domain from `VERCEL_PROJECT_PRODUCTION_URL` or `VERCEL_URL`.

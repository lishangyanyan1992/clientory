# Legacy product application archive

As of August 2, 2026, `clientory.org` is the Clientory marketing and publishing
site. The active product — authentication, scan workflow, and payments — lives
at <https://app.clientory.org> and is built and deployed from elsewhere.

## The product code was removed on 8 August 2026

It is no longer in this repository. Removed:

- `artifacts/api-server` — the Express API (auth, scans, businesses, prompt-sets)
- `lib/db`, `lib/api-zod`, `lib/api-spec`, `lib/api-client-react`, and every
  `integrations-*` package, all of which only the API server consumed
- Five unreachable pages under `artifacts/clientory/src/pages`: `scan-form`,
  `scan-progress`, `scan-results`, `firm-prompts`, `billing-settings`
- `evals/` — PromptFoo suite for the scan engine's symptom-query prompt
- Railway deploy config; the Railway service itself was shut down the same day

`lib/billing` was kept: the marketing pricing page reads plan numbers from it.
Its Stripe price-ID export was deleted — this repo holds no payment config, and
must not gain any. Payments are handled entirely in the product app.

## Where to find it

Two places:

1. **Git history.** The commit immediately before the removal holds everything,
   including work that had never been committed anywhere else:

   ```
   git show 40a9a70
   git show 40a9a70:"Clientory App/artifacts/api-server/src/app.ts"
   ```

2. **A local archive** outside any repository, on the Desktop:
   `ARCHIVE-DO-NOT-DEPLOY_clientory-product_2026-08-08/`, containing the full
   product source and a patch of the previously uncommitted work.

## Rules for this repo

- Marketing CTAs use the shared `CLIENTORY_APP_URL` constant, which points at
  app.clientory.org. `/scan/*` and `/firm/*` redirect there.
- `/pricing` is a marketing page; its conversion action sends visitors to the
  product app.
- Do not reintroduce product or API code, Stripe keys, or AI provider keys here.
  This is a static Vercel build with no server to keep a secret in.

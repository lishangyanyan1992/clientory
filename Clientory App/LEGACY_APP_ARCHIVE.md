# Legacy product application archive

As of August 2, 2026, `clientory.org` is the Clientory marketing and publishing
site. The active product, authentication, scan workflow, and payments live at
<https://app.clientory.org>.

The previous product implementation is intentionally retained in this
repository for future reference. Its frontend pages remain under
`artifacts/clientory/src/pages` and its backend implementation remains under
`artifacts/api-server/src`. Those legacy files are no longer reachable from the
marketing site's route graph. The Stripe checkout, portal, and webhook handlers
are also retained as inactive reference code but are not registered by the API
server.

Marketing CTAs should use the shared `CLIENTORY_APP_URL` constant. The local
`/pricing` route remains a marketing page, while its conversion action sends
visitors to the active application.

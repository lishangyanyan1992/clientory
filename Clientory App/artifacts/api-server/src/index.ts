// ⚠️ Must be the very first import — starts OTel before any LLM clients initialise.
import "./instrumentation";

import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env["SENTRY_DSN"],
  environment: process.env["NODE_ENV"] ?? "production",
  tracesSampleRate: 1.0,
});

import app from "./app";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is not set. Database-backed routes will fail until it is configured.");
  }
  if (!process.env.EMAIL_TOKEN_SECRET) {
    console.warn("EMAIL_TOKEN_SECRET is not set. Email verification will fail until it is configured.");
  }
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. OTP emails will use the local console fallback.");
  }
});

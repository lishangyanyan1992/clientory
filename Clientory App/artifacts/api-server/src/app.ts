import * as Sentry from "@sentry/node";
import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import router from "./routes";
import stripeWebhookRouter from "./routes/webhooks/stripe";

const app: Express = express();

app.set("trust proxy", 1);

// Security headers — sets X-Content-Type-Options, X-Frame-Options, HSTS,
// Referrer-Policy, X-DNS-Prefetch-Control, and more.
// contentSecurityPolicy is disabled here because this is a pure JSON API
// (no HTML responses) — CSP belongs on the Vercel frontend instead.
app.use(helmet({ contentSecurityPolicy: false }));

// Explicit allowlist — only our own domains can call this API from a browser.
// Vercel preview URLs (clientory-*.vercel.app) are also permitted so PR previews work.
// Server-to-server requests (Stripe webhooks, health checks) have no Origin header
// and are unaffected by CORS.
const STATIC_ORIGINS = new Set([
  "https://clientory.org",
  "https://www.clientory.org",
  "https://clientory-nu.vercel.app",
]);
const VERCEL_PREVIEW = /^https:\/\/clientory(-[a-z0-9]+)*(-lishangyanyan1992s-projects)?\.vercel\.app$/;

app.use(
  cors({
    origin(origin, callback) {
      // No origin = server-to-server (Stripe, health checks) or same-origin — allow.
      if (!origin) return callback(null, true);
      if (STATIC_ORIGINS.has(origin) || VERCEL_PREVIEW.test(origin)) {
        return callback(null, true);
      }
      // Allow localhost in non-production for local dev.
      if (process.env.NODE_ENV !== "production" && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  }),
);

app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }), stripeWebhookRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

Sentry.setupExpressErrorHandler(app);

export default app;

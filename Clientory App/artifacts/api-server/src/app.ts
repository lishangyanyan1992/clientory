import * as Sentry from "@sentry/node";
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import router from "./routes";
import stripeWebhookRouter from "./routes/webhooks/stripe";
import { runWithRequestContext, getRequestId } from "./services/request-context";

const app: Express = express();

app.set("trust proxy", 1);

// ── Request correlation ID ────────────────────────────────────────────────────
// Assigns a unique UUID to every request via AsyncLocalStorage. All downstream
// loggers (HTTP, business, security) automatically pick it up via getRequestId()
// so every log line for a single request shares the same requestId — making it
// trivial to grep or query all events for one user action.
app.use((req: Request, res: Response, next: NextFunction) => {
  runWithRequestContext(() => {
    res.setHeader("X-Request-Id", getRequestId() ?? "");
    next();
  });
});

// ── Golden-signal request logger ─────────────────────────────────────────────
// Emits one structured JSON line per request covering all four golden signals:
//   latency   → durationMs (p50/p95/p99 queryable in Better Stack / Logtail)
//   traffic   → every request is a data point; group by route for volume
//   errors    → statusCode >= 400 filterable; Sentry still captures 5xx stacks
//   saturation→ pair with Railway CPU/memory metrics in the same dashboard
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - start;
    // Normalise dynamic segments so /api/businesses/abc123 → /api/businesses/:id
    const route = (req.route?.path as string | undefined)
      ? `${req.baseUrl ?? ""}${req.route.path}`
      : req.path;
    // One JSON line — stdout on Railway is shipped to Logtail / Better Stack
    process.stdout.write(
      JSON.stringify({
        level: res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info",
        type: "http",
        requestId: getRequestId(),
        method: req.method,
        route,
        status: res.statusCode,
        durationMs,
        ts: new Date().toISOString(),
      }) + "\n",
    );
  });
  next();
});

// Security headers — sets X-Content-Type-Options, X-Frame-Options, HSTS,
// Referrer-Policy, X-DNS-Prefetch-Control, and more.
// contentSecurityPolicy is intentionally disabled: this is a pure JSON API with no HTML
// responses, so there is nothing to inject into. CSP is enforced on the Vercel frontend
// via vercel.json. CodeQL alert js/insecure-helmet-configuration is a false positive here.
// lgtm[js/insecure-helmet-configuration]
app.use(helmet({ contentSecurityPolicy: false })); // lgtm[js/insecure-helmet-configuration]

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

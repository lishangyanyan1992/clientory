import * as Sentry from "@sentry/react";
import { Analytics } from "@vercel/analytics/react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_POSTHOG_HOST ?? "https://us.i.posthog.com",
  person_profiles: "identified_only",
  capture_pageview: false, // Captured manually via react-router integration
  capture_pageleave: true,
});

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
  integrations: [Sentry.browserTracingIntegration()],
});

createRoot(document.getElementById("root")!).render(
  <PostHogProvider client={posthog}>
    <Sentry.ErrorBoundary fallback={<p>Something went wrong. Our team has been notified.</p>}>
      <App />
      <Analytics />
    </Sentry.ErrorBoundary>
  </PostHogProvider>
);

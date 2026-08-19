import * as Sentry from "@sentry/react";
import { Analytics } from "@vercel/analytics/react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: import.meta.env.VITE_POSTHOG_HOST ?? "https://us.i.posthog.com",
    person_profiles: "identified_only",
    // Keep the anonymous visitor ID available when a visitor moves from
    // clientory.org to app.clientory.org. The product app must use the same
    // PostHog project key and configuration for the identity to carry over.
    cross_subdomain_cookie: true,
    persistence: "localStorage+cookie",
    capture_pageview: false, // Captured manually via react-router integration
    capture_pageleave: true,
    disable_session_recording: false,
    // Keep form values private while still recording navigation, clicks, and
    // layout changes that help diagnose conversion friction.
    session_recording: {
      maskAllInputs: true,
      recordHeaders: false,
      recordBody: false,
    },
  });
}

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
  integrations: [Sentry.browserTracingIntegration()],
});

const rootElement = document.getElementById("root")!;
const app = (
  <PostHogProvider client={posthog}>
    <Sentry.ErrorBoundary fallback={<p>Something went wrong. Our team has been notified.</p>}>
      <App />
      <Analytics />
    </Sentry.ErrorBoundary>
  </PostHogProvider>
);

if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}

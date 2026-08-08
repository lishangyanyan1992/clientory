export const PLAN_STATIC_CONFIG = {
  scansPerCycle: 4,
  monthlyPriceUsd: 10,
  features: {
    free: {
      reportHistory: false,
      exports: false,
      recommendations: false,
      savedProfiles: false,
      scansTotal: 1,
    },
    paid: {
      reportHistory: true,
      exports: true,
      recommendations: true,
      savedProfiles: true,
      scansPerCycle: 4,
    },
  },
} as const;

// No Stripe config here on purpose. Payments are handled entirely in the
// product app at app.clientory.org; this package exists only so the marketing
// pricing page can read plan numbers. Do not reintroduce STRIPE_* env vars —
// the marketing site is a static Vercel build with no server to keep a secret.

export type PlanFeatures =
  | typeof PLAN_STATIC_CONFIG.features.free
  | typeof PLAN_STATIC_CONFIG.features.paid;

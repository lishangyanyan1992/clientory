// Single source of truth for what the marketing site claims about AI model
// coverage. Keep this in sync with the scan engine's ENABLED_PROVIDERS
// (api-server/src/routes/scans/engine.ts) — never claim a model we don't query.
//
// Live today: OpenAI (ChatGPT) + Anthropic (Claude) on every scan, Gemini on
// paid scans only. Everything else is genuinely not wired up yet and must be
// labelled "coming soon" rather than listed alongside the live ones.

export type ModelTier = "free" | "paid" | "soon";

export type CoveredModel = {
  name: string;
  /** Tailwind bg-* class used for the dot swatch. */
  color: string;
  tier: ModelTier;
};

export const AI_MODELS: CoveredModel[] = [
  { name: "ChatGPT", color: "bg-emerald-500", tier: "free" },
  { name: "Claude", color: "bg-orange-400", tier: "free" },
  { name: "Gemini", color: "bg-blue-500", tier: "paid" },
  { name: "Perplexity", color: "bg-violet-500", tier: "soon" },
  { name: "Copilot", color: "bg-slate-500", tier: "soon" },
];

/** Models a scan actually queries today, in report order. */
export const LIVE_MODELS = AI_MODELS.filter((m) => m.tier !== "soon");

/** Models on the roadmap, not yet queried. */
export const UPCOMING_MODELS = AI_MODELS.filter((m) => m.tier === "soon");

export const FREE_MODELS_LABEL = "ChatGPT and Claude";
export const PAID_MODELS_LABEL = "ChatGPT, Claude, and Gemini";
/** The models a subscription adds on top of the free report. */
export const PAID_ONLY_MODELS_LABEL = "Gemini";
export const UPCOMING_MODELS_LABEL = "Perplexity, Copilot, and more";

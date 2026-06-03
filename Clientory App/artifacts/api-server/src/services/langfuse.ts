/**
 * Langfuse v5 (OTel-native) convenience re-exports.
 *
 * All tracing uses OpenTelemetry context propagation — no manual
 * AsyncLocalStorage needed. The OTel SDK is bootstrapped in
 * src/instrumentation.ts (imported first in src/index.ts).
 *
 * Usage pattern in engine.ts:
 *
 *   await propagateAttributes(
 *     { traceName: "visibility-scan", userId: "…", tags: ["scan"] },
 *     async () => {
 *       await startActiveObservation("run-scan", async (obs) => {
 *         // OpenAI calls are auto-traced by observeOpenAI wrapper.
 *         // Anthropic / Gemini calls are traced manually:
 *         const gen = startObservation("anthropic-query", { model, input }, { asType: "generation" });
 *         const result = await anthropic.messages.create(…);
 *         gen.update({ output: result.content[0].text, usageDetails: { input: …, output: … } }).end();
 *       });
 *     }
 *   );
 *
 * Docs: https://langfuse.com/docs/sdk/typescript
 */

export {
  propagateAttributes,
  startActiveObservation,
  startObservation,
  updateActiveObservation,
  setActiveTraceIO,
} from "@langfuse/tracing";

export { observeOpenAI } from "@langfuse/openai";

import { LangfuseClient, type TextPromptClient } from "@langfuse/client";

/** Returns true when Langfuse env vars are configured. */
export function isLangfuseEnabled(): boolean {
  return !!(process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY);
}

// The OTel Span type expected by score.observation, derived from the SDK signature
// so we don't need a direct @opentelemetry/api dependency in this package.
type ScoreableSpan = Parameters<LangfuseClient["score"]["observation"]>[0]["otelSpan"];

/**
 * Attaches a numeric score to a trace via one of its observations' OTel spans.
 * Langfuse derives the trace/observation IDs from the span context. Scores power
 * the trend dashboards in the Langfuse UI — we use them to track each scan's
 * visibility scores (memory vs. answer) over time. No-op (and never throws) when
 * Langfuse is disabled or the call fails — scoring must never break a scan.
 */
export function recordTraceScore(
  otelSpan: ScoreableSpan,
  name: string,
  value: number,
  comment?: string,
): void {
  if (!isLangfuseEnabled()) return;
  try {
    client().score.observation({ otelSpan }, { name, value, ...(comment ? { comment } : {}) });
  } catch {
    // Degrade silently.
  }
}

// ── Prompt Management ─────────────────────────────────────────────────────────
// The high-level client used to FETCH managed prompts (separate from the OTel
// tracing exports above). Reads LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY /
// LANGFUSE_BASEURL from the environment automatically.
let _client: LangfuseClient | null = null;
function client(): LangfuseClient {
  if (!_client) _client = new LangfuseClient();
  return _client;
}

// The hardcoded prompt that previously lived in engine.ts. Kept here as a
// fallback so scans never break if Langfuse is unreachable or the prompt has
// not been created in the UI yet. {{deliverable}} is filled in at compile time.
export const SYMPTOM_PROMPT_FALLBACK =
  'Write a realistic problem/symptom query a prospect would type into an AI ' +
  'assistant when they have a problem that would lead them to hire a ' +
  'professional for "{{deliverable}}". The query must be 8-20 words, first ' +
  "person. Return ONLY the query, no quotes, no explanation.";

export const SYMPTOM_PROMPT_NAME = "symptom-query";

export interface ResolvedPrompt {
  /** The compiled prompt string, ready to send to the model. */
  text: string;
  /**
   * The Langfuse prompt object — pass to startObservation's `prompt` field so
   * the generation is linked to this prompt version in the Langfuse UI.
   * `null` when Langfuse is disabled or the fetch fell back to the hardcoded copy.
   */
  promptClient: TextPromptClient | null;
}

/**
 * Fetches the managed "symptom-query" prompt from Langfuse and compiles it with
 * the given deliverable. Falls back to the hardcoded copy if Langfuse is
 * disabled or the request fails — scans must never break because of prompt
 * management. The SDK caches fetched prompts in-process (default 60 s TTL), so
 * this is cheap to call per scan.
 */
export async function getSymptomPrompt(deliverable: string): Promise<ResolvedPrompt> {
  const compileFallback = (): ResolvedPrompt => ({
    text: SYMPTOM_PROMPT_FALLBACK.replace("{{deliverable}}", deliverable),
    promptClient: null,
  });

  if (!isLangfuseEnabled()) return compileFallback();

  try {
    const prompt = await client().prompt.get(SYMPTOM_PROMPT_NAME, {
      type: "text",
      // If the prompt doesn't exist yet in Langfuse, the SDK serves this copy
      // instead of throwing — so the very first deploy works before you create it.
      fallback: SYMPTOM_PROMPT_FALLBACK,
    });
    return { text: prompt.compile({ deliverable }), promptClient: prompt };
  } catch {
    // Network error, auth error, etc. — degrade gracefully.
    return compileFallback();
  }
}

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

/** Returns true when Langfuse env vars are configured. */
export function isLangfuseEnabled(): boolean {
  return !!(process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY);
}

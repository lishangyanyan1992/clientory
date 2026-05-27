/**
 * PromptFoo custom assertion: verifies that the LLM output is 8–20 words.
 * This matches the constraint in the symptom-query prompt.
 *
 * @param {string} output - The raw LLM response text.
 * @returns {{ pass: boolean; score: number; reason: string }}
 */
module.exports = (output) => {
  const trimmed = (output || "").trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const count = words.length;
  const pass = count >= 8 && count <= 20;
  return {
    pass,
    score: pass ? 1 : 0,
    reason: `${count} words — expected 8–20`,
  };
};

/**
 * PromptFoo custom assertion: verifies the output starts in first person.
 * Accepts I / We / My / Our / Me at word boundaries.
 */
module.exports = (output) => {
  const firstPersonRe = /\b(I|We|My|Our|Me)\b/i;
  const pass = firstPersonRe.test((output || "").trim());
  return {
    pass,
    score: pass ? 1 : 0,
    reason: pass
      ? "Output contains first-person pronoun"
      : "Output lacks first-person pronoun (I/We/My/Our)",
  };
};

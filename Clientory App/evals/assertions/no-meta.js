/**
 * PromptFoo custom assertion: rejects outputs that contain meta-commentary
 * (e.g. "Here is a query:", "Sure!", "This query...").
 * These indicate the model didn't follow the "Return ONLY the query" instruction.
 */
module.exports = (output) => {
  const text = (output || "").trim();
  const metaPatterns = [
    /^here\s+is/i,
    /^sure[,!]/i,
    /^certainly/i,
    /^of course/i,
    /^this (query|question|prompt)/i,
    /^a (query|question|prompt)/i,
    /"[^"]{5,}"/,   // contains quoted text (model wrapped the query in quotes)
  ];
  const found = metaPatterns.find((re) => re.test(text));
  const pass = !found;
  return {
    pass,
    score: pass ? 1 : 0,
    reason: pass ? "No meta-commentary detected" : `Meta-commentary pattern detected: ${found}`,
  };
};

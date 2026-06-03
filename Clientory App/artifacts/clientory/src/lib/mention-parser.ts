// Mention Quality analysis — derives ranking ("where") and richness ("how")
// signals from the already-stored AI response text. Pure, deterministic, no
// network calls. Mirrors the backend's checkMention() stopword logic so the
// frontend locates the same mentions the backend counted.

const FIRM_STOPWORDS = new Set([
  "law", "group", "associates", "llp", "llc", "inc", "firm", "and", "the", "of",
  "&", "co", "corp", "pc", "pllc", "pa", "partner", "partners",
]);

export type MentionAnalysis = {
  mentioned: boolean;
  /** WHERE: 1 = listed first; null = not found inside a ranked/numbered list. */
  rank: number | null;
  /** Composite 0–4 score (see signals). */
  qualityScore: number;
  qualityLabel: "Not mentioned" | "Bare mention" | "Described" | "Highlighted" | "Strongly recommended";
  signals: {
    topThree: boolean;
    hasDescription: boolean;
    cityMatched: boolean;
    serviceMatched: boolean;
  };
  /** The sentence/line containing the firm name (≤ 200 chars). */
  snippet: string | null;
};

const NOT_MENTIONED: MentionAnalysis = {
  mentioned: false,
  rank: null,
  qualityScore: 0,
  qualityLabel: "Not mentioned",
  signals: { topThree: false, hasDescription: false, cityMatched: false, serviceMatched: false },
  snippet: null,
};

function significantWords(name: string): string[] {
  return name
    .toLowerCase()
    .split(/[\s,&.]+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .filter((w) => w.length > 2 && !FIRM_STOPWORDS.has(w));
}

/** Locate the first line index + char offset where the firm is mentioned. */
function locate(lines: string[], name: string): { lineIdx: number; line: string } | null {
  const lower = name.toLowerCase();
  // 1. Exact phrase
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(lower)) return { lineIdx: i, line: lines[i] };
  }
  // 2. Significant-word match (all significant words present on one line)
  const sig = significantWords(name);
  if (sig.length >= 2) {
    for (let i = 0; i < lines.length; i++) {
      const ll = lines[i].toLowerCase();
      if (sig.every((w) => ll.includes(w))) return { lineIdx: i, line: lines[i] };
    }
  }
  return null;
}

// Leading list markers: "1.", "2)", "#3", "- ", "* ", "**1.", ordinal words.
const ORDINALS: Record<string, number> = {
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5,
  sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10,
};

function leadingRank(line: string): number | null {
  const cleaned = line.replace(/^[\s>*_-]+/, "").replace(/^\*\*/, "");
  const numMatch = cleaned.match(/^#?(\d{1,2})\s*[.)\]:-]/);
  if (numMatch) return parseInt(numMatch[1], 10);
  const ordMatch = cleaned.toLowerCase().match(/^(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\b/);
  if (ordMatch) return ORDINALS[ordMatch[1]];
  return null;
}

function isListItem(line: string): boolean {
  return /^[\s>]*([*_-]|\d{1,2}[.)\]:-]|\*\*\d)/.test(line.trim()) || leadingRank(line) !== null;
}

function labelFor(score: number): MentionAnalysis["qualityLabel"] {
  if (score >= 4) return "Strongly recommended";
  if (score >= 2) return "Highlighted";
  if (score >= 1) return "Described";
  return "Bare mention";
}

export function analyzeMention(
  response: string | null | undefined,
  businessName: string,
  opts: { city?: string | null; serviceKeywords?: string[] } = {},
): MentionAnalysis {
  if (!response || !response.trim() || !businessName.trim()) return NOT_MENTIONED;

  const lines = response.split(/\r?\n/);
  const hit = locate(lines, businessName);
  if (!hit) return NOT_MENTIONED;

  // ── Snippet: the matched line, narrowed to the sentence around the firm name.
  let snippet = hit.line.trim();
  if (snippet.length > 200) {
    const sig = significantWords(businessName);
    const anchor = businessName.toLowerCase();
    const lower = snippet.toLowerCase();
    let idx = lower.indexOf(anchor);
    if (idx === -1 && sig[0]) idx = lower.indexOf(sig[0]);
    if (idx === -1) idx = 0;
    const start = Math.max(0, idx - 90);
    snippet = (start > 0 ? "…" : "") + snippet.slice(start, start + 200).trim() + (snippet.length > start + 200 ? "…" : "");
  }

  // ── WHERE: rank.
  let rank = leadingRank(hit.line);
  // If no leading marker on the firm's own line, fall back to position among list items.
  const listLineIdxs = lines.map((l, i) => (isListItem(l) ? i : -1)).filter((i) => i >= 0);
  const posAmongList = listLineIdxs.indexOf(hit.lineIdx); // 0-based, -1 if firm line isn't a list item
  if (rank === null && posAmongList >= 0) rank = posAmongList + 1;

  const topThree = (rank !== null && rank <= 3) || (posAmongList >= 0 && posAmongList < 3);

  // ── HOW: description, city, service.
  // Strip list marker + firm name from the line; remaining prose ⇒ description.
  const sig = significantWords(businessName);
  let residual = hit.line
    .replace(/^[\s>*_#-]+/, "")
    .replace(/^\*\*/, "")
    .replace(/^#?\d{1,2}\s*[.)\]:-]\s*/, "")
    .replace(new RegExp(businessName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig"), "");
  for (const w of sig) residual = residual.replace(new RegExp(`\\b${w}\\b`, "ig"), "");
  const hasDescription = residual.replace(/[^a-z0-9]/gi, "").length >= 12;

  // City / service matched within the snippet (keeps it tied to this firm).
  const snippetLower = (snippet ?? "").toLowerCase();
  const city = opts.city?.trim().toLowerCase();
  const cityMatched = Boolean(city && city.length > 1 && snippetLower.includes(city));
  const serviceMatched = (opts.serviceKeywords ?? []).some(
    (kw) => kw.length > 2 && snippetLower.includes(kw.toLowerCase()),
  );

  const signals = { topThree, hasDescription, cityMatched, serviceMatched };
  const qualityScore = Number(topThree) + Number(hasDescription) + Number(cityMatched) + Number(serviceMatched);

  return {
    mentioned: true,
    rank,
    qualityScore,
    qualityLabel: labelFor(qualityScore),
    signals,
    snippet,
  };
}

/** Extract candidate service keywords from a prompt, minus the firm name, city and stopwords. */
export function serviceKeywordsFromPrompt(promptText: string, businessName: string, city?: string | null): string[] {
  const drop = new Set<string>([
    ...significantWords(businessName),
    ...FIRM_STOPWORDS,
    ...(city ? city.toLowerCase().split(/[\s,]+/) : []),
    "best", "top", "leading", "good", "near", "who", "what", "should", "hire", "need",
    "for", "in", "the", "a", "an", "is", "are", "me", "my", "i", "of", "and", "or", "to",
    "recommend", "recommendations", "company", "companies", "firm", "firms", "services",
  ]);
  return promptText
    .toLowerCase()
    .split(/[\s,?.]+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .filter((w) => w.length > 3 && !drop.has(w));
}

/** Aggregate label for the Level-1 summary card across all mentioned results. */
export function summarizeQuality(scores: number[]): { label: string; avg: number | null } {
  if (scores.length === 0) return { label: "—", avg: null };
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  let label: string;
  if (avg >= 3.5) label = "Strongly recommended";
  else if (avg >= 2) label = "Often highlighted";
  else if (avg >= 1) label = "Usually described";
  else label = "Mostly bare mentions";
  return { label, avg };
}

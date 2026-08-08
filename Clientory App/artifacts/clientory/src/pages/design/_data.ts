/**
 * Sample scan content shared by the four landing-page direction comps.
 *
 * Everything here is representative, not real: the firm names are invented so
 * no actual practice is depicted as ranked or unranked. Swap in a captured
 * scan before any of this ships.
 */

export type Provider = "ChatGPT" | "Claude" | "Gemini";

export const PROVIDERS: Provider[] = ["ChatGPT", "Claude", "Gemini"];

export type QueryRow = {
  query: string;
  /** Whether the firm was named in that assistant's answer. */
  named: Record<Provider, boolean>;
};

export const QUERIES: QueryRow[] = [
  {
    query: "best immigration lawyer in Houston for an H-1B transfer",
    named: { ChatGPT: false, Claude: false, Gemini: false },
  },
  {
    query: "who can help me file an I-485 in Texas",
    named: { ChatGPT: true, Claude: false, Gemini: false },
  },
  {
    query: "affordable green card attorney near me",
    named: { ChatGPT: false, Claude: false, Gemini: false },
  },
  {
    query: "immigration lawyer for an asylum case in Houston",
    named: { ChatGPT: false, Claude: true, Gemini: false },
  },
  {
    query: "attorney to appeal a denied N-400",
    named: { ChatGPT: false, Claude: false, Gemini: true },
  },
  {
    query: "EB-2 NIW lawyer with good reviews",
    named: { ChatGPT: false, Claude: false, Gemini: false },
  },
  {
    query: "lawyer for removal defense hearing Harris County",
    named: { ChatGPT: true, Claude: false, Gemini: false },
  },
  {
    query: "how much does an immigration attorney cost in Texas",
    named: { ChatGPT: false, Claude: false, Gemini: false },
  },
];

export const TOTAL_ANSWERS = QUERIES.length * PROVIDERS.length;

export const NAMED_COUNT = QUERIES.reduce(
  (sum, row) => sum + PROVIDERS.filter((p) => row.named[p]).length,
  0,
);

export const VISIBILITY_PCT = Math.round((NAMED_COUNT / TOTAL_ANSWERS) * 100);

/** Per-assistant visibility, used by the comps that break the score down. */
export const BY_PROVIDER = PROVIDERS.map((provider) => {
  const hits = QUERIES.filter((row) => row.named[provider]).length;
  return { provider, hits, total: QUERIES.length };
});

/** The single query the roll-call comp dramatises. */
export const HERO_QUERY = "Who's the best immigration lawyer in Houston?";

/** Invented firms. Not real practices. */
export const ANSWER_FIRMS = [
  {
    name: "Alvarez & Reyes Immigration",
    note: "Frequently cited for employment-based petitions and consular processing.",
  },
  {
    name: "Beltran Law Group",
    note: "Known for removal defense and bond hearings in the Houston immigration court.",
  },
  {
    name: "The Nguyen Firm, PLLC",
    note: "Family-based petitions, adjustment of status, and naturalization.",
  },
];

/** Metro coverage for the territory comp. Coordinates are plot space, 0–100. */
export const MARKETS = [
  { city: "Seattle", x: 9, y: 12, named: true, share: 3 },
  { city: "San Francisco", x: 5, y: 40, named: false, share: 6 },
  { city: "Los Angeles", x: 8, y: 54, named: false, share: 11 },
  { city: "Phoenix", x: 24, y: 65, named: false, share: 4 },
  { city: "Denver", x: 32, y: 42, named: true, share: 3 },
  { city: "Dallas", x: 45, y: 65, named: false, share: 7 },
  { city: "Houston", x: 48, y: 76, named: false, share: 14 },
  { city: "Chicago", x: 58, y: 32, named: false, share: 8 },
  { city: "Atlanta", x: 71, y: 66, named: true, share: 6 },
  { city: "Miami", x: 80, y: 88, named: false, share: 12 },
  { city: "Washington DC", x: 82, y: 41, named: true, share: 7 },
  { city: "New York", x: 87, y: 30, named: false, share: 13 },
  { city: "Boston", x: 92, y: 22, named: true, share: 4 },
];

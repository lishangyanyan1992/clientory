import ComparisonPage, { type ComparisonPageData } from "@/components/ComparisonPage";

const data: ComparisonPageData = {
  slug: "clientory-vs-otterly",
  competitorName: "Otterly.ai",
  verdict:
    "Clientory is purpose-built for immigration law firms, with prompts modeled on real client questions about visas, green cards, naturalization, and removal defense, plus local competitor benchmarking. Otterly.ai is a strong general-purpose GEO tool but has no immigration specialization or local market benchmarking.",
  features: [
    { feature: "Built for immigration law", clientory: "yes", competitor: "no" },
    { feature: "LLM platforms covered", clientory: "ChatGPT, Claude, Gemini (Perplexity, Copilot coming soon)", competitor: "ChatGPT, Gemini, Perplexity" },
    { feature: "Starting price", clientory: "Free report, then $10/mo", competitor: "$29/mo" },
    { feature: "Industry-specific prompt library", clientory: "yes", competitor: "no" },
    { feature: "Competitor gap vs. local rivals", clientory: "yes", competitor: "no" },
    { feature: "Actionable fix-it recommendations", clientory: "yes", competitor: "partial" },
    { feature: "Free trial", clientory: "yes", competitor: "yes" },
  ],
  chooseClientory: [
    "You run an immigration law firm",
    "You need local competitor benchmarking specific to your metro area",
    "You want prompts phrased the way clients actually ask about visas and green cards",
    "You need industry-specific prompt testing, not generic brand queries",
  ],
  chooseCompetitor: [
    "You run an e-commerce or SaaS brand needing general GEO monitoring",
    "You want broad brand tracking across many industries",
    "You already use Otterly and don't need immigration specialization",
    "You need integration with existing marketing dashboards",
  ],
  methodology: [
    "Clientory generates prompts modeled on real client queries — questions like 'best marriage green card lawyer in Chicago' or 'H-1B attorney for startups in Austin.' Each prompt runs across ChatGPT, Claude, and Gemini, and every answer is graded Positive, Passive, or No mention, then rolled into a 0-100 visibility score with the competitors filling your gaps.",
    "Otterly.ai takes a more general approach, allowing users to enter custom prompts and track brand mentions across ChatGPT, Gemini, and Perplexity. While flexible, Otterly does not provide pre-built prompt libraries for specific industries or benchmark against local competitors automatically.",
    "For immigration firms, Clientory's prompts are generated from the firm profile, so setup is a form rather than a prompt-writing exercise. Otterly may require significant manual prompt creation to reach comparable coverage of the queries prospective clients actually use.",
  ],
  pricingRows: [
    { label: "Free report", clientory: "One per firm", competitor: "No" },
    { label: "Starter", clientory: "Free report, then $10/mo", competitor: "$29/mo" },
    { label: "Pro tier", clientory: "No tiers — one plan", competitor: "$79/mo" },
    { label: "Enterprise tier", clientory: "No tiers — one plan", competitor: "Custom" },
  ],
  faqs: [
    { question: "Is Otterly.ai good for law firms?", answer: "Otterly.ai is a general-purpose GEO tool that can track brand mentions, but it has no immigration-specific prompt generation or local competitor benchmarking. Clientory is built specifically for immigration law firms." },
    { question: "Does Otterly cover Claude and Copilot?", answer: "As of 2025, Otterly.ai covers ChatGPT, Gemini, and Perplexity. Clientory queries ChatGPT, Claude, and Gemini today — including Claude, which Otterly does not cover — with Perplexity and Copilot coming soon." },
    { question: "Which tool is cheaper?", answer: "Clientory gives every firm one free report, then costs $10/month per firm. Otterly.ai starts at $29/month." },
    { question: "Can I use both tools together?", answer: "Yes, some firms use Otterly for general brand monitoring and Clientory for immigration-specific insight. Most immigration firms find the focused approach gives more actionable data." },
  ],
};

const CompareOtterly = () => <ComparisonPage data={data} />;
export default CompareOtterly;

import ComparisonPage, { type ComparisonPageData } from "@/components/ComparisonPage";

const data: ComparisonPageData = {
  slug: "clientory-vs-otterly",
  competitorName: "Otterly.ai",
  verdict:
    "Clientory is purpose-built for immigration law firms, with prompts modeled on real client questions about visas, green cards, naturalization, and removal defense. Otterly.ai is a broader AI-search monitoring platform with more configurable coverage, but it is not tailored to immigration practices.",
  features: [
    { feature: "Built for immigration law", clientory: "yes", competitor: "no" },
    { feature: "AI platforms covered", clientory: "ChatGPT, Claude, Gemini (Perplexity, Copilot coming soon)", competitor: "ChatGPT, Perplexity, Copilot, and Google AI Overviews; Gemini, Claude, and AI Mode are add-ons" },
    { feature: "Starting price", clientory: "Free report; 30-day paid trial, then $10/mo", competitor: "$29/mo" },
    { feature: "Industry-specific prompt library", clientory: "yes", competitor: "no" },
    { feature: "Automatic gap vs. firms in your prompts", clientory: "yes", competitor: "partial" },
    { feature: "Actionable fix-it recommendations", clientory: "yes", competitor: "partial" },
    { feature: "Paid-plan trial", clientory: "30 days, card required", competitor: "yes" },
  ],
  chooseClientory: [
    "You run an immigration law firm",
    "You want competing firms surfaced automatically from the answers",
    "You want prompts phrased the way clients actually ask about visas and green cards",
    "You need industry-specific prompt testing, not generic brand queries",
  ],
  chooseCompetitor: [
    "You run an e-commerce or SaaS brand needing general GEO monitoring",
    "You want broad brand tracking across many industries",
    "You already use Otterly and don't need immigration specialization",
    "You need broad prompt, citation, domain, API, or dashboard reporting",
  ],
  methodology: [
    "Clientory generates prompts modeled on real client queries — questions like 'best marriage green card lawyer in Chicago' or 'H-1B attorney for startups in Austin.' Each prompt runs across ChatGPT, Claude, and Gemini, and every answer is graded Positive, Passive, or No mention, then rolled into a 0-100 visibility score with the competitors filling your gaps.",
    "Otterly.ai takes a configurable, general-market approach. Its current plans cover ChatGPT, Perplexity, Microsoft Copilot, and Google AI Overviews, with Gemini, Claude, and Google AI Mode available as paid add-ons. It also provides citation, domain, export, API, and dashboard capabilities that suit broader marketing teams.",
    "For immigration firms, Clientory's prompts are generated from the firm profile, so setup is a form rather than a prompt-writing exercise. Otterly may require significant manual prompt creation to reach comparable coverage of the queries prospective clients actually use.",
  ],
  pricingRows: [
    { label: "Try before paying", clientory: "One free report, no card", competitor: "Free trial, no card" },
    { label: "Subscription", clientory: "30-day paid trial, then $10/mo", competitor: "Starts at $29/mo" },
    { label: "Paid cadence", clientory: "Weekly", competitor: "Daily" },
    { label: "Pricing basis", clientory: "One simple plan", competitor: "Prompt volume, plan, and model add-ons" },
  ],
  competitorSource: {
    label: "Verify Otterly's current plans and coverage",
    url: "https://help.otterly.ai/pricing-of-otterlyai",
  },
  faqs: [
    { question: "Is Otterly.ai good for law firms?", answer: "Otterly.ai is a general-purpose GEO tool that can track brand mentions, but it has no immigration-specific prompt generation or local competitor benchmarking. Clientory is built specifically for immigration law firms." },
    { question: "Does Otterly cover Claude and Copilot?", answer: "Yes. Otterly currently includes Microsoft Copilot in its core coverage and offers Claude as a paid add-on. Clientory queries ChatGPT, Claude, and Gemini today, with Perplexity and Copilot coming soon." },
    { question: "Which tool is cheaper?", answer: "Clientory gives each user account one free report with no card. Its optional paid plan starts with a card-required 30-day trial and then costs $10 per month. Otterly.ai currently starts at $29 per month." },
    { question: "Can I use both tools together?", answer: "Yes, some firms use Otterly for general brand monitoring and Clientory for immigration-specific insight. Most immigration firms find the focused approach gives more actionable data." },
  ],
};

const CompareOtterly = () => <ComparisonPage data={data} />;
export default CompareOtterly;

import ComparisonPage, { type ComparisonPageData } from "@/components/ComparisonPage";

const data: ComparisonPageData = {
  slug: "clientory-vs-peec",
  competitorName: "Peec.ai",
  verdict:
    "Clientory is designed for independent immigration law firms, with prompts drawn from real client questions and competing firms surfaced from the answers. Peec.ai is a broader AI-search analytics platform for brand, SEO, and agency teams, with substantially more configuration and reporting but no immigration specialization.",
  features: [
    { feature: "Built for immigration law", clientory: "yes", competitor: "no" },
    { feature: "AI platforms covered", clientory: "ChatGPT, Claude, Gemini (Perplexity, Copilot coming soon)", competitor: "Choose 3 from ChatGPT, Google AI, Copilot, Perplexity, and Gemini; more models via add-ons or Enterprise" },
    { feature: "Starting price", clientory: "Free report, one month free, then $10/mo", competitor: "$95/mo" },
    { feature: "Industry-specific prompt library", clientory: "yes", competitor: "no" },
    { feature: "Competitor gap vs. local rivals", clientory: "yes", competitor: "partial" },
    { feature: "Actionable fix-it recommendations", clientory: "yes", competitor: "partial" },
    { feature: "Free trial", clientory: "yes", competitor: "yes" },
  ],
  chooseClientory: [
    "You run an independent immigration law firm",
    "You need prompts tailored to visa, green card, and naturalization queries",
    "You want local competitor benchmarking in your metro area",
    "You prefer a tool built specifically for your industry",
  ],
  chooseCompetitor: [
    "You're a marketing, SEO, or agency team needing broad brand intelligence",
    "You want detailed analytics dashboards with team collaboration",
    "You need multi-language monitoring across global markets",
    "You already use Peec and need general brand tracking",
  ],
  methodology: [
    "Clientory focuses on the exact prompts prospective clients use when looking for an immigration lawyer — running them across ChatGPT, Claude, and Gemini, grading each as Positive, Passive, or No mention, and returning a 0-100 visibility score plus the competitors filling the gaps.",
    "Peec.ai provides broader brand intelligence for marketing, SEO, and agency teams. Current plans combine custom prompt tracking, multiple AI-platform choices, daily monitoring, collaboration, and deeper reporting across projects and countries.",
    "For a solo practitioner or a 10-attorney immigration firm, Clientory's targeted approach delivers faster, more relevant insight than Peec's enterprise-oriented platform.",
  ],
  pricingRows: [
    { label: "Try before paying", clientory: "One free report, no card", competitor: "Check Peec's current trial offer" },
    { label: "Starter", clientory: "One month free, then $10/mo", competitor: "$95/mo" },
    { label: "Pro", clientory: "No additional tiers", competitor: "$245/mo" },
    { label: "Advanced", clientory: "No additional tiers", competitor: "$495/mo" },
  ],
  competitorSource: {
    label: "Verify Peec's current pricing",
    url: "https://peec.ai/pricing",
  },
  faqs: [
    { question: "Is Peec.ai good for small law firms?", answer: "Peec can work for teams that need broad, configurable AI-search analytics. Clientory is the simpler, lower-cost option built specifically around the questions and local competitors relevant to independent immigration law practices." },
    { question: "Does Peec offer local competitor benchmarking?", answer: "Peec.ai offers some competitive analysis but is not focused on local market benchmarking. Clientory automatically surfaces the competing firms that appear in the prompts you are missing from." },
    { question: "Which tool covers more AI platforms?", answer: "Peec currently offers broader configurable platform coverage. Clientory queries ChatGPT, Claude, and Gemini today, with Perplexity and Copilot coming soon, while keeping setup focused on immigration-law discovery prompts." },
    { question: "Is Peec.ai available in English?", answer: "Yes. Peec supports English and international tracking; its current brand plans are published in U.S. dollars." },
  ],
};

const ComparePeec = () => <ComparisonPage data={data} />;
export default ComparePeec;

import ComparisonPage, { type ComparisonPageData } from "@/components/ComparisonPage";

const data: ComparisonPageData = {
  slug: "clientory-vs-peec",
  competitorName: "Peec.ai",
  verdict:
    "Clientory is designed for independent immigration law firms, with prompts drawn from real client questions and local benchmarking. Peec.ai targets enterprise marketing teams with broader brand intelligence, but lacks the immigration focus and local competitive analysis these firms need.",
  features: [
    { feature: "Built for immigration law", clientory: "yes", competitor: "no" },
    { feature: "LLM platforms covered", clientory: "ChatGPT, Claude, Gemini (Perplexity, Copilot coming soon)", competitor: "ChatGPT, Gemini, Perplexity, Bing" },
    { feature: "Starting price", clientory: "Free report, then $10/mo", competitor: "€89/mo" },
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
    "You're an enterprise marketing team needing broad brand intelligence",
    "You want detailed analytics dashboards with team collaboration",
    "You need multi-language monitoring across global markets",
    "You already use Peec and need general brand tracking",
  ],
  methodology: [
    "Clientory focuses on the exact prompts prospective clients use when looking for an immigration lawyer — running them across ChatGPT, Claude, and Gemini, grading each as Positive, Passive, or No mention, and returning a 0-100 visibility score plus the competitors filling the gaps.",
    "Peec.ai provides broader brand intelligence with a focus on enterprise marketing teams. It tracks brand mentions and sentiment across AI platforms but is designed for large organizations monitoring brand perception rather than small firms competing for local client acquisition.",
    "For a solo practitioner or a 10-attorney immigration firm, Clientory's targeted approach delivers faster, more relevant insight than Peec's enterprise-oriented platform.",
  ],
  pricingRows: [
    { label: "Free report", clientory: "One per firm", competitor: "No" },
    { label: "Starter", clientory: "Free report, then $10/mo", competitor: "€89/mo" },
    { label: "Pro tier", clientory: "No tiers — one plan", competitor: "€199/mo" },
    { label: "Enterprise tier", clientory: "No tiers — one plan", competitor: "Custom" },
  ],
  faqs: [
    { question: "Is Peec.ai good for small law firms?", answer: "Peec.ai is designed for enterprise marketing teams and may be overly complex and expensive for an independent firm. Clientory is purpose-built for immigration law practices." },
    { question: "Does Peec offer local competitor benchmarking?", answer: "Peec.ai offers some competitive analysis but is not focused on local market benchmarking. Clientory automatically surfaces the competing firms that appear in the prompts you are missing from." },
    { question: "Which tool covers more AI platforms?", answer: "Both tools cover major AI platforms. Clientory queries ChatGPT, Claude, and Gemini today, with Perplexity and Copilot coming soon. Peec.ai covers ChatGPT, Gemini, Perplexity, and Bing Chat." },
    { question: "Is Peec.ai available in English?", answer: "Yes, Peec.ai is available in English and multiple other languages. It is headquartered in Europe and prices in Euros." },
  ],
};

const ComparePeec = () => <ComparisonPage data={data} />;
export default ComparePeec;

import ComparisonPage, { type ComparisonPageData } from "@/components/ComparisonPage";

const data: ComparisonPageData = {
  slug: "clientory-vs-peec",
  competitorName: "Peec.ai",
  verdict:
    "Clientory is designed for small and mid-sized professional service firms with industry-specific prompts and local benchmarking. Peec.ai targets enterprise marketing teams with broader brand intelligence features but lacks the professional services focus and competitive local analysis that firms need.",
  features: [
    { feature: "Built for professional services", clientory: "yes", competitor: "no" },
    { feature: "LLM platforms covered", clientory: "ChatGPT, Claude, Gemini, Perplexity, Copilot", competitor: "ChatGPT, Gemini, Perplexity, Bing" },
    { feature: "Starting price", clientory: "Free beta", competitor: "€89/mo" },
    { feature: "Industry-specific prompt library", clientory: "yes", competitor: "no" },
    { feature: "Share of Voice vs. local competitors", clientory: "yes", competitor: "partial" },
    { feature: "Accuracy monitoring", clientory: "yes", competitor: "yes" },
    { feature: "Actionable fix-it recommendations", clientory: "yes", competitor: "partial" },
    { feature: "Free trial", clientory: "yes", competitor: "yes" },
  ],
  chooseClientory: [
    "You're a small or mid-sized professional service firm",
    "You need prompts tailored to legal, accounting, or consulting queries",
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
    "Clientory focuses on the exact prompts prospective clients use when searching for professional services — running them across five AI platforms and scoring firms on mention rate, position, sentiment, accuracy, and local Share of Voice.",
    "Peec.ai provides broader brand intelligence with a focus on enterprise marketing teams. It tracks brand mentions and sentiment across AI platforms but is designed for large organizations monitoring brand perception rather than small firms competing for local client acquisition.",
    "For a 10-person law firm or a boutique consulting practice, Clientory's targeted approach delivers faster, more relevant insights than Peec's enterprise-oriented platform.",
  ],
  pricingRows: [
    { label: "Free tier", clientory: "Yes (beta)", competitor: "No" },
    { label: "Starter", clientory: "Free beta", competitor: "€89/mo" },
    { label: "Pro", clientory: "Coming soon", competitor: "€199/mo" },
    { label: "Enterprise", clientory: "Contact us", competitor: "Custom" },
  ],
  faqs: [
    { question: "Is Peec.ai good for small law firms?", answer: "Peec.ai is designed for enterprise marketing teams and may be overly complex and expensive for small professional service firms. Clientory is purpose-built for firms like law practices, accounting firms, and consultancies." },
    { question: "Does Peec offer local competitor benchmarking?", answer: "Peec.ai offers some competitive analysis but is not focused on local market benchmarking for professional services. Clientory automatically benchmarks your firm against local competitors in your metro area." },
    { question: "Which tool covers more AI platforms?", answer: "Both tools cover major AI platforms. Clientory covers ChatGPT, Claude, Gemini, Perplexity, and Copilot. Peec.ai covers ChatGPT, Gemini, Perplexity, and Bing Chat." },
    { question: "Is Peec.ai available in English?", answer: "Yes, Peec.ai is available in English and multiple other languages. It is headquartered in Europe and prices in Euros." },
  ],
};

const ComparePeec = () => <ComparisonPage data={data} />;
export default ComparePeec;

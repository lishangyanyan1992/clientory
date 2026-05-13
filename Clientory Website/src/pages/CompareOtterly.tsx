import ComparisonPage, { type ComparisonPageData } from "@/components/ComparisonPage";

const data: ComparisonPageData = {
  slug: "clientory-vs-otterly",
  competitorName: "Otterly.ai",
  verdict:
    "Clientory is purpose-built for professional service firms and includes industry-specific prompt libraries, local competitor benchmarking, and compliance-aware recommendations for law and accounting firms. Otterly.ai is a strong general-purpose GEO tool but lacks professional services specialization and local market benchmarking.",
  features: [
    { feature: "Built for professional services", clientory: "yes", competitor: "no" },
    { feature: "LLM platforms covered", clientory: "ChatGPT, Claude, Gemini, Perplexity, Copilot", competitor: "ChatGPT, Gemini, Perplexity" },
    { feature: "Starting price", clientory: "Free beta", competitor: "$29/mo" },
    { feature: "Industry-specific prompt library", clientory: "yes", competitor: "no" },
    { feature: "Share of Voice vs. local competitors", clientory: "yes", competitor: "no" },
    { feature: "Accuracy monitoring", clientory: "yes", competitor: "partial" },
    { feature: "Actionable fix-it recommendations", clientory: "yes", competitor: "partial" },
    { feature: "Free trial", clientory: "yes", competitor: "yes" },
  ],
  chooseClientory: [
    "You run a law firm, accounting firm, consulting firm, or marketing agency",
    "You need local competitor benchmarking specific to your metro area",
    "You want compliance-aware recommendations (ABA, AICPA guidelines)",
    "You need industry-specific prompt testing, not generic brand queries",
  ],
  chooseCompetitor: [
    "You run an e-commerce or SaaS brand needing general GEO monitoring",
    "You want broad brand tracking across many industries",
    "You already use Otterly and don't need professional services specialization",
    "You need integration with existing marketing dashboards",
  ],
  methodology: [
    "Clientory uses a curated library of prompts modeled on real client queries for professional services — questions like 'best estate planning lawyer in Austin' or 'top small business accountant near me.' Each prompt is run across five major AI platforms, and results are scored on mention rate, position, sentiment, accuracy, and Share of Voice relative to local competitors.",
    "Otterly.ai takes a more general approach, allowing users to enter custom prompts and track brand mentions across ChatGPT, Gemini, and Perplexity. While flexible, Otterly does not provide pre-built prompt libraries for specific industries or benchmark against local competitors automatically.",
    "For professional service firms, Clientory's industry-specific methodology means faster setup and more relevant insights. Otterly may require significant manual prompt creation to achieve comparable coverage of the queries prospective clients actually use.",
  ],
  pricingRows: [
    { label: "Free tier", clientory: "Yes (beta)", competitor: "No" },
    { label: "Starter", clientory: "Free beta", competitor: "$29/mo" },
    { label: "Pro", clientory: "Coming soon", competitor: "$79/mo" },
    { label: "Enterprise", clientory: "Contact us", competitor: "Custom" },
  ],
  faqs: [
    { question: "Is Otterly.ai good for law firms?", answer: "Otterly.ai is a general-purpose GEO tool that can track brand mentions, but it does not include law-firm-specific prompt libraries, local competitor benchmarking, or compliance-aware recommendations. Clientory is designed specifically for professional service firms including law firms." },
    { question: "Does Otterly cover Claude and Copilot?", answer: "As of 2025, Otterly.ai covers ChatGPT, Gemini, and Perplexity. Clientory covers those three plus Claude and Microsoft Copilot, providing broader visibility across all major AI platforms." },
    { question: "Which tool is cheaper?", answer: "Clientory is currently free during its beta period. Otterly.ai starts at $29/month. Long-term pricing for Clientory will be announced when the product exits beta." },
    { question: "Can I use both tools together?", answer: "Yes, some firms use Otterly for general brand monitoring and Clientory for professional-services-specific insights. However, most professional service firms find that Clientory's focused approach provides more actionable data." },
  ],
};

const CompareOtterly = () => <ComparisonPage data={data} />;
export default CompareOtterly;

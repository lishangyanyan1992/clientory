import ComparisonPage, { type ComparisonPageData } from "@/components/ComparisonPage";

const data: ComparisonPageData = {
  slug: "clientory-vs-manual-testing",
  competitorName: "Manual Testing",
  verdict:
    "Manual testing gives you a quick snapshot but is time-consuming, inconsistent, and impossible to scale. Clientory automates the entire process with standardized prompts, multi-platform coverage, and historical tracking — so you get reliable data instead of anecdotal impressions.",
  features: [
    { feature: "Built for professional services", clientory: "yes", competitor: "partial" },
    { feature: "LLM platforms covered", clientory: "ChatGPT, Claude, Gemini, Perplexity, Copilot", competitor: "Whichever you manually test" },
    { feature: "Starting price", clientory: "Free beta", competitor: "Free (your time)" },
    { feature: "Industry-specific prompt library", clientory: "yes", competitor: "no" },
    { feature: "Share of Voice vs. local competitors", clientory: "yes", competitor: "no" },
    { feature: "Accuracy monitoring", clientory: "yes", competitor: "partial" },
    { feature: "Actionable fix-it recommendations", clientory: "yes", competitor: "no" },
    { feature: "Free trial", clientory: "yes", competitor: "N/A" },
  ],
  chooseClientory: [
    "You want consistent, repeatable measurements over time",
    "You need to track 5 AI platforms without spending hours each week",
    "You want scored metrics (mention rate, sentiment, accuracy) not just screenshots",
    "You need to benchmark against local competitors automatically",
  ],
  chooseCompetitor: [
    "You want a one-time quick check before investing in a tool",
    "You have very specific, unique prompts you want to test ad hoc",
    "You're evaluating whether AI visibility matters for your firm",
    "You enjoy the process and have time to spare",
  ],
  methodology: [
    "Manual testing typically involves opening ChatGPT or another AI platform, typing in a few queries, and noting whether your firm appears. While this provides a quick directional signal, it suffers from several limitations: AI responses vary by session, you can't easily test dozens of prompt variations, and there's no systematic way to track changes over time.",
    "Clientory automates this process with a standardized battery of industry-specific prompts run across all five major AI platforms. Results are scored on five metrics and tracked historically, so you can see whether your optimization efforts are working.",
    "The real cost of manual testing is hidden: a thorough test across 5 platforms with 20+ prompts takes 3–4 hours. Doing this monthly means 36–48 hours per year — time that Clientory reduces to minutes.",
  ],
  pricingRows: [
    { label: "Free tier", clientory: "Yes (beta)", competitor: "Free (your time)" },
    { label: "Time per audit", clientory: "Minutes", competitor: "3–4 hours" },
    { label: "Consistency", clientory: "Standardized", competitor: "Variable" },
    { label: "Historical tracking", clientory: "Automatic", competitor: "Manual spreadsheets" },
  ],
  faqs: [
    { question: "Can I do GEO monitoring myself for free?", answer: "Yes, you can manually test by asking AI platforms about your firm. However, results vary by session, you can't easily track changes over time, and testing 5 platforms with multiple prompts takes hours. Clientory automates this entire process." },
    { question: "How many prompts should I test manually?", answer: "For a meaningful snapshot, you'd want at least 15–20 prompts across service areas, locations, and competitor comparisons — on each of 5 platforms. That's 75–100 queries per audit." },
    { question: "Why do AI responses change between sessions?", answer: "AI models incorporate randomness (temperature settings) and may use different data sources in real-time. This means the same prompt can produce different results minutes apart, making single-session manual testing unreliable." },
    { question: "Is manual testing a good starting point?", answer: "Absolutely. We recommend running a few manual tests to understand the landscape before using Clientory for systematic monitoring. Our GEO Guide includes step-by-step instructions for manual testing." },
  ],
};

const CompareManualTesting = () => <ComparisonPage data={data} />;
export default CompareManualTesting;

import ComparisonPage, { type ComparisonPageData } from "@/components/ComparisonPage";

const data: ComparisonPageData = {
  slug: "clientory-vs-manual-testing",
  competitorName: "Manual Testing",
  verdict:
    "Manual testing gives you a quick snapshot but is time-consuming, inconsistent, and impossible to scale. Clientory automates the entire process with standardized prompts, multi-platform coverage, and historical tracking — so you get reliable data instead of anecdotal impressions.",
  features: [
    { feature: "Built for immigration law", clientory: "yes", competitor: "partial" },
    { feature: "LLM platforms covered", clientory: "ChatGPT, Claude, Gemini (Perplexity, Copilot coming soon)", competitor: "Whichever you manually test" },
    { feature: "Starting price", clientory: "Free report; 30-day paid trial, then $10/mo", competitor: "Free consumer access or API fees + your time" },
    { feature: "Industry-specific prompt library", clientory: "yes", competitor: "no" },
    { feature: "Competitor gap vs. local rivals", clientory: "yes", competitor: "no" },
    { feature: "Actionable fix-it recommendations", clientory: "yes", competitor: "no" },
    { feature: "Paid-plan trial", clientory: "30 days, card required", competitor: "N/A" },
  ],
  chooseClientory: [
    "You want consistent, repeatable measurements over time",
    "You need to track several AI assistants without spending hours each week",
    "You want a scored result — sentiment per prompt and a 0-100 visibility score — not screenshots",
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
    "Clientory automates this process with a standardized battery of immigration-specific prompts run across ChatGPT and Claude, plus Gemini on subscribed scans. Results are graded consistently and tracked historically, so you can see whether your visibility is moving.",
    "Manual testing is not actually free. A thorough pass across several assistants with 20+ prompts takes 3–4 hours, and doing it at any scale means paying for API access to each model on top of the setup time. Repeat that monthly and it is 36–48 hours a year plus usage fees — for a less consistent result than an automated scan.",
  ],
  pricingRows: [
    { label: "Free starting point", clientory: "One report per user account, no card", competitor: "Consumer tools may be free; API testing has usage fees" },
    { label: "Time per audit", clientory: "Minutes", competitor: "3–4 hours" },
    { label: "Consistency", clientory: "Standardized", competitor: "Variable" },
    { label: "Historical tracking", clientory: "Automatic", competitor: "Manual spreadsheets" },
  ],
  faqs: [
    { question: "Can I do GEO monitoring myself for free?", answer: "You can ask the assistants about your firm by hand, but it is rarely free in practice: results vary by session, testing at any scale means paying for API access, and a full pass takes hours. Clientory automates it and keeps the results comparable week to week." },
    { question: "How many prompts should I test manually?", answer: "For a meaningful snapshot, you'd want at least 15–20 prompts across practice areas, locations, and competitor comparisons, repeated on each assistant you care about. That is easily 50–100 queries per audit, every time you want a fresh reading." },
    { question: "Why do AI responses change between sessions?", answer: "AI models incorporate randomness (temperature settings) and may use different data sources in real-time. This means the same prompt can produce different results minutes apart, making single-session manual testing unreliable." },
    { question: "Is manual testing a good starting point?", answer: "Absolutely. We recommend running a few manual tests to understand the landscape before using Clientory for systematic monitoring. Our GEO Guide includes step-by-step instructions for manual testing." },
  ],
};

const CompareManualTesting = () => <ComparisonPage data={data} />;
export default CompareManualTesting;

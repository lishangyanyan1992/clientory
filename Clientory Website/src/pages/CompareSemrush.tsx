import ComparisonPage, { type ComparisonPageData } from "@/components/ComparisonPage";

const data: ComparisonPageData = {
  slug: "clientory-vs-semrush-ai",
  competitorName: "Semrush AI Toolkit",
  verdict:
    "Clientory is a dedicated GEO monitoring tool for professional service firms with deep industry focus. Semrush's AI Toolkit is an add-on to its existing SEO platform — powerful for teams already using Semrush, but not purpose-built for professional services AI visibility.",
  features: [
    { feature: "Built for professional services", clientory: "yes", competitor: "no" },
    { feature: "LLM platforms covered", clientory: "ChatGPT, Claude, Gemini, Perplexity, Copilot", competitor: "ChatGPT, Gemini (via AI Overviews)" },
    { feature: "Starting price", clientory: "Free beta", competitor: "$99/mo (requires Semrush subscription)" },
    { feature: "Industry-specific prompt library", clientory: "yes", competitor: "no" },
    { feature: "Share of Voice vs. local competitors", clientory: "yes", competitor: "partial" },
    { feature: "Accuracy monitoring", clientory: "yes", competitor: "no" },
    { feature: "Actionable fix-it recommendations", clientory: "yes", competitor: "partial" },
    { feature: "Free trial", clientory: "yes", competitor: "yes" },
  ],
  chooseClientory: [
    "You want a standalone GEO tool without needing an existing SEO platform",
    "You need professional-services-specific prompt testing and benchmarking",
    "You want to track mentions across 5 AI platforms, not just AI Overviews",
    "You're a small firm that doesn't need Semrush's full SEO suite",
  ],
  chooseCompetitor: [
    "You already pay for Semrush and want to add AI visibility tracking",
    "You need a combined SEO + GEO solution in one dashboard",
    "You want deep traditional SEO analytics alongside AI monitoring",
    "You're a marketing agency managing multiple client domains",
  ],
  methodology: [
    "Clientory runs industry-specific prompts across five AI platforms and measures mention rate, position, sentiment, accuracy, and Share of Voice. Every prompt is crafted to mirror real prospective client queries for legal, accounting, consulting, and marketing services.",
    "Semrush's AI Toolkit primarily tracks AI Overviews in Google search results and provides some visibility into how AI-generated content appears for your target keywords. It is tightly integrated with Semrush's existing keyword and ranking tools but does not query AI platforms directly with conversational prompts.",
    "The key difference: Clientory tests what happens when someone asks ChatGPT or Claude for a professional service recommendation. Semrush tracks what happens when Google's AI Overview appears on a traditional search results page. Both are valuable, but they measure different things.",
  ],
  pricingRows: [
    { label: "Free tier", clientory: "Yes (beta)", competitor: "No" },
    { label: "Starter", clientory: "Free beta", competitor: "$99/mo (requires Pro plan)" },
    { label: "Pro", clientory: "Coming soon", competitor: "$199/mo (requires Guru plan)" },
    { label: "Enterprise", clientory: "Contact us", competitor: "$399/mo (Business plan)" },
  ],
  faqs: [
    { question: "Do I need a Semrush subscription to use their AI tools?", answer: "Yes, Semrush's AI Toolkit requires an active Semrush subscription starting at $99/month for the Pro plan. Clientory is a standalone tool currently free during beta." },
    { question: "Does Semrush track ChatGPT mentions?", answer: "Semrush primarily tracks AI Overviews in Google Search, not direct mentions in ChatGPT, Claude, or Perplexity conversations. Clientory directly queries all five major AI platforms." },
    { question: "Can I use Clientory alongside Semrush?", answer: "Absolutely. Many firms use Semrush for traditional SEO and Clientory for AI visibility monitoring. The two tools complement each other well." },
    { question: "Which tool is better for tracking local visibility?", answer: "For AI platform visibility in local professional services, Clientory provides more targeted insights. Semrush excels at traditional local SEO tracking." },
  ],
};

const CompareSemrush = () => <ComparisonPage data={data} />;
export default CompareSemrush;

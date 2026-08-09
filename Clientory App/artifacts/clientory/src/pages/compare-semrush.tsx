import ComparisonPage, { type ComparisonPageData } from "@/components/ComparisonPage";

const data: ComparisonPageData = {
  slug: "clientory-vs-semrush-ai",
  competitorName: "Semrush AI Toolkit",
  verdict:
    "Clientory is a focused AI-visibility monitor for immigration law firms. Semrush AI Visibility is a broader per-domain product with daily custom-prompt tracking and traditional marketing research depth, but it is not purpose-built for immigration-law discovery.",
  features: [
    { feature: "Built for immigration law", clientory: "yes", competitor: "no" },
    { feature: "AI platforms covered", clientory: "ChatGPT, Claude, Gemini (Perplexity, Copilot coming soon)", competitor: "ChatGPT, Google AI, Gemini, and Perplexity" },
    { feature: "Starting price", clientory: "Free report, one month free, then $10/mo", competitor: "$99/domain/mo billed annually" },
    { feature: "Industry-specific prompt library", clientory: "yes", competitor: "no" },
    { feature: "Competitor gap vs. local rivals", clientory: "yes", competitor: "partial" },
    { feature: "Actionable fix-it recommendations", clientory: "yes", competitor: "partial" },
    { feature: "Free trial", clientory: "yes", competitor: "yes" },
  ],
  chooseClientory: [
    "You want a focused product without a larger marketing-suite workflow",
    "You need immigration-specific prompt testing and benchmarking",
    "You want to track mentions inside AI assistants, not just AI Overviews",
    "You're a small firm that doesn't need Semrush's full SEO suite",
  ],
  chooseCompetitor: [
    "You want Semrush's broader AI competitor and prompt-research workflow",
    "You need a combined SEO + GEO solution in one dashboard",
    "You want deep traditional SEO analytics alongside AI monitoring",
    "You're a marketing agency managing multiple client domains",
  ],
  methodology: [
    "Clientory runs industry-specific prompts across ChatGPT, Claude, and Gemini, grading each one as Positive, Passive, or No mention and rolling the result into a 0-100 visibility score with a competitor gap. Every prompt mirrors a real prospective client query about visas, green cards, naturalization, or removal defense.",
    "Semrush AI Visibility currently includes AI visibility reports for any domain, 25 custom prompts with daily tracking, competitor analysis, prompt research, and coverage across ChatGPT, Google AI, Gemini, and Perplexity.",
    "The key difference is specialization and workflow. Clientory generates an immigration-focused prompt set from a firm profile and highlights the competing firms filling its gaps. Semrush offers broader per-domain AI research and monitoring for general marketing teams.",
  ],
  pricingRows: [
    { label: "Try before paying", clientory: "One free report, no card", competitor: "Check Semrush's current trial offer" },
    { label: "Subscription", clientory: "One month free, then $10/mo", competitor: "$99/domain/mo billed annually" },
    { label: "Custom prompts", clientory: "25 per weekly scan", competitor: "25 with daily tracking" },
    { label: "Pricing basis", clientory: "One simple plan", competitor: "Per domain" },
  ],
  competitorSource: {
    label: "Verify Semrush's current AI Visibility pricing",
    url: "https://www.semrush.com/pricing/ai/",
  },
  faqs: [
    { question: "Do I need a separate Semrush SEO subscription?", answer: "Semrush currently sells AI Visibility as a per-domain product. Confirm its checkout terms for your account. Clientory is standalone: one free report, an optional free month, and then $10 per month." },
    { question: "Does Semrush track ChatGPT mentions?", answer: "Yes. Semrush's current AI Visibility coverage includes ChatGPT, Google AI, Gemini, and Perplexity. Clientory directly queries ChatGPT, Claude, and Gemini, with Perplexity and Copilot coming soon." },
    { question: "Can I use Clientory alongside Semrush?", answer: "Absolutely. Many firms use Semrush for traditional SEO and Clientory for AI visibility monitoring. The two tools complement each other well." },
    { question: "Which tool is better for tracking local visibility?", answer: "For AI visibility in local immigration searches, Clientory gives more targeted insight. Semrush excels at traditional local SEO tracking." },
  ],
};

const CompareSemrush = () => <ComparisonPage data={data} />;
export default CompareSemrush;

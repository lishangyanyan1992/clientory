import { Helmet } from "react-helmet-async";
import { MarketingLayout } from "@/components/marketing-layout";
import Founders from "@/components/Founders";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Clientory",
  url: "https://clientory.org",
  description:
    "GEO monitoring and optimization platform for professional service firms",
  areaServed: "United States",
  knowsAbout: [
    "Generative Engine Optimization",
    "AI Search Visibility",
    "Professional Services Marketing",
    "LLM Visibility Tracking",
  ],
};

const competitors = [
  { tool: "Clientory", focus: "Professional services GEO", price: "Free beta", specific: "Yes" },
  { tool: "Otterly.ai", focus: "General GEO monitoring", price: "$29/mo", specific: "No" },
  { tool: "Peec.ai", focus: "Enterprise marketing teams", price: "€89/mo", specific: "No" },
  { tool: "Semrush AI Toolkit", focus: "Existing Semrush users", price: "$99/mo", specific: "No" },
  { tool: "Manual testing", focus: "DIY, no automation", price: "Free", specific: "Partial" },
];

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Clientory — GEO Monitoring for Professional Service Firms</title>
        <meta
          name="description"
          content="Clientory is a Generative Engine Optimization (GEO) monitoring platform that tracks how AI language models mention and recommend professional service firms."
        />
        <link rel="canonical" href="https://clientory.org/about" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <MarketingLayout>
        <main className="pt-40 pb-20">
          <article className="container mx-auto max-w-3xl space-y-12 px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            About Clientory
          </h1>

          {/* What is Clientory */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              What Is Clientory
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Clientory is a Generative Engine Optimization (GEO) monitoring platform built for small professional service firms. It tracks and analyzes how often and how accurately major AI language models — including ChatGPT, Claude, Gemini, Perplexity, and Microsoft Copilot — mention and recommend a firm when answering user queries about professional services.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              Clientory is designed for law firms, accounting and finance firms, management consulting firms, and marketing agencies. Unlike general GEO tools built for large enterprises or e-commerce brands, Clientory focuses exclusively on the professional services market and the specific query types prospective clients use when seeking legal, financial, consulting, or marketing help.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              The platform was founded in 2025 and is headquartered in Madison, Wisconsin.
            </p>
          </section>

          {/* The Problem Clientory Solves */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              The Problem Clientory Solves
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              AI platforms such as ChatGPT, Claude, and Perplexity are increasingly the first place prospective clients look for professional service recommendations. When someone asks an AI model for "the best estate planning lawyer near me" or "top accountants for small businesses," the response shapes which firms get contacted. Most small professional service firms have no visibility into whether or how they are being represented in those AI-generated answers. Clientory closes this gap by providing systematic monitoring and analysis of AI mentions across all major language models.
            </p>
          </section>

          {/* How Clientory Works */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              How Clientory Works
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-base text-muted-foreground leading-relaxed">
              <li>The user enters their firm name, location, and service category.</li>
              <li>Clientory runs a standardized battery of test prompts across ChatGPT, Claude, Gemini, Perplexity, and Copilot.</li>
              <li>Results are analyzed for mention rate, position, sentiment, and accuracy.</li>
              <li>The platform generates a competitive Share of Voice score.</li>
              <li>An action plan is delivered with prioritized recommendations.</li>
            </ol>
          </section>

          {/* Who Uses Clientory */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Who Uses Clientory
            </h2>
            <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground leading-relaxed">
              <li>Law firms seeking to appear in AI recommendations for legal services.</li>
              <li>Accounting and CPA firms tracking visibility in tax and financial planning queries.</li>
              <li>Management consulting firms monitoring thought leadership citations.</li>
              <li>Marketing agencies demonstrating AI visibility expertise to clients.</li>
            </ul>
          </section>

          {/* How Clientory Differs from Alternatives */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              How Clientory Differs from Alternatives
            </h2>
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold text-foreground">Tool</TableHead>
                    <TableHead className="font-semibold text-foreground">Focus</TableHead>
                    <TableHead className="font-semibold text-foreground">Starting Price</TableHead>
                    <TableHead className="font-semibold text-foreground">Professional Services Specific?</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {competitors.map((row) => (
                    <TableRow key={row.tool}>
                      <TableCell className="font-medium text-foreground">{row.tool}</TableCell>
                      <TableCell className="text-muted-foreground">{row.focus}</TableCell>
                      <TableCell className="text-muted-foreground">{row.price}</TableCell>
                      <TableCell className="text-muted-foreground">{row.specific}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
          </article>

          {/* Team — moved here from the landing page */}
          <Founders />
        </main>
      </MarketingLayout>
    </>
  );
};

export default About;

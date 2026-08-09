import { MarketingLayout } from "@/components/marketing-layout";
import Founders from "@/components/Founders";
import { Link } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { BILLING_CONFIG } from "@/lib/billing-config";
import { JsonLd, SeoMeta } from "@/components/SeoMeta";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Clientory",
  url: "https://clientory.org",
  description:
    "GEO monitoring and optimization platform for independent immigration law firms",
  areaServed: "United States",
  knowsAbout: [
    "Generative Engine Optimization",
    "AI Search Visibility",
    "Immigration Law Marketing",
    "LLM Visibility Tracking",
  ],
};

const competitors = [
  {
    tool: "Clientory",
    focus: "Immigration law GEO",
    price: `Free report, one month free, then $${BILLING_CONFIG.monthlyPriceUsd}/mo`,
    specific: "Yes",
    href: "/pricing",
  },
  { tool: "Otterly.ai", focus: "General GEO monitoring", price: "$29/mo", specific: "No", href: "/clientory-vs-otterly" },
  { tool: "Peec.ai", focus: "Marketing and SEO teams", price: "$95/mo", specific: "No", href: "/clientory-vs-peec" },
  { tool: "Semrush AI Visibility", focus: "General AI visibility", price: "$99/domain/mo billed annually", specific: "No", href: "/clientory-vs-semrush-ai" },
  { tool: "Manual testing", focus: "DIY, no automation", price: "API fees + your time", specific: "Partial", href: "/clientory-vs-manual-testing" },
];

const About = () => {
  return (
    <>
      <SeoMeta
        title="About Clientory — AI Visibility for Immigration Law Firms"
        description="Clientory tracks how ChatGPT, Claude, and Gemini mention and recommend independent immigration law firms."
        path="/about"
      />
      <JsonLd data={jsonLd} />

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
              Clientory is a Generative Engine Optimization (GEO) monitoring platform built for independent immigration law firms. It tracks and analyzes how often and how accurately major AI assistants — ChatGPT, Claude, and Gemini today, with Perplexity and Microsoft Copilot coming soon — mention and recommend a firm when someone asks for an immigration lawyer.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              Clientory is built for the owners and operators of independent immigration practices — solo attorneys through mid-sized firms. Unlike general GEO tools built for large enterprises or e-commerce brands, Clientory focuses exclusively on immigration law and the questions prospective clients actually ask about green cards, visas, naturalization, and removal defense.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              Clientory was founded in 2026 and is headquartered in Madison, Wisconsin.
            </p>
          </section>

          {/* The Problem Clientory Solves */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              The Problem Clientory Solves
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              AI assistants are increasingly the first place prospective clients look for an immigration lawyer. When someone asks for "the best marriage green card attorney near me" or "an H-1B lawyer for startups," the answer shapes which firms get called. Most immigration firms have no visibility into whether or how they appear in those answers. Clientory closes that gap with systematic monitoring across the AI assistants it supports.
            </p>
          </section>

          {/* How Clientory Works */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              How Clientory Works
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-base text-muted-foreground leading-relaxed">
              <li>The user enters their firm name, location, practice areas, and website.</li>
              <li>Clientory generates 5 test prompts on a free report, or 25 on a subscription, and runs them across ChatGPT and Claude, plus Gemini on subscribed scans. Perplexity and Copilot are coming soon.</li>
              <li>Each prompt is graded per model as Positive, Passive, or No mention.</li>
              <li>The platform returns a 0–100 AI visibility score and a competitor gap showing which rival firms appear in prompts the firm is missing from.</li>
              <li>Subscribed firms are re-scanned every 7 days, with weekly snapshots and alerts when a new competitor appears or the score changes.</li>
              <li>The AI Presence Coach, included with a subscription, answers questions against the latest scan and recommends what to fix first.</li>
            </ol>
          </section>

          {/* Who Uses Clientory */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              Who Uses Clientory
            </h2>
            <ul className="list-disc list-inside space-y-2 text-base text-muted-foreground leading-relaxed">
              <li>Family and humanitarian immigration practices competing for green card, asylum, and naturalization inquiries.</li>
              <li>Employment immigration firms tracking visibility for H-1B, PERM, and O-1 queries.</li>
              <li>Removal defense and litigation practices monitoring how AI describes their work.</li>
              <li>Growing firms opening in a new metro who need to know whether AI names them there yet.</li>
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
                    <TableHead className="font-semibold text-foreground">Immigration-specific?</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {competitors.map((row) => (
                    <TableRow key={row.tool}>
                      <TableCell className="font-medium text-foreground">
                        <Link to={row.href} className="text-primary underline-offset-4 hover:underline">
                          {row.tool}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{row.focus}</TableCell>
                      <TableCell className="text-muted-foreground">{row.price}</TableCell>
                      <TableCell className="text-muted-foreground">{row.specific}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground">
              Competitor pricing was checked on August 9, 2026 and may change. See the linked comparison pages for current source links.
            </p>
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

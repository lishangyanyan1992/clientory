import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";
import { Check, X, AlertTriangle } from "lucide-react";

export interface ComparisonFeature {
  feature: string;
  clientory: "yes" | "no" | "partial" | string;
  competitor: "yes" | "no" | "partial" | string;
}

export interface ComparisonPageData {
  slug: string;
  competitorName: string;
  verdict: string;
  features: ComparisonFeature[];
  chooseClientory: string[];
  chooseCompetitor: string[];
  methodology: string[];
  pricingRows: { label: string; clientory: string; competitor: string }[];
  faqs: { question: string; answer: string }[];
}

const StatusIcon = ({ value }: { value: string }) => {
  if (value === "yes") return <Check className="inline w-4 h-4 text-accent" />;
  if (value === "no") return <X className="inline w-4 h-4 text-destructive" />;
  if (value === "partial") return <AlertTriangle className="inline w-4 h-4 text-yellow-500" />;
  return <span className="text-sm text-muted-foreground">{value}</span>;
};

const CellContent = ({ value }: { value: string }) => {
  if (value === "yes") return <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-accent" /> Yes</span>;
  if (value === "no") return <span className="flex items-center gap-1.5"><X className="w-4 h-4 text-destructive" /> No</span>;
  if (value === "partial") return <span className="flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-yellow-500" /> Partial</span>;
  return <span className="text-sm text-muted-foreground">{value}</span>;
};

const ComparisonPage = ({ data }: { data: ComparisonPageData }) => {
  const title = `Clientory vs. ${data.competitorName}: Which is Right for Professional Service Firms?`;
  const metaDesc = `Compare Clientory and ${data.competitorName} for GEO monitoring. See features, pricing, and which tool is best for law firms, accounting firms, and consultancies.`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://clientory.org/" },
      { "@type": "ListItem", position: 2, name: title, item: `https://clientory.org/${data.slug}` },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={`https://clientory.org/${data.slug}`} />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-20">
        <article className="container max-w-4xl px-6 mx-auto space-y-14">
          {/* H1 */}
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{title}</h1>

          {/* Quick Verdict */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-2">
            <p className="text-sm font-semibold text-primary uppercase tracking-wide">Quick Verdict</p>
            <p className="text-base text-foreground leading-relaxed">{data.verdict}</p>
          </div>

          {/* Side-by-Side Comparison */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Side-by-Side Comparison</h2>
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold text-foreground">Feature</TableHead>
                    <TableHead className="font-semibold text-foreground">Clientory</TableHead>
                    <TableHead className="font-semibold text-foreground">{data.competitorName}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.features.map((row) => (
                    <TableRow key={row.feature}>
                      <TableCell className="font-medium text-foreground">{row.feature}</TableCell>
                      <TableCell><CellContent value={row.clientory} /></TableCell>
                      <TableCell><CellContent value={row.competitor} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          {/* Who Each Tool Is Best For */}
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Who Each Tool Is Best For</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3">
                <h3 className="text-lg font-semibold text-primary">Choose Clientory if…</h3>
                <ul className="space-y-2">
                  {data.chooseClientory.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-6 space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Choose {data.competitorName} if…</h3>
                <ul className="space-y-2">
                  {data.chooseCompetitor.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 mt-0.5 text-muted-foreground/50 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Methodology Comparison */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Detailed Methodology Comparison</h2>
            {data.methodology.map((p, i) => (
              <p key={i} className="text-base text-muted-foreground leading-relaxed">{p}</p>
            ))}
          </section>

          {/* Pricing */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Pricing Comparison</h2>
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold text-foreground">Plan</TableHead>
                    <TableHead className="font-semibold text-foreground">Clientory</TableHead>
                    <TableHead className="font-semibold text-foreground">{data.competitorName}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.pricingRows.map((row) => (
                    <TableRow key={row.label}>
                      <TableCell className="font-medium text-foreground">{row.label}</TableCell>
                      <TableCell className="text-muted-foreground">{row.clientory}</TableCell>
                      <TableCell className="text-muted-foreground">{row.competitor}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          {/* FAQ */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {data.faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-foreground">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* CTA */}
          <section className="rounded-xl p-8 text-center space-y-4" style={{ background: "var(--gradient-primary)" }}>
            <h2 className="text-2xl font-bold text-primary-foreground">
              See how Clientory tracks your firm's AI visibility — free for 14 days
            </h2>
            <a href="https://clientoryapp.lovable.app" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="secondary" className="rounded-full px-8 mt-2">
                Start Free Trial
              </Button>
            </a>
          </section>
        </article>
      </main>

      <Footer />
    </>
  );
};

export default ComparisonPage;

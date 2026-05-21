import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MarketingLayout } from "@/components/marketing-layout";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

const tocSections = [
  { id: "what-is-geo", label: "What Is GEO?" },
  { id: "why-at-risk", label: "Why Firms Are at Risk" },
  { id: "how-ai-decides", label: "How AI Decides" },
  { id: "key-metrics", label: "5 Key Metrics" },
  { id: "industry-specific", label: "Industry Considerations" },
  { id: "manual-test", label: "Manual AI Visibility Test" },
  { id: "tools", label: "Tools for Tracking" },
  { id: "how-clientory-helps", label: "How Clientory Helps" },
  { id: "faq", label: "FAQ" },
];

const faqItems = [
  {
    q: "What is GEO for professional services?",
    a: "GEO (Generative Engine Optimization) for professional services is the practice of monitoring and improving how AI language models like ChatGPT, Claude, Gemini, and Perplexity mention, describe, and recommend law firms, accounting firms, consulting firms, and marketing agencies in response to user queries.",
  },
  {
    q: "How do I check if ChatGPT recommends my law firm?",
    a: "Open ChatGPT and enter prompts such as 'best estate planning lawyer in [your city]' or 'top family law attorneys near [your location].' Run at least 10 variations covering your practice areas and geography. Note whether your firm appears, its position in the list, and whether the information is accurate. For systematic tracking, use a GEO monitoring tool like Clientory.",
  },
  {
    q: "How do I get my accounting firm to appear in AI search results?",
    a: "Ensure your firm is listed on major directories including the AICPA directory, Google Business Profile, Yelp, and industry-specific platforms. Publish authoritative content on topics like tax planning, audit services, and financial advisory. Maintain consistent NAP (Name, Address, Phone) information across all listings. Encourage client reviews on Google and industry directories.",
  },
  {
    q: "What is Share of Voice in AI search?",
    a: "Share of Voice in AI search measures the percentage of relevant AI-generated responses that mention your firm compared to your competitors. For example, if you run 50 test prompts related to your services and geography, and your firm appears in 10 of them while a competitor appears in 25, your Share of Voice is 20% and theirs is 50%.",
  },
  {
    q: "How long does it take to improve AI visibility?",
    a: "Initial improvements can appear within 4 to 8 weeks for AI platforms that use real-time web search (such as Perplexity and ChatGPT with browsing). Changes to base training data take longer, typically 3 to 6 months, as models are retrained periodically. Directory listing updates and review accumulation are ongoing processes.",
  },
  {
    q: "Does traditional SEO help with LLM visibility?",
    a: "Traditional SEO provides a foundation but is not sufficient on its own. AI models prioritize entity recognition, structured data, authoritative mentions across multiple sources, and consistent factual information. Many SEO best practices — such as quality content, authoritative backlinks, and structured data — do contribute to GEO, but AI visibility requires additional strategies like directory optimization and entity-topic association.",
  },
  {
    q: "What directories does ChatGPT use for professional service recommendations?",
    a: "ChatGPT draws from a combination of its training data and real-time web search results. Key directories include Google Business Profile, Yelp, Avvo and FindLaw (for law firms), the AICPA directory (for accountants), Clutch.co (for consulting and agencies), and industry-specific platforms. Review signals from these directories influence AI recommendations.",
  },
  {
    q: "How is Clientory different from Otterly or Peec?",
    a: "Clientory is built exclusively for professional service firms — law firms, accounting firms, consulting firms, and marketing agencies. It uses industry-specific test prompts, understands professional services directories, and benchmarks against relevant competitors. Otterly.ai and Peec.ai are general-purpose GEO tools designed for e-commerce brands and enterprise marketing teams respectively. Clientory's pricing starts with a free beta, while Otterly starts at $29/month and Peec at €89/month.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "GEO for Professional Services: The Complete Guide (2026)",
  description:
    "How law firms, accounting firms, consulting firms, and marketing agencies can measure and improve their visibility in ChatGPT, Gemini, Perplexity, and other AI platforms.",
  author: {
    "@type": "Organization",
    name: "Clientory",
    url: "https://clientory.org",
  },
  publisher: {
    "@type": "Organization",
    name: "Clientory",
    url: "https://clientory.org",
  },
  datePublished: "2026-03-15",
  dateModified: "2026-03-15",
};

const tools = [
  { tool: "Clientory", focus: "Professional services GEO", price: "Free beta", specific: "Yes" },
  { tool: "Otterly.ai", focus: "General GEO monitoring", price: "$29/mo", specific: "No" },
  { tool: "Peec.ai", focus: "Enterprise marketing teams", price: "€89/mo", specific: "No" },
  { tool: "Semrush AI Toolkit", focus: "Existing Semrush users", price: "$99/mo", specific: "No" },
  { tool: "Manual testing", focus: "DIY, no automation", price: "Free", specific: "N/A" },
];

function StatCallout({ stat, source }: { stat: string; source: string }) {
  return (
    <div className="my-8 rounded-xl border border-primary/20 bg-primary/5 p-6 md:p-8">
      <p className="text-lg md:text-xl font-semibold text-foreground leading-snug">
        {stat}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{source}</p>
    </div>
  );
}

const GeoGuide = () => {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );

    tocSections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Helmet>
        <title>GEO for Professional Services: The Complete Guide (2026)</title>
        <meta
          name="description"
          content="How law firms, accounting firms, consulting firms, and marketing agencies can measure and improve their visibility in ChatGPT, Gemini, Perplexity, and other AI platforms."
        />
        <link rel="canonical" href="https://clientory.org/geo-for-professional-services" />
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
      </Helmet>

      <MarketingLayout>
        <div className="pt-40 pb-20">
          <div className="container mx-auto flex gap-12 px-6">
          {/* Sticky TOC — desktop */}
          <aside className="hidden lg:block w-56 shrink-0">
            <nav className="sticky top-36 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Contents
              </p>
              {tocSections.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`block text-sm py-1 transition-colors ${
                    activeId === id
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <article className="max-w-3xl flex-1 space-y-14">
            <header>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                GEO for Professional Services: The Complete Guide (2026)
              </h1>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                How law firms, accounting firms, consulting firms, and marketing agencies can measure and improve their visibility in ChatGPT, Gemini, Perplexity, and other AI platforms.
              </p>
            </header>

            {/* ─── What Is GEO ─── */}
            <section id="what-is-geo" className="space-y-4 scroll-mt-24">
              <h2 className="text-2xl font-semibold text-foreground">
                What Is GEO (Generative Engine Optimization)?
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Generative Engine Optimization (GEO) is the practice of improving how a brand, business, or individual is represented in responses generated by large language models (LLMs) such as ChatGPT, Claude, Gemini, Perplexity, and Microsoft Copilot. Unlike traditional search engine optimization (SEO), which focuses on ranking in a list of blue links, GEO focuses on whether and how an entity is mentioned within AI-generated prose answers.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                For professional service firms — law firms, accounting practices, management consultancies, and marketing agencies — GEO represents a fundamental shift in how prospective clients discover and evaluate service providers. When a user asks an AI assistant "Who are the best tax accountants in Denver?" the model synthesizes information from its training data, real-time web search results, directory listings, and review signals to produce a curated recommendation. Firms that do not appear in these responses are effectively invisible to a growing segment of the market.
              </p>
              <StatCallout
                stat="58% of consumers have replaced traditional search with AI tools for discovering services."
                source="Capgemini, 2025"
              />
            </section>

            {/* ─── Why at Risk ─── */}
            <section id="why-at-risk" className="space-y-4 scroll-mt-24">
              <h2 className="text-2xl font-semibold text-foreground">
                Why Professional Service Firms Are at Risk
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                The shift to AI-mediated discovery poses a disproportionate risk to small and mid-sized professional service firms. Research indicates that 84% of decision-makers act on an AI platform's first suggestion without seeking additional options. This means that if your firm is not mentioned in the initial AI response, you are unlikely to be considered at all.
              </p>
              <StatCallout
                stat="Only 1.2% of local businesses are recommended by ChatGPT in response to service-related queries."
                source="BrightLocal, 2025"
              />
              <p className="text-base text-muted-foreground leading-relaxed">
                The concentration effect is even more pronounced in professional services. Legal, accounting, and consulting queries trigger AI Overviews at a 77%+ rate in Google Search, meaning that traditional organic listings are being pushed below the fold even before users switch to dedicated AI tools. Firms that relied on SEO alone are finding their visibility eroded from two directions simultaneously.
              </p>
              <StatCallout
                stat="Legal, accounting, and consulting queries trigger AI Overviews at a 77%+ rate in Google Search."
                source="Search Engine Land, 2025"
              />
            </section>

            {/* ─── How AI Decides ─── */}
            <section id="how-ai-decides" className="space-y-6 scroll-mt-24">
              <h2 className="text-2xl font-semibold text-foreground">
                How AI Platforms Decide Which Firms to Recommend
              </h2>

              <div className="space-y-4">
                <h3 className="text-xl font-medium text-foreground">
                  Training Data and Entity Recognition
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Large language models are trained on vast corpora of web text, including Wikipedia, news articles, industry publications, and professional directories. Firms with a strong, consistent presence across authoritative sources are more likely to be recognized as entities — distinct, identifiable organizations that the model can reference by name. Entity recognition is a prerequisite for AI recommendation: if the model does not "know" a firm exists, it cannot recommend it.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-medium text-foreground">
                  Real-Time Web Search
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Several AI platforms — including ChatGPT (with browsing), Gemini, and Perplexity — augment their base knowledge with real-time web search. When a user asks for a local professional service recommendation, these models query the web and synthesize results from multiple sources. This means that current SEO performance, recent press coverage, and up-to-date directory listings directly influence AI responses, even if the firm is absent from the model's training data.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-medium text-foreground">
                  Directory Listings and Review Signals
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  AI models weigh directory presence and review signals heavily when recommending professional services. Google Business Profile, Yelp, and industry-specific directories (Avvo for lawyers, the AICPA directory for accountants, Clutch.co for consultants and agencies) serve as structured data sources that models can parse with high confidence. Review volume, average rating, and review recency all contribute to a firm's likelihood of being recommended.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-medium text-foreground">
                  Content Authority Signals
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Firms that publish authoritative, topic-specific content — such as blog posts, whitepapers, case studies, and thought leadership articles — build stronger entity-topic associations in AI models. When a firm's website consistently addresses specific practice areas or service categories, models are more likely to associate that firm with those topics and recommend it in relevant queries. Backlinks from authoritative sources further reinforce these associations.
                </p>
              </div>
            </section>

            {/* ─── 5 Key Metrics ─── */}
            <section id="key-metrics" className="space-y-6 scroll-mt-24">
              <h2 className="text-2xl font-semibold text-foreground">
                The 5 Key Metrics for Measuring AI Visibility
              </h2>

              {[
                {
                  num: 1,
                  title: "Mention Rate",
                  desc: "The percentage of test prompts where your firm appears in the AI-generated response. A firm that appears in 8 out of 50 test prompts has a mention rate of 16%. This is the most fundamental GEO metric and the starting point for any visibility assessment.",
                },
                {
                  num: 2,
                  title: "Share of Voice",
                  desc: "Your firm's mentions as a proportion of total competitor mentions across the same set of test prompts. Share of Voice reveals your competitive position: a firm with 20 mentions out of 100 total competitor mentions has a 20% Share of Voice. This metric is most useful when tracked over time.",
                },
                {
                  num: 3,
                  title: "Position",
                  desc: "Where in the AI response your firm appears. Firms mentioned first in a list or early in a prose response receive disproportionate attention. Position tracking helps identify whether optimization efforts are moving your firm up in AI recommendations.",
                },
                {
                  num: 4,
                  title: "Sentiment",
                  desc: "How the AI describes your firm — positively, neutrally, or negatively. Sentiment analysis reveals whether the model's training data or web sources contain unfavorable information that could deter prospective clients. Negative sentiment requires immediate investigation and remediation.",
                },
                {
                  num: 5,
                  title: "Accuracy",
                  desc: "Whether the factual information AI states about your firm is correct. AI models frequently hallucinate details such as office locations, practice areas, founding dates, and attorney names. Inaccurate information can mislead prospective clients and damage trust.",
                },
              ].map((m) => (
                <div key={m.num} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {m.num}
                  </span>
                  <div>
                    <h3 className="text-lg font-medium text-foreground">{m.title}</h3>
                    <p className="mt-1 text-base text-muted-foreground leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              ))}
            </section>

            {/* ─── Industry-Specific ─── */}
            <section id="industry-specific" className="space-y-8 scroll-mt-24">
              <h2 className="text-2xl font-semibold text-foreground">
                Industry-Specific Considerations
              </h2>

              <div className="space-y-4">
                <h3 className="text-xl font-medium text-foreground">Law Firms</h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Law firms should prioritize listings on Avvo, FindLaw, Martindale-Hubbell, and Justia in addition to Google Business Profile. These legal directories carry significant weight in AI recommendations for legal services. Firms must also be aware of ethical compliance requirements: the American Bar Association's Formal Opinion 512 (2024) addresses AI-related marketing considerations, and state bar rules on advertising apply to AI visibility strategies just as they apply to traditional marketing channels.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-medium text-foreground">Accounting Firms</h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Accounting and CPA firms benefit from AICPA directory listings, state CPA society memberships, and credential signals (CPA, CMA, EA designations) that AI models use to validate expertise. Seasonal content strategy is particularly important: publishing tax planning content in Q4 and tax preparation guides in Q1 aligns with when prospective clients are most actively searching. AI models with real-time search capabilities will surface this timely content in their recommendations.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-medium text-foreground">Consulting Firms</h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Management consulting firms depend heavily on thought leadership for AI visibility. Publishing original research, case studies, and industry analyses builds entity-topic associations that cause AI models to recommend the firm for specific consulting needs. Listings on Clutch.co, which aggregates verified client reviews, provide structured data that AI models parse when generating consulting recommendations. The goal is to create a strong association between the firm's name and specific areas of expertise.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-medium text-foreground">Marketing Agencies</h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Marketing agencies face what might be called the GEO paradox: your own AI visibility is your most compelling case study. If your agency claims to help clients with digital visibility but does not appear in AI recommendations for marketing services, prospective clients will question your capabilities. Key directories include DesignRush, Agency Spotter, and Clutch.co. Agencies should also publish GEO-specific content to establish authority in this emerging field.
                </p>
              </div>
            </section>

            {/* ─── Manual Test ─── */}
            <section id="manual-test" className="space-y-6 scroll-mt-24">
              <h2 className="text-2xl font-semibold text-foreground">
                How to Run a Manual AI Visibility Test (Step by Step)
              </h2>

              <ol className="list-decimal list-inside space-y-4 text-base text-muted-foreground leading-relaxed">
                <li>
                  <strong className="text-foreground">Choose 3–5 AI platforms to test.</strong> At minimum, use ChatGPT, Gemini, and Perplexity. Add Claude and Microsoft Copilot for a more complete picture.
                </li>
                <li>
                  <strong className="text-foreground">Write 10–15 test prompts</strong> that reflect how a prospective client would search for your services. Examples:
                  <ul className="mt-2 ml-6 list-disc space-y-1 text-sm">
                    <li><em>Law:</em> "Who are the best estate planning lawyers in [city]?"</li>
                    <li><em>Accounting:</em> "Recommend a CPA firm for small business taxes in [city]."</li>
                    <li><em>Consulting:</em> "Top management consulting firms for healthcare in [region]."</li>
                    <li><em>Marketing:</em> "Best digital marketing agencies for B2B companies in [city]."</li>
                  </ul>
                </li>
                <li>
                  <strong className="text-foreground">Run each prompt on each platform</strong> and record: (a) whether your firm is mentioned, (b) its position in the response, (c) how it is described, and (d) whether the information is accurate.
                </li>
                <li>
                  <strong className="text-foreground">Run the same prompts for 2–3 competitors</strong> to establish a baseline Share of Voice comparison.
                </li>
                <li>
                  <strong className="text-foreground">Document the results in a spreadsheet</strong> with columns for platform, prompt, mentioned (yes/no), position, sentiment, and accuracy notes.
                </li>
                <li>
                  <strong className="text-foreground">Repeat monthly</strong> to track changes over time. AI responses are non-deterministic, so run each prompt at least twice per session and average the results.
                </li>
              </ol>
            </section>

            {/* ─── Tools ─── */}
            <section id="tools" className="space-y-4 scroll-mt-24">
              <h2 className="text-2xl font-semibold text-foreground">
                Tools for Tracking AI Visibility
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Several platforms offer automated GEO monitoring. The table below compares the primary options available as of early 2026.
              </p>
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
                    {tools.map((row) => (
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

            {/* ─── How Clientory Helps ─── */}
            <section id="how-clientory-helps" className="space-y-4 scroll-mt-24">
              <h2 className="text-2xl font-semibold text-foreground">
                How Clientory Helps
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Clientory automates the entire AI visibility monitoring process for professional service firms. Instead of manually testing prompts across multiple platforms, Clientory runs a standardized battery of industry-specific test prompts across ChatGPT, Claude, Gemini, Perplexity, and Microsoft Copilot — and delivers results in a unified dashboard.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                The platform calculates mention rate, Share of Voice, position, sentiment, and accuracy scores automatically, and benchmarks your firm against local competitors. Each report includes a prioritized action plan with specific recommendations for improving visibility across each AI platform.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                Clientory is currently available as a free beta at{" "}
                <Link to="/scan" className="text-primary underline">
                  clientory.org/scan
                </Link>
                .
              </p>
            </section>

            {/* ─── FAQ ─── */}
            <section id="faq" className="space-y-6 scroll-mt-24">
              <h2 className="text-2xl font-semibold text-foreground">
                Frequently Asked Questions
              </h2>
              {faqItems.map((item, i) => (
                <div key={i} className="space-y-2 border-b border-border pb-6 last:border-0">
                  <h3 className="text-lg font-medium text-foreground">{item.q}</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              ))}
            </section>
          </article>
        </div>
        </div>
      </MarketingLayout>
    </>
  );
};

export default GeoGuide;

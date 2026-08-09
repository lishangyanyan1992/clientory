import { useEffect, useState } from "react";
import { MarketingLayout } from "@/components/marketing-layout";
import { JsonLd, SeoMeta } from "@/components/SeoMeta";
import { TrackedAppLink } from "@/components/TrackedAppLink";

const PAGE_URL = "https://clientory.org/geo-for-professional-services";

const tocSections = [
  { id: "what-geo-means", label: "What GEO Means" },
  { id: "how-ai-finds-firms", label: "How AI Finds Firms" },
  { id: "technical-foundation", label: "Technical Foundation" },
  { id: "law-firm-content", label: "Law Firm Content" },
  { id: "local-entity-signals", label: "Local & Entity Signals" },
  { id: "manual-audit", label: "Manual Visibility Audit" },
  { id: "metrics", label: "Metrics That Matter" },
  { id: "ninety-day-plan", label: "90-Day Plan" },
  { id: "professional-services", label: "Other Professional Services" },
  { id: "faq", label: "Law Firm FAQ" },
  { id: "sources", label: "Primary Sources" },
];

const faqItems = [
  {
    q: "What is GEO for a law firm?",
    a: "Generative engine optimization (GEO), also called AI search optimization, is the work of making a law firm easy to discover, understand, verify, and accurately cite in AI-assisted search. It combines established SEO, local search, clear firm information, useful legal content, third-party corroboration, crawler access, and repeatable measurement. It does not guarantee that an AI assistant will recommend a firm.",
  },
  {
    q: "How can a small law firm check whether ChatGPT recommends it?",
    a: "Create a fixed set of realistic prospective-client questions covering the firm’s practice areas, locations, languages, and matter types. Run the same prompts in fresh sessions, record the date, platform, model or search mode, mentions, citations, competitors, and factual errors, then repeat on a consistent schedule. One answer is only a snapshot because results can change by prompt, location, platform, and time.",
  },
  {
    q: "Does traditional SEO help a law firm appear in AI search?",
    a: "Yes. Google says the same SEO fundamentals apply to AI Overviews and AI Mode, with no special AI markup required. Crawlability, indexability, internal links, useful text, page experience, accurate structured data, and an up-to-date Business Profile remain foundational. Other AI search products also rely on crawlers or search indexes, so sound SEO improves eligibility and retrievability even though it cannot guarantee a mention.",
  },
  {
    q: "Does schema markup make ChatGPT or Google recommend a law firm?",
    a: "No. Accurate Organization, LegalService or LocalBusiness, Person, Article, and Breadcrumb structured data can help machines understand facts, but neither Google nor the major AI platforms promise a recommendation because schema is present. Markup must match visible page content and should never contain invented reviews, awards, locations, or credentials.",
  },
  {
    q: "Which directories does ChatGPT use to recommend lawyers?",
    a: "There is no published, permanent list of directories that ChatGPT always uses. Search-grounded answers can draw from different sources over time. Maintain accurate profiles on platforms that real clients and the legal profession use in your market—such as Google Business Profile, Bing Places, applicable bar directories, and reputable legal directories—and verify which sources are actually cited in your own test results.",
  },
  {
    q: "Should a law firm add an llms.txt file?",
    a: "Treat llms.txt as optional. Google states that it does not use special AI text files or special markup for its generative search features. An llms.txt file is not a substitute for crawlable HTML, a sitemap, internal links, accurate metadata, or allowing the search-specific crawlers a firm wants to reach.",
  },
  {
    q: "How long does it take to improve AI visibility for a law firm?",
    a: "There is no defensible universal timeline. A technical fix can be discovered after a recrawl, while reputation, reviews, links, and third-party corroboration usually develop over a longer period. Measure from a dated baseline, submit important updates through the relevant webmaster tools, and compare results over several consistent testing cycles instead of promising a four-, eight-, or twelve-week outcome.",
  },
  {
    q: "What should a small law firm improve first?",
    a: "Start with eligibility and accuracy: confirm important pages return a normal success status, contain meaningful HTML without requiring interaction, have unique titles and canonical URLs, appear in the sitemap, and are not blocked by robots.txt, the CDN, or a noindex directive. Then fix the firm’s core facts across its website, Business Profiles, attorney bios, and major directory listings before publishing more content.",
  },
];

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "AI Search Optimization (GEO) for Law Firms: A Practical 2026 Guide",
  description:
    "A verified, practical guide to AI search visibility for small and mid-sized law firms, based on current guidance from Google, Bing, OpenAI, Anthropic, and Perplexity.",
  mainEntityOfPage: PAGE_URL,
  author: {
    "@type": "Person",
    name: "Yanyan Li",
    url: "https://clientory.org/about",
  },
  publisher: {
    "@type": "Organization",
    name: "Clientory",
    url: "https://clientory.org",
    logo: {
      "@type": "ImageObject",
      url: "https://clientory.org/images/logo-full.png",
    },
  },
  datePublished: "2026-03-15",
  dateModified: "2026-08-09",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://clientory.org/" },
    { "@type": "ListItem", position: 2, name: "AI Search Optimization for Law Firms", item: PAGE_URL },
  ],
};

const sourceLinks = [
  {
    label: "Google: AI features and your website",
    href: "https://developers.google.com/search/docs/appearance/ai-features",
    note: "Normal SEO fundamentals apply; no special AI markup is required.",
  },
  {
    label: "Google: Generative AI search optimization guide",
    href: "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide",
    note: "Create original, useful content and keep a clear technical structure.",
  },
  {
    label: "Google: Helpful, reliable, people-first content",
    href: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
    note: "Clear authorship, expertise, trust, and first-hand value matter—especially for consequential topics.",
  },
  {
    label: "Google: JavaScript SEO basics",
    href: "https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics",
    note: "Prerendering or server rendering helps users and crawlers, including bots that do not execute JavaScript.",
  },
  {
    label: "Google: LocalBusiness structured data",
    href: "https://developers.google.com/search/docs/appearance/structured-data/local-business",
    note: "Use accurate, visible business facts and the most specific applicable business type.",
  },
  {
    label: "Google Business Profile: Local ranking guidance",
    href: "https://support.google.com/business/answer/7091",
    note: "Google describes local results in terms of relevance, distance, and prominence.",
  },
  {
    label: "Bing: AI Performance in Webmaster Tools",
    href: "https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview",
    note: "Measure citations and improve clarity, depth, evidence, freshness, and entity consistency.",
  },
  {
    label: "OpenAI: Search and training crawlers",
    href: "https://developers.openai.com/api/docs/bots",
    note: "OAI-SearchBot controls eligibility for ChatGPT search; GPTBot is a separate training control.",
  },
  {
    label: "Anthropic: Claude web crawlers",
    href: "https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler",
    note: "Claude-SearchBot, Claude-User, and ClaudeBot have different purposes.",
  },
  {
    label: "Perplexity: Crawler documentation",
    href: "https://docs.perplexity.ai/docs/resources/perplexity-crawlers",
    note: "PerplexityBot is the crawler used to surface and link websites in Perplexity search.",
  },
];

function GuidanceCallout({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-primary/20 bg-primary/5 p-6">
      <p className="font-medium leading-relaxed text-foreground">{children}</p>
    </div>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="ml-5 list-disc space-y-2 text-base leading-relaxed text-muted-foreground">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

export default function GeoGuide() {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 },
    );

    tocSections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <SeoMeta
        title="AI Search Optimization for Law Firms: 2026 GEO Guide"
        description="A verified GEO guide for small and mid-sized law firms covering technical SEO, local signals, trustworthy content, measurement, and a 90-day plan."
        path="/geo-for-professional-services"
        type="article"
      />
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <MarketingLayout>
        <main className="pb-20 pt-40">
          <div className="container mx-auto flex gap-12 px-6">
            <aside className="hidden w-56 shrink-0 lg:block">
              <nav className="sticky top-36 space-y-1" aria-label="Guide contents">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contents</p>
                {tocSections.map(({ id, label }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={`block py-1 text-sm transition-colors ${
                      activeId === id ? "font-medium text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </aside>

            <article className="max-w-3xl flex-1 space-y-14">
              <header className="space-y-5">
                <p className="text-sm font-medium uppercase tracking-widest text-primary">Practical guide for law firms</p>
                <h1 className="text-3xl font-bold leading-tight text-foreground md:text-5xl">
                  AI Search Optimization (GEO) for Small and Mid-Sized Law Firms
                </h1>
                <p className="text-lg leading-relaxed text-muted-foreground">
                  A source-backed guide to making your firm easier to discover, understand, verify, and accurately cite in ChatGPT, Google AI features, Claude, Perplexity, and Copilot—without chasing unsupported GEO hacks.
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>By <a href="/about" className="text-foreground underline underline-offset-4">Yanyan Li</a>, Founder of Clientory</span>
                  <span>Updated August 9, 2026</span>
                </div>
                <p className="rounded-lg border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
                  Scope: this guide explains marketing and technical visibility practices, not legal advice. Law firms should review content, testimonials, comparisons, and claims under the advertising and professional-conduct rules that apply in every jurisdiction where they practice.
                </p>
              </header>

              <section id="what-geo-means" className="scroll-mt-24 space-y-5">
                <h2 className="text-2xl font-semibold text-foreground">What GEO Means—and What It Cannot Promise</h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Generative engine optimization (GEO) is a useful name for the work of improving how a firm appears in AI-assisted discovery. For a law firm, that means helping a search system answer four questions: Does this firm exist? What matters does it handle? Where and for whom does it practice? What reliable evidence supports those facts?
                </p>
                <p className="text-base leading-relaxed text-muted-foreground">
                  GEO is not a separate replacement for SEO. Google states that the same SEO fundamentals apply to AI Overviews and AI Mode, with no special markup required. ChatGPT, Claude, Perplexity, and Bing have their own retrieval systems and controls, but they still need accessible, understandable, trustworthy source material.
                </p>
                <GuidanceCallout>
                  No ethical consultant can guarantee that an AI assistant will rank, cite, or recommend a firm. The practical goal is to improve eligibility, factual clarity, corroboration, and measurement.
                </GuidanceCallout>
              </section>

              <section id="how-ai-finds-firms" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">How AI Search Finds and Describes a Law Firm</h2>
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-foreground">1. It retrieves sources</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    Search-grounded assistants can retrieve pages from search indexes or their own crawlers. The source mix can change by product, prompt, location, and date. This is why being indexed, crawlable, internally linked, and returned as meaningful HTML is the first requirement—not an advanced optimization.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-foreground">2. It tries to resolve the firm as an entity</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    Your website, attorney biographies, business profiles, bar records, reputable directories, news coverage, and other third-party pages may all describe the same organization. Consistent names, locations, practice areas, attorney identities, and contact information reduce ambiguity. Consistency helps machines reconcile facts; it does not create authority by itself.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-foreground">3. It selects passages that answer the question</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    Clear headings, direct answers, useful tables, evidence, and focused pages make it easier for both people and retrieval systems to identify the relevant passage. Bing’s current guidance specifically recommends depth, clear structure, evidence, freshness, and consistency across formats.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-foreground">4. It generates an answer that can vary</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    AI answers are not fixed rankings. The same underlying question can produce different firms, citations, or wording across runs. A law firm therefore needs a repeatable panel of prompts and longitudinal measurements, not a single screenshot.
                  </p>
                </div>
              </section>

              <section id="technical-foundation" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">Technical Foundation: Make the Firm Eligible to Be Found</h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Ask a developer or SEO partner to verify these items before commissioning more articles.
                </p>
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-foreground">Ship important information in HTML</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    Google can render JavaScript, but its own documentation says server-side rendering or prerendering remains a good idea because it is faster for users and crawlers and not every bot executes JavaScript. Practice areas, office locations, attorney names, credentials, FAQs, and contact details should be present in the initial response instead of appearing only after a click or client-side request.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-foreground">Use ordinary technical SEO correctly</h3>
                  <CheckList items={[
                    "Return a successful HTTP status for real pages and a real 404 for missing pages.",
                    "Give every important page a unique, descriptive title, meta description, canonical URL, and one clear main heading.",
                    "Link important practice-area, location, attorney, and contact pages with crawlable HTML links.",
                    "Maintain an XML sitemap and verify the site in Google Search Console and Bing Webmaster Tools.",
                    "Keep mobile usability, speed, security, and accessibility in working order.",
                  ]} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-foreground">Allow the search crawlers you want</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    Search access and model training are separate choices. OpenAI identifies OAI-SearchBot for ChatGPT search and GPTBot for potential training. Anthropic distinguishes Claude-SearchBot, Claude-User, and ClaudeBot. Perplexity identifies PerplexityBot for search. Check both <code className="rounded bg-muted px-1 py-0.5 text-sm">robots.txt</code> and any CDN or firewall rules; allowing a user agent in robots.txt does not help if the server blocks its requests.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-foreground">Use structured data as a factual label, not a ranking trick</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    Mark up the organization or location with the most specific accurate type, such as <code className="rounded bg-muted px-1 py-0.5 text-sm">LegalService</code> where appropriate; use <code className="rounded bg-muted px-1 py-0.5 text-sm">Person</code> for attorney biographies and <code className="rounded bg-muted px-1 py-0.5 text-sm">Article</code> or <code className="rounded bg-muted px-1 py-0.5 text-sm">BlogPosting</code> for authored guidance. The markup must agree with visible content. Google says there is no special schema required for its AI features, and FAQ rich results are generally limited to authoritative government and health sites.
                  </p>
                </div>
              </section>

              <section id="law-firm-content" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">Build Content Around Real Legal-Client Decisions</h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Small and mid-sized firms rarely need more generic blog volume. They need a complete, credible core website and a smaller set of pages that answer the questions their best-fit clients actually ask.
                </p>
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-foreground">Complete the core firm pages</h3>
                  <CheckList items={[
                    "A homepage that states the firm’s practice focus, real service area, and intended client types in visible text.",
                    "One substantial page for each material practice area, written for the client’s problem rather than a keyword variation.",
                    "Location pages only where the firm has a truthful, useful reason to describe that office or service area.",
                    "Individual attorney biographies with current admissions, education, languages, relevant experience, publications, and contact routes.",
                    "A clear contact and intake page with accurate office, phone, hours, consultation, and accessibility information.",
                  ]} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-foreground">Publish answer-worthy guidance</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    Favor original explanations, decision frameworks, jurisdiction-specific caveats, process walkthroughs, comparison pages, and insights drawn from the firm’s real work. A family-law firm might compare mediation and litigation; an immigration firm might explain how consular processing differs from adjustment of status; an estate-planning firm might explain when a trust addresses a client’s actual goals. State the general answer early, then add conditions and exceptions.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-foreground">Make expertise and review visible</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    Legal information can affect major life and financial decisions. Identify the author or legal reviewer, link to a complete biography, show a genuine reviewed or updated date, cite primary legal authorities when relevant, and explain the jurisdictions and limits of the guidance. Do not change dates merely to look fresh; update the substance first.
                  </p>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-medium text-foreground">Avoid scaled, near-duplicate pages</h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    Do not generate dozens of city or question variants that repeat the same answer. Google’s current AI-search guidance warns against scaled pages created mainly to manipulate search visibility. Consolidate overlapping pages and make each remaining page genuinely useful to a prospective client.
                  </p>
                </div>
              </section>

              <section id="local-entity-signals" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">Strengthen Local and Entity Signals Without Overclaiming</h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  For local legal searches, keep the firm’s Google Business Profile and Bing Places listing complete and current. Google says local visibility is primarily based on relevance, distance, and prominence; no one can pay Google for better local ranking.
                </p>
                <CheckList items={[
                  "Use the real business name, primary category, address or valid service-area setup, phone, hours, and website URL.",
                  "Describe services and languages accurately and keep them aligned with the website.",
                  "Create a sustainable process for requesting honest reviews without incentives or prohibited language.",
                  "Respond professionally to reviews without exposing confidential client information.",
                  "Correct duplicate, outdated, or inconsistent firm and attorney listings on reputable sources used in your market.",
                  "Earn corroboration through real professional activity: bar and association profiles, speaking, publications, community work, news coverage, and authoritative citations.",
                ]} />
                <GuidanceCallout>
                  No major AI platform publishes a fixed directory checklist that guarantees legal recommendations. Use citations from your own audits to learn which sources matter for your firm’s prompts.
                </GuidanceCallout>
              </section>

              <section id="manual-audit" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">Run a Repeatable Law Firm AI Visibility Audit</h2>
                <ol className="ml-5 list-decimal space-y-5 text-base leading-relaxed text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Define the market.</strong> Record the firm’s practice areas, offices or truthful service areas, languages, client types, and high-value matter categories.
                  </li>
                  <li>
                    <strong className="text-foreground">Build a fixed prompt set.</strong> Include discovery, comparison, and informational questions. Use the wording heard in consultations and intake calls—not just SEO keywords.
                  </li>
                  <li>
                    <strong className="text-foreground">Test separate surfaces.</strong> Check ChatGPT search, Google AI Mode or AI Overviews when available, Claude web search, Perplexity, and Copilot separately. Record the exact product or mode because they are not interchangeable.
                  </li>
                  <li>
                    <strong className="text-foreground">Control the test.</strong> Use fresh conversations, keep prompts unchanged, note the date and stated location, and run more than one repetition for important prompts.
                  </li>
                  <li>
                    <strong className="text-foreground">Capture evidence.</strong> Save the answer, whether the firm was mentioned, its context, cited URLs, competitors, and every factual error. Do not reduce the audit to a single score.
                  </li>
                  <li>
                    <strong className="text-foreground">Trace each gap to a source problem.</strong> Inspect the pages cited for competitors and determine whether your gap is crawlability, missing facts, thin content, weak local relevance, stale profiles, or insufficient third-party corroboration.
                  </li>
                </ol>
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="text-lg font-semibold text-foreground">Example prompts for a small or mid-sized law firm</h3>
                  <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
                    <li>“Which immigration law firms in Chicago handle marriage-based adjustment of status and offer service in Spanish?”</li>
                    <li>“What should I look for when choosing an estate-planning attorney for a blended family in Madison?”</li>
                    <li>“Compare small family-law firms in Austin that handle collaborative divorce.”</li>
                    <li>“Who represents small employers with H-1B RFEs in the Dallas area?”</li>
                    <li>“Which sources explain whether I need a lawyer for probate in Wisconsin?”</li>
                  </ul>
                </div>
              </section>

              <section id="metrics" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">Measure What a Managing Partner Can Act On</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ["Mention rate", "The share of controlled test responses that mention the firm. Report the prompt count and platforms with the percentage."],
                    ["Citation rate", "The share of responses that cite the firm’s own domain, plus the third-party domains used to support or replace it."],
                    ["Competitive share", "The firm’s mentions compared with named competitors across the same prompt set—not across an undefined market."],
                    ["Accuracy", "The percentage of statements about the firm that are correct, with material errors tracked to correction."],
                    ["Coverage", "Which practice areas, client types, languages, and locations produce mentions and which remain absent."],
                    ["Stability", "How often the result repeats across runs and testing cycles. Volatile prompts should not drive major decisions alone."],
                  ].map(([title, description]) => (
                    <div key={title} className="rounded-xl border border-border bg-card p-5">
                      <h3 className="font-semibold text-foreground">{title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                    </div>
                  ))}
                </div>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Bing Webmaster Tools now reports citation activity for supported Microsoft AI experiences. Google includes traffic from its AI features within the normal Web performance report rather than a separate AI ranking report. For other surfaces, controlled prompt monitoring remains a directional measurement, not an impression count or a promise of leads.
                </p>
              </section>

              <section id="ninety-day-plan" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">A Practical 90-Day Plan for a Lean Law Firm</h2>
                <div className="space-y-5">
                  <div className="rounded-xl border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground">Days 1–30: Eligibility and accuracy</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Create the baseline prompt set. Fix indexing, raw HTML, metadata, canonicals, sitemaps, crawler and CDN rules, broken links, and incorrect business facts. Reconcile the website, Business Profiles, attorney biographies, and major directory listings.</p>
                  </div>
                  <div className="rounded-xl border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground">Days 31–60: Core content and proof</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Improve the homepage and highest-value practice pages. Add clear authorship or review, primary-source citations, meaningful attorney credentials, client-centered comparisons, and honest local context. Consolidate thin or duplicative pages.</p>
                  </div>
                  <div className="rounded-xl border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground">Days 61–90: Corroboration and measurement</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Correct reputable third-party profiles, establish a compliant review process, pursue real publications or community authority, submit material updates through webmaster tools, rerun the unchanged prompt panel, and compare evidence against the baseline.</p>
                  </div>
                </div>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Keep the cadence sustainable. A five-attorney firm that fixes its core facts and publishes one genuinely useful, attorney-reviewed page will build a stronger foundation than a firm producing weekly generic AI-written posts.
                </p>
              </section>

              <section id="professional-services" className="scroll-mt-24 space-y-5">
                <h2 className="text-2xl font-semibold text-foreground">What Carries Over to Other Professional Services</h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  The same framework applies to accounting, consulting, architecture, and other expertise-led firms: technical access, unambiguous service and location facts, named experts, people-first content, accurate business profiles, reputable corroboration, and repeatable measurement.
                </p>
                <p className="text-base leading-relaxed text-muted-foreground">
                  The difference is the evidence. Accountants should foreground applicable credentials and regulatory context; consultants should publish concrete original analysis and case evidence they are permitted to share; architects and engineers should connect named professionals to projects and licenses. The tactic should follow the buyer’s decision and the profession’s rules, not a generic GEO checklist.
                </p>
              </section>

              <section id="faq" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">Frequently Asked Questions from Law Firms</h2>
                {faqItems.map((item) => (
                  <div key={item.q} className="space-y-2 border-b border-border pb-6 last:border-0">
                    <h3 className="text-lg font-medium text-foreground">{item.q}</h3>
                    <p className="text-base leading-relaxed text-muted-foreground">{item.a}</p>
                  </div>
                ))}
              </section>

              <section id="sources" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">Primary Guidance Used for This Guide</h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  These are first-party search and crawler sources, reviewed August 9, 2026. Platform behavior can change, so recheck the linked documentation before making a major technical decision.
                </p>
                <ul className="space-y-4">
                  {sourceLinks.map((source) => (
                    <li key={source.href}>
                      <a href={source.href} className="font-medium text-primary underline underline-offset-4">
                        {source.label}
                      </a>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{source.note}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl border border-primary/20 bg-primary/5 p-7 md:p-9">
                <h2 className="text-2xl font-semibold text-foreground">Measure Your Firm Before You Guess</h2>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  Clientory builds a prompt set from an immigration firm’s real practice profile, checks supported AI assistants, records mention quality and competitor gaps, and gives the firm a repeatable baseline. The first report is free; ongoing weekly monitoring is available for firms that want to track change.
                </p>
                <TrackedAppLink
                  placement="geo_guide_bottom"
                  offer="free_report"
                  className="mt-5 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Run a free visibility report
                </TrackedAppLink>
              </section>
            </article>
          </div>
        </main>
      </MarketingLayout>
    </>
  );
}

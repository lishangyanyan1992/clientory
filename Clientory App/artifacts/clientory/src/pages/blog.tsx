import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MarketingLayout } from "@/components/marketing-layout";
import { blogPosts, getReadingTime } from "@/data/blogPosts";

const POSTS_PER_PAGE = 6;

// The controlled vocabulary, grouped for the filter row. Deriving order from
// the posts would sort by whichever post happens to be newest. Every post
// carries exactly one topic plus one format-or-second-topic, then any AI tools
// it substantively covers. A tag that isn't listed here is a typo, not a new
// category — it still renders (see UNGROUPED below) so it's visible and fixable
// rather than silently dropped.
const TAG_GROUPS: { label: string; tags: string[] }[] = [
  {
    label: "Topic",
    tags: [
      "AI Visibility",
      "AI Search Engines",
      "Content & SEO",
      "Local & Directories",
      "Law Firm Marketing",
    ],
  },
  { label: "Format", tags: ["Guides", "Worksheets"] },
  {
    label: "Tool",
    tags: ["ChatGPT", "Claude", "Gemini", "Google AI Mode", "Perplexity", "Copilot", "Bing"],
  },
];

const TAG_COUNTS = blogPosts.reduce<Record<string, number>>((acc, post) => {
  for (const tag of post.tags) acc[tag] = (acc[tag] ?? 0) + 1;
  return acc;
}, {});

const KNOWN = new Set(TAG_GROUPS.flatMap((g) => g.tags));
const UNGROUPED = Object.keys(TAG_COUNTS)
  .filter((t) => !KNOWN.has(t))
  .sort();

// Only show groups that actually have posts behind them.
const VISIBLE_GROUPS = [
  ...TAG_GROUPS.map((g) => ({ ...g, tags: g.tags.filter((t) => TAG_COUNTS[t]) })),
  ...(UNGROUPED.length ? [{ label: "Other", tags: UNGROUPED }] : []),
].filter((g) => g.tags.length > 0);

const GROUP_OF: Record<string, string> = Object.fromEntries(
  VISIBLE_GROUPS.flatMap((g) => g.tags.map((t) => [t, g.label])),
);

/**
 * Faceted matching: OR within a group, AND across groups.
 *
 * Picking ChatGPT and Claude means "either model", because a post can only
 * really be about so many at once — requiring both would return almost nothing.
 * Picking Worksheets and Claude means "worksheets, about Claude", because those
 * answer different questions and narrowing is the point. `skipGroup` lets the
 * facet counts below ask "how many would this tag add?" without a group
 * filtering itself.
 */
function matchesSelection(
  postTags: string[],
  selected: Set<string>,
  skipGroup?: string,
): boolean {
  const byGroup = new Map<string, string[]>();
  for (const tag of selected) {
    const group = GROUP_OF[tag] ?? "Other";
    if (group === skipGroup) continue;
    byGroup.set(group, [...(byGroup.get(group) ?? []), tag]);
  }
  for (const tags of byGroup.values()) {
    if (!tags.some((t) => postTags.includes(t))) return false;
  }
  return true;
}

const Blog = () => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  const toggleTag = (tag: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
    setVisibleCount(POSTS_PER_PAGE);
  };

  const clearTags = () => {
    setSelected(new Set());
    setVisibleCount(POSTS_PER_PAGE);
  };

  const filtered = selected.size
    ? blogPosts.filter((p) => matchesSelection(p.tags, selected))
    : blogPosts;

  // How many posts each tag would yield alongside the current selection, so a
  // button never advertises a count it can't deliver. A tag is skipped against
  // its own group because adding it there only ever widens the result.
  const facetCounts: Record<string, number> = {};
  for (const group of VISIBLE_GROUPS) {
    for (const tag of group.tags) {
      facetCounts[tag] = blogPosts.filter(
        (p) => p.tags.includes(tag) && matchesSelection(p.tags, selected, group.label),
      ).length;
    }
  }

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const visible = sorted.slice(0, visibleCount);

  return (
    <MarketingLayout>
      <main className="pt-40 pb-20">
        <div className="container mx-auto px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">
              Blog
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
              Insights on <span className="text-gradient">AI Visibility</span>
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Weekly articles on AI search, LLM SEO, and getting your firm discovered by AI assistants.
            </p>
          </motion.div>

          {/* Tags: multi-select, grouped, each showing how many posts it yields */}
          <div className="mb-4 space-y-3">
            <div className="flex justify-center">
              <button
                onClick={clearTags}
                aria-pressed={selected.size === 0}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  selected.size === 0
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                All <span className="tabular-nums opacity-60">{blogPosts.length}</span>
              </button>
            </div>

            {VISIBLE_GROUPS.map((group) => (
              <div
                key={group.label}
                className="flex flex-wrap items-center justify-center gap-2"
              >
                <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60">
                  {group.label}
                </span>
                {group.tags.map((tag) => {
                  const isOn = selected.has(tag);
                  const count = facetCounts[tag] ?? 0;
                  // A tag that would return nothing stays clickable only if it's
                  // already on, so a selection is never impossible to undo.
                  const isDead = count === 0 && !isOn;
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      disabled={isDead}
                      aria-pressed={isOn}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        isOn
                          ? "bg-primary text-primary-foreground border-primary"
                          : isDead
                            ? "border-border/50 text-muted-foreground/40 cursor-not-allowed"
                            : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tag} <span className="tabular-nums opacity-60">{count}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Result count + a way back out, shown only once filtering is on */}
          <div className="mb-12 flex min-h-[1.75rem] items-center justify-center gap-3 text-sm text-muted-foreground">
            {selected.size > 0 && (
              <>
                <span>
                  {sorted.length} {sorted.length === 1 ? "article" : "articles"}
                  {selected.size > 1 ? ` matching ${selected.size} filters` : ""}
                </span>
                <button
                  onClick={clearTags}
                  className="underline underline-offset-4 transition-colors hover:text-foreground"
                >
                  Clear
                </button>
              </>
            )}
          </div>

          {/* Post Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {visible.map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group rounded-2xl border border-border bg-card p-6 flex flex-col card-hover"
              >
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed flex-1 mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(post.date + "T00:00:00").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {getReadingTime(post.content)} min read
                  </span>
                </div>
                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.article>
            ))}
          </div>

          {visibleCount < sorted.length && (
            <div className="text-center mt-10">
              <button
                onClick={() => setVisibleCount((c) => c + POSTS_PER_PAGE)}
                className="px-6 py-2 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </main>
    </MarketingLayout>
  );
};

export default Blog;

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MarketingLayout } from "@/components/marketing-layout";
import { blogPosts, getReadingTime } from "@/data/blogPosts";

const POSTS_PER_PAGE = 6;
const ALL_TAGS = Array.from(new Set(blogPosts.flatMap((p) => p.tags)));

const Blog = () => {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  const filtered = activeTag
    ? blogPosts.filter((p) => p.tags.includes(activeTag))
    : blogPosts;

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

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <button
              onClick={() => { setActiveTag(null); setVisibleCount(POSTS_PER_PAGE); }}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                !activeTag
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {ALL_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => { setActiveTag(tag); setVisibleCount(POSTS_PER_PAGE); }}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  activeTag === tag
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {tag}
              </button>
            ))}
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

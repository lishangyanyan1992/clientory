import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Twitter, Linkedin, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/marketing-layout";
import { blogPosts, getReadingTime } from "@/data/blogPosts";

function renderMarkdown(content: string) {
  // Simple markdown-to-JSX renderer for the markdown patterns we publish.
  return content.split("\n\n").map((block, i) => {
    const trimmed = block.trim();
    const lines = trimmed.split("\n");

    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={i} className="text-xl md:text-2xl font-bold text-foreground mt-10 mb-4">
          {trimmed.replace("## ", "")}
        </h2>
      );
    }

    if (trimmed.startsWith("### ")) {
      return (
        <h3 key={i} className="text-lg font-semibold text-foreground mt-8 mb-3">
          {trimmed.replace("### ", "")}
        </h3>
      );
    }

    // Table block
    if (
      lines.length >= 2 &&
      lines[0].includes("|") &&
      /^\|?[\s:-]+(?:\|[\s:-]+)+\|?$/.test(lines[1].trim())
    ) {
      const parseRow = (row: string) => {
        const cells = row.split("|").map((cell) => cell.trim());
        if (cells[0] === "") cells.shift();
        if (cells[cells.length - 1] === "") cells.pop();
        return cells;
      };

      const headers = parseRow(lines[0]);
      const rows = lines.slice(2).map(parseRow).filter((row) => row.length > 0);

      return (
        <div key={i} className="my-6 overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {headers.map((header, j) => (
                  <th
                    key={j}
                    className="border-b border-border px-4 py-3 text-left font-semibold text-foreground align-top"
                    dangerouslySetInnerHTML={{ __html: formatInline(header) }}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, j) => (
                <tr key={j} className="border-b border-border last:border-b-0">
                  {row.map((cell, k) => (
                    <td
                      key={k}
                      className="px-4 py-3 text-muted-foreground align-top"
                      dangerouslySetInnerHTML={{ __html: cell ? formatInline(cell) : "" }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Blockquote
    if (lines.every((l) => l.startsWith("> "))) {
      const inner = lines.map((l) => l.replace(/^> /, "")).join("\n\n");
      return (
        <blockquote key={i} className="border-l-4 border-primary/30 pl-5 py-3 my-6 bg-muted/50 rounded-r-lg">
          {inner.split("\n\n").map((line, j) => (
            <p key={j} className="text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInline(line.trim()) }} />
          ))}
        </blockquote>
      );
    }

    // Task list block
    if (lines.every((l) => /^- \[(?: |x|X)\] /.test(l))) {
      return (
        <ul key={i} className="space-y-3 text-muted-foreground mb-4">
          {lines.map((line, j) => {
            const checked = /^- \[(?:x|X)\] /.test(line);
            const text = line.replace(/^- \[(?: |x|X)\] /, "");

            return (
              <li key={j} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="mt-1 h-4 w-4 rounded border-border accent-primary"
                />
                <span dangerouslySetInnerHTML={{ __html: formatInline(text) }} />
              </li>
            );
          })}
        </ul>
      );
    }

    // List block
    if (lines.every((l) => l.startsWith("- "))) {
      return (
        <ul key={i} className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
          {lines.map((line, j) => (
            <li key={j} dangerouslySetInnerHTML={{ __html: formatInline(line.replace("- ", "")) }} />
          ))}
        </ul>
      );
    }

    // Numbered list
    if (lines.every((l) => /^\d+\.\s/.test(l))) {
      return (
        <ol key={i} className="list-decimal pl-6 space-y-2 text-muted-foreground mb-4">
          {lines.map((line, j) => (
            <li key={j} dangerouslySetInnerHTML={{ __html: formatInline(line.replace(/^\d+\.\s/, "")) }} />
          ))}
        </ol>
      );
    }

    return (
      <p key={i} className="text-muted-foreground leading-relaxed mb-4" dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
    );
  });
}

/** Escape HTML entities before injecting any string as raw HTML. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Convert lightweight markdown tokens to HTML.
 * The input is HTML-escaped first so no user-supplied content can be
 * injected as raw HTML — only the structural tags we produce ourselves
 * (<a>, <strong>, <em>) ever reach the DOM.
 */
function formatInline(text: string) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      (_, label, url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80 transition-colors">${label}</a>`,
    )
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
    .replace(
      /(?<!="|">)(https?:\/\/[^\s<)]+)/g,
      (_, url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80 transition-colors break-all">${url}</a>`,
    );
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) return <Navigate to="/blog" replace />;

  const related = blogPosts
    .filter((p) => p.slug !== post.slug && p.tags.some((t) => post.tags.includes(t)))
    .slice(0, 2);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <MarketingLayout>
      <main className="pt-40 pb-20">
        <article className="container mx-auto max-w-3xl px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>

            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-10">
              {post.author && <span>{post.author}</span>}
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {getReadingTime(post.content)} min read
              </span>
            </div>

            <div className="prose-custom">{renderMarkdown(post.content)}</div>

            {/* Share */}
            <div className="border-t border-border mt-12 pt-8 flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted-foreground mr-2">Share:</span>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(shareUrl)}
                className="p-2 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
              >
                <Link2 className="w-4 h-4" />
              </button>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div className="mt-14">
                <h3 className="text-lg font-semibold text-foreground mb-6">Related Articles</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      to={`/blog/${r.slug}`}
                      className="rounded-xl border border-border bg-card p-5 card-hover block"
                    >
                      <h4 className="font-medium text-foreground mb-1 text-sm leading-snug">{r.title}</h4>
                      <p className="text-xs text-muted-foreground">{getReadingTime(r.content)} min read</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 text-center">
              <Link to="/blog">
                <Button variant="outline" className="rounded-full">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
                </Button>
              </Link>
            </div>
          </motion.div>
        </article>
      </main>
    </MarketingLayout>
  );
};

export default BlogPost;

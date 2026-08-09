# Blog agent — tagging rules

Paste this into the blog-writing agent (or add it to the skill's instructions).
It exists because a previous run produced 34 tags across 38 posts, including
malformed ones like `"A I Visibility"` and two posts tagged literally `"1"` and
`"2"`.

---

## Tagging rules for Clientory blog posts

Tags are a **controlled vocabulary**. Before you write any `tags` value, open
`Clientory App/artifacts/clientory/src/pages/blog.tsx` and read the `TAG_GROUPS`
constant. That is the complete list of allowed tags. Also scan the existing
`tags` arrays in `Clientory App/artifacts/clientory/src/data/blogPosts.ts` to see
how similar posts were tagged.

### The vocabulary

**Topic** — pick exactly one, the post's main subject:
- `AI Visibility` — being found, cited, or recommended by AI; measuring it
- `AI Search Engines` — a specific AI surface's behavior (AI Mode, AI Overviews,
  ChatGPT, Claude, Gemini) and how it picks sources
- `Content & SEO` — page structure, technical SEO, freshness, core updates,
  writing for citation
- `Local & Directories` — local search, Google Business Profile, Bing Places,
  Avvo/Justia and other legal directories
- `Law Firm Marketing` — firm growth, attorney marketing, advertising
  compliance and risk

**Format** — add one only if it genuinely applies:
- `Guides` — an explainer or how-it-works piece
- `Worksheets` — a hands-on worksheet or audit the reader completes

**Tool** — add the AI tools the post *substantively* covers:
- `ChatGPT`, `Claude`, `Gemini`, `Google AI Mode`, `Perplexity`, `Copilot`, `Bing`

### The rules

1. **Exactly one Topic**, always. It comes first in the array.
2. **Then one Format** if the post is a guide or worksheet. If it is neither,
   use a **second Topic** instead. Every post has two of these before any tools.
3. **Then Tool tags**, at most three. Only tag a tool the post actually discusses
   — roughly three or more mentions, or a section about it. Do **not** tag a tool
   that appears once in a passing list like "ChatGPT, Claude, Gemini, and
   Perplexity". If the post discusses no specific tool, add no tool tags. That is
   normal; about a third of posts have none.
4. **Write tags exactly as spelled above.** Copy them character for character.
   Never re-case, title-case, or split them. `ChatGPT` is not `Chat GPT`,
   `Google AI Mode` is not `Google A I Mode`, and `AI Visibility` is never
   `A I Visibility`. **Never insert a space inside an acronym** — AI, SEO, GEO,
   and AEO stay closed up. If a formatting or title-casing step is applied to
   your output, exempt the tags from it.
5. **Never emit a tag that is a number, an index, or an empty string.** If you
   are building the array in a loop, make sure the loop counter never leaks into
   the value.

### Inventing a new tag

Default to **no**. Reuse an existing tag almost every time — a tag that applies
to one post is not a category, it is noise, and it makes the blog filter longer
than the list of posts it filters.

Only propose a new tag if **all** of these hold:

- No existing tag reasonably fits, not even loosely.
- You can name **at least three existing published posts** that would also carry
  it, by slug.
- It is a durable subject area, not a one-off news item, product name, or study.
  `Preferred Sources`, `Ghost Citations`, and `AEO` were all rejected on this
  basis — they belong under `AI Search Engines` or `AI Visibility`.

If all three hold, **do not add it silently.** Stop and ask the human, naming the
proposed tag and listing the three-plus posts that justify it. Adding it means
editing `TAG_GROUPS` in `blog.tsx` too, so the filter row knows about it — a tag
that only exists in `blogPosts.ts` shows up under "Other", which is the signal
that something went wrong.

### Before you finish

Re-read the `tags` array you wrote and confirm:

- [ ] Exactly one Topic tag, and it is first
- [ ] Exactly two Topic/Format tags total before any Tool tags
- [ ] Every tag is spelled exactly as listed above
- [ ] No spaces inside acronyms
- [ ] No numeric, empty, or invented tags
- [ ] At most three Tool tags, each genuinely discussed in the post

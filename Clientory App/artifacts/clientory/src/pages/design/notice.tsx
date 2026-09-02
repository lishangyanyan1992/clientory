import { CLIENTORY_APP_URL } from "@/lib/app-url";
import { BY_PROVIDER, NAMED_COUNT, QUERIES, TOTAL_ANSWERS } from "./_data";
import { CompBar } from "./_comp-bar";

/**
 * Direction C — "Notice".
 *
 * Anchors: a case notice, a docket sheet — the paper an immigration attorney
 * handles every working day. Color strategy: Committed, on a cool blue-grey
 * stock tinted toward the brand hue (deliberately not the cream/parchment
 * default), with indigo used as the stamp.
 *
 * The monospace here is literal rather than decorative: the source documents
 * are typewritten, and it is confined to field labels and reference numbers.
 *
 * This is a stylistic homage, not an imitation: no seal, no agency name, no
 * form number that belongs to anyone else. It reads as Clientory's own report.
 */

const css = `
.lane-c {
  --stock: oklch(0.928 0.012 264);
  --sheet: oklch(0.975 0.006 264);
  --ink: oklch(0.20 0.022 264);
  --ink-2: oklch(0.42 0.02 264);
  --rule: oklch(0.78 0.016 264);
  --rule-2: oklch(0.86 0.012 264);
  --stamp: oklch(0.47 0.185 273);

  background: var(--stock);
  color: var(--ink);
  font-family: "Libre Franklin", system-ui, sans-serif;
  min-height: 100vh;
}
@media (prefers-color-scheme: dark) {
  .lane-c {
    --stock: oklch(0.19 0.018 264);
    --sheet: oklch(0.24 0.02 264);
    --ink: oklch(0.95 0.005 264);
    --ink-2: oklch(0.73 0.016 264);
    --rule: oklch(0.40 0.022 264);
    --rule-2: oklch(0.32 0.02 264);
    --stamp: oklch(0.74 0.155 273);
  }
}

.lane-c .mono {
  font-family: "Courier Prime", ui-monospace, monospace;
  text-transform: uppercase; letter-spacing: 0.06em; font-size: 0.75rem;
  color: var(--ink-2);
}
.lane-c .wrap { max-width: 58rem; margin-inline: auto; padding-inline: clamp(1rem, 4vw, 2rem); }

.lane-c .topbar {
  position: sticky; top: 0; z-index: 20;
  background: color-mix(in oklab, var(--stock) 90%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--rule);
}
.lane-c .topbar-in {
  display: flex; align-items: center; justify-content: space-between;
  height: 3.5rem; gap: 1rem;
}
.lane-c .mark { font-weight: 700; letter-spacing: 0.02em; font-size: 1rem; }
.lane-c .topbar-cta {
  font-size: 0.8125rem; font-weight: 600; text-decoration: none;
  background: var(--stamp); color: oklch(0.99 0 0);
  padding: 0.4375rem 0.9375rem; white-space: nowrap;
  transition: filter 220ms ease-out;
}
.lane-c .topbar-cta:hover { filter: brightness(1.12); }
.lane-c .topbar-cta:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }

/* ---- the sheet ---- */
.lane-c .sheet {
  background: var(--sheet);
  border: 1px solid var(--rule);
  margin-block: clamp(1.5rem, 5vw, 3.5rem);
  box-shadow: 0 1px 0 var(--rule-2), 0 18px 40px -32px oklch(0.2 0.05 264 / 0.5);
}
.lane-c .sheet-head {
  display: flex; flex-wrap: wrap; gap: 1rem; justify-content: space-between;
  align-items: flex-start;
  padding: clamp(1.25rem, 3.5vw, 2rem);
  border-bottom: 2px solid var(--ink);
}
.lane-c .sheet-title {
  font-size: clamp(1.5rem, 3.6vw, 2.125rem); font-weight: 700;
  letter-spacing: -0.02em; line-height: 1.08; margin: 0.5rem 0 0; text-wrap: balance;
}
.lane-c .sheet-head > div:first-child { flex: 1 1 22rem; min-width: 0; }
.lane-c .ref { text-align: left; flex: 0 0 auto; }
@media (min-width: 40rem) { .lane-c .ref { text-align: right; } }
.lane-c .ref b { display: block; font-family: "Courier Prime", monospace; font-size: 0.9375rem; letter-spacing: 0.04em; color: var(--ink); }

/* ---- fields ---- */
.lane-c .fields { display: grid; grid-template-columns: 1fr; }
@media (min-width: 40rem) { .lane-c .fields { grid-template-columns: 1fr 1fr; } }
.lane-c .field {
  padding: 0.9375rem clamp(1.25rem, 3.5vw, 2rem);
  border-bottom: 1px solid var(--rule-2);
}
@media (min-width: 40rem) {
  .lane-c .field:nth-child(odd) { border-right: 1px solid var(--rule-2); }
}
.lane-c .field-v { margin: 0.3125rem 0 0; font-size: 1rem; font-weight: 500; }

/* ---- finding ---- */
.lane-c .finding { padding: clamp(1.5rem, 4vw, 2.5rem) clamp(1.25rem, 3.5vw, 2rem); }
.lane-c .finding p.finding-stat {
  font-size: clamp(2.25rem, 6.5vw, 3.75rem); font-weight: 700;
  letter-spacing: -0.035em; line-height: 1; margin: 0.75rem 0 0;
  font-variant-numeric: tabular-nums;
}
.lane-c .finding p.finding-stat em { font-style: normal; color: var(--stamp); }
.lane-c .finding p {
  margin: 1.125rem 0 0; max-width: 62ch; line-height: 1.65; color: var(--ink-2);
  font-size: 1rem; text-wrap: pretty;
}

/* ---- per-assistant strip ---- */
.lane-c .strip {
  display: grid; grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid var(--rule-2);
}
.lane-c .strip-cell {
  padding: 1rem clamp(1.25rem, 3.5vw, 2rem);
  border-right: 1px solid var(--rule-2);
}
.lane-c .strip-cell:last-child { border-right: 0; }
.lane-c .strip-n {
  font-size: 1.5rem; font-weight: 700; font-variant-numeric: tabular-nums;
  margin: 0.25rem 0 0; letter-spacing: -0.02em;
}
.lane-c .meter { margin-top: 0.5rem; height: 4px; background: var(--rule-2); }
.lane-c .meter i { display: block; height: 100%; background: var(--stamp); }

/* ---- tear-off ---- */
.lane-c .tear {
  border-top: 2px dashed var(--rule);
  padding: clamp(1.5rem, 4vw, 2.25rem) clamp(1.25rem, 3.5vw, 2rem);
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
  gap: 1.25rem;
}
.lane-c .tear-t { font-size: clamp(1.125rem, 2.4vw, 1.375rem); font-weight: 600; margin: 0; letter-spacing: -0.015em; max-width: 34ch; }
.lane-c .btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: var(--stamp); color: oklch(0.99 0 0);
  font-size: 0.9375rem; font-weight: 600; text-decoration: none;
  padding: 0.8125rem 1.5rem; white-space: nowrap;
  transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1), filter 240ms;
}
.lane-c .btn:hover { transform: translateY(-1px); filter: brightness(1.1); }
.lane-c .btn:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }

/* ---- body sections ---- */
.lane-c .section { padding-block: clamp(2.5rem, 6vw, 4rem); }
.lane-c h2 {
  font-size: clamp(1.375rem, 3vw, 1.875rem); font-weight: 700; letter-spacing: -0.02em;
  margin: 0 0 1.25rem; max-width: 26ch; text-wrap: balance;
}
.lane-c .section p { margin: 0 0 1rem; max-width: 68ch; line-height: 1.7; color: var(--ink-2); text-wrap: pretty; }
.lane-c ol.actions { list-style: none; margin: 1.75rem 0 0; padding: 0; counter-reset: step; }
.lane-c ol.actions li {
  counter-increment: step;
  display: grid; grid-template-columns: 2.5rem minmax(0, 1fr); gap: 0 0.75rem;
  padding-block: 1.125rem; border-top: 1px solid var(--rule-2);
}
.lane-c ol.actions li:last-child { border-bottom: 1px solid var(--rule-2); }
.lane-c ol.actions li::before {
  content: counter(step, decimal-leading-zero);
  font-family: "Courier Prime", monospace; font-size: 0.875rem; color: var(--stamp);
  padding-top: 0.125rem;
}
.lane-c ol.actions b { font-size: 1.0625rem; font-weight: 600; letter-spacing: -0.01em; }
.lane-c ol.actions span { grid-column: 2; display: block; margin-top: 0.3125rem; font-size: 0.9375rem; line-height: 1.6; color: var(--ink-2); max-width: 62ch; }

.lane-c .foot {
  border-top: 1px solid var(--rule); padding-block: 1.5rem 3rem;
  font-size: 0.75rem; color: var(--ink-2); line-height: 1.6; max-width: 70ch;
}

@media (prefers-reduced-motion: reduce) {
  .lane-c * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
`;

const FIELDS = [
  { label: "Firm", value: "Your firm name" },
  { label: "Market", value: "Houston, Texas" },
  { label: "Practice areas", value: "Family · Employment · Removal defense" },
  { label: "Assistants queried", value: "ChatGPT · Claude · Gemini" },
  { label: "Prospect queries run", value: `${QUERIES.length}` },
  { label: "Answers examined", value: `${TOTAL_ANSWERS}` },
];

const ACTIONS = [
  {
    t: "Read the answers, not just the score",
    d: "Every scan returns the assistant's full text. The firms named in your place tell you what the model thinks a good answer looks like.",
  },
  {
    t: "Fix the queries you lose worst",
    d: "Visibility is uneven by practice area. Most firms are invisible on their highest-value work and fine on the low-value questions nobody converts on.",
  },
  {
    t: "Re-run and watch the number move",
    d: "Assistants change their answers as their sources change. A single reading is a snapshot; the trend is the useful signal.",
  },
];

export default function Notice() {
  return (
    <>
      <title>Direction C · Notice — Clientory</title>
      <meta name="robots" content="noindex" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Libre+Franklin:wght@400;500;600;700&display=swap"
      />
      <style>{css}</style>

      <div className="lane-c">
        <CompBar current="notice" />

        <header className="topbar">
          <div className="wrap topbar-in">
            <div className="mark">CLIENTORY</div>
            <a className="topbar-cta" href={CLIENTORY_APP_URL}>
              Request a scan
            </a>
          </div>
        </header>

        <div className="wrap">
          <article className="sheet">
            <div className="sheet-head">
              <div>
                <div className="mono">Notice of AI visibility</div>
                <h1 className="sheet-title">
                  Where you stand when a client asks an assistant for a lawyer
                </h1>
              </div>
              <div className="ref">
                <div className="mono">Sample</div>
                <b>CL-0001</b>
              </div>
            </div>

            <div className="fields">
              {FIELDS.map((f) => (
                <div className="field" key={f.label}>
                  <div className="mono">{f.label}</div>
                  <p className="field-v">{f.value}</p>
                </div>
              ))}
            </div>

            <div className="finding">
              <div className="mono">Finding</div>
              <p className="finding-stat">
                Named in <em>{NAMED_COUNT}</em> of {TOTAL_ANSWERS} answers
              </p>
              <p>
                Across the questions prospective clients ask in this market, three quarters of
                assistant answers recommended someone else. This report lists every query, the full
                text of each answer, and the firms named in your place.
              </p>
            </div>

            <div className="strip">
              {BY_PROVIDER.map((row) => (
                <div className="strip-cell" key={row.provider}>
                  <div className="mono">{row.provider}</div>
                  <p className="strip-n">
                    {row.hits}/{row.total}
                  </p>
                  <div className="meter">
                    <i style={{ width: `${(row.hits / row.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="tear">
              <p className="tear-t">Run one free report for your own firm. No credit card.</p>
              <a className="btn" href={CLIENTORY_APP_URL}>
                Request a scan
              </a>
            </div>
          </article>
        </div>

        <section className="section wrap">
          <h2>Why a Google ranking no longer answers this question</h2>
          <p>
            Search gave you a position and a path upward. An assistant gives your prospective client
            a short list and a paragraph of reasoning, then the conversation moves on to filing
            fees and timelines. There is no second page to climb to, and no analytics view that
            records the client who never called.
          </p>
          <p>
            The firms named in those answers are not necessarily the best ones. They are the ones
            the model has enough clear, specific, well-sourced information about. That is a fixable
            problem, but only if you can see it.
          </p>

          <h2 style={{ marginTop: "2.5rem" }}>What to do with the report</h2>
          <ol className="actions">
            {ACTIONS.map((a) => (
              <li key={a.t}>
                <b>{a.t}</b>
                <span>{a.d}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="wrap">
          <p className="foot">
            Sample report. The firm, market, and results shown above are illustrative and do not
            describe a real practice. Clientory reports what AI assistants say about a firm; it is
            not affiliated with any government agency and this document is not a legal notice.
          </p>
        </div>
      </div>
    </>
  );
}

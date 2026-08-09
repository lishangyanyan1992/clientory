import { CLIENTORY_APP_URL } from "@/lib/app-url";
import {
  BY_PROVIDER,
  NAMED_COUNT,
  PROVIDERS,
  QUERIES,
  TOTAL_ANSWERS,
  VISIBILITY_PCT,
} from "./_data";
import { CompBar } from "./_comp-bar";

/**
 * Direction A — "Instrument".
 *
 * Anchors: the State Department Visa Bulletin, a terminal's data density.
 * Color strategy: Restrained. Off-white tinted toward the brand hue, near-black
 * ink, indigo reserved for one job only (the "named" state). The scan matrix is
 * the hero object, not a mock dashboard floating on a gradient.
 */

const css = `
.lane-a {
  --paper: oklch(0.985 0.003 268);
  --paper-2: oklch(0.958 0.005 268);
  --ink: oklch(0.19 0.024 268);
  --ink-2: oklch(0.44 0.018 268);
  --rule: oklch(0.87 0.008 268);
  --rule-strong: oklch(0.74 0.012 268);
  --indigo: oklch(0.52 0.192 273);

  background: var(--paper);
  color: var(--ink);
  font-family: Archivo, system-ui, sans-serif;
  font-synthesis-weight: none;
  min-height: 100vh;
}
@media (prefers-color-scheme: dark) {
  .lane-a {
    --paper: oklch(0.17 0.016 268);
    --paper-2: oklch(0.22 0.018 268);
    --ink: oklch(0.96 0.004 268);
    --ink-2: oklch(0.72 0.014 268);
    --rule: oklch(0.31 0.016 268);
    --rule-strong: oklch(0.44 0.02 268);
    --indigo: oklch(0.72 0.16 273);
  }
}

.lane-a .wrap { max-width: 76rem; margin-inline: auto; padding-inline: clamp(1.25rem, 4vw, 3rem); }

/* ---- persistent scan entry ---- */
.lane-a .topbar {
  position: sticky; top: 0; z-index: 20;
  background: color-mix(in oklab, var(--paper) 88%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--rule);
}
.lane-a .topbar-in {
  display: flex; align-items: center; justify-content: space-between;
  gap: 1rem; height: 3.75rem;
}
.lane-a .mark {
  font-weight: 700; font-size: 1.0625rem; letter-spacing: -0.02em;
}
.lane-a .mark span { color: var(--indigo); }
.lane-a .topbar-cta {
  font-size: 0.875rem; font-weight: 600; color: var(--paper);
  background: var(--ink); padding: 0.5rem 1rem; border-radius: 2px;
  text-decoration: none; white-space: nowrap;
  transition: background 240ms cubic-bezier(0.22, 1, 0.36, 1);
}
.lane-a .topbar-cta:hover { background: var(--indigo); }
.lane-a .topbar-cta:focus-visible { outline: 2px solid var(--indigo); outline-offset: 2px; }

/* ---- hero ---- */
.lane-a .hero { padding-block: clamp(3.5rem, 9vw, 7rem) clamp(2rem, 5vw, 3.5rem); }
.lane-a .hero-grid {
  display: grid; gap: clamp(1.75rem, 4vw, 3.5rem);
  grid-template-columns: 1fr;
  align-items: end;
}
@media (min-width: 62rem) {
  .lane-a .hero-grid { grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr); }
}
.lane-a h1 {
  font-size: clamp(2.25rem, 4.5vw, 3.5rem);
  line-height: 1.02;
  letter-spacing: -0.032em;
  font-weight: 700;
  text-wrap: balance;
  margin: 0;
}
.lane-a h1 em { font-style: normal; color: var(--indigo); }
.lane-a .lede {
  margin: 1.5rem 0 0; max-width: 46ch;
  font-size: clamp(1.0625rem, 1.6vw, 1.1875rem);
  line-height: 1.55; color: var(--ink-2); text-wrap: pretty;
}
.lane-a .actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 2rem; }
.lane-a .btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  font-size: 0.9375rem; font-weight: 600; text-decoration: none;
  padding: 0.8125rem 1.375rem; border-radius: 2px;
  transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1), background 240ms, border-color 240ms;
}
.lane-a .btn-primary { background: var(--indigo); color: oklch(0.99 0 0); }
.lane-a .btn-primary:hover { transform: translateY(-1px); }
.lane-a .btn-ghost { border: 1px solid var(--rule-strong); color: var(--ink); }
.lane-a .btn-ghost:hover { border-color: var(--ink); }
.lane-a .btn:focus-visible { outline: 2px solid var(--indigo); outline-offset: 2px; }
.lane-a .note { margin: 1.25rem 0 0; font-size: 0.8125rem; color: var(--ink-2); }

/* ---- the score block, set like a bulletin summary ---- */
.lane-a .score { border-top: 2px solid var(--ink); padding-top: 1.25rem; }
.lane-a .score-big {
  font-size: clamp(4rem, 11vw, 6rem); line-height: 0.85; font-weight: 700;
  letter-spacing: -0.045em; font-variant-numeric: tabular-nums;
}
.lane-a .score-sub { margin: 0.875rem 0 0; font-size: 0.9375rem; color: var(--ink-2); }
.lane-a .breakdown { margin-top: 1.5rem; display: grid; gap: 0.5rem; }
.lane-a .breakdown-row {
  display: grid; grid-template-columns: 1fr auto; align-items: baseline;
  gap: 0.75rem; padding-block: 0.4375rem; border-top: 1px solid var(--rule);
  font-size: 0.875rem;
}
.lane-a .breakdown-row b { font-variant-numeric: tabular-nums; font-weight: 600; }

/* ---- the matrix ---- */
.lane-a .matrix-head {
  display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between;
  gap: 0.75rem; padding-bottom: 0.75rem;
}
.lane-a .matrix-title { font-size: 1.0625rem; font-weight: 600; letter-spacing: -0.01em; }
.lane-a .matrix-meta { font-size: 0.8125rem; color: var(--ink-2); font-variant-numeric: tabular-nums; }
.lane-a .scroller { overflow-x: auto; position: relative; }
.lane-a table { width: 100%; min-width: 40rem; border-collapse: collapse; }
.lane-a thead th {
  text-align: left; font-size: 0.75rem; font-weight: 600; color: var(--ink-2);
  padding: 0.625rem 0.75rem; border-block: 1px solid var(--ink);
  white-space: nowrap;
}
.lane-a thead th.num { text-align: center; width: 7.5rem; }
.lane-a tbody td {
  padding: 0.8125rem 0.75rem; border-bottom: 1px solid var(--rule);
  font-size: 0.9375rem; vertical-align: middle;
}
.lane-a tbody td.q { color: var(--ink); }
.lane-a tbody td.cell { text-align: center; }
.lane-a tbody tr:hover td { background: var(--paper-2); }
.lane-a .dot {
  display: inline-block; width: 0.6875rem; height: 0.6875rem; border-radius: 50%;
  background: var(--indigo);
}
.lane-a .dot-off {
  display: inline-block; width: 0.6875rem; height: 0.6875rem; border-radius: 50%;
  border: 1px solid var(--rule-strong);
}
.lane-a tfoot td {
  padding: 0.875rem 0.75rem; border-top: 2px solid var(--ink);
  font-size: 0.875rem; font-weight: 600; font-variant-numeric: tabular-nums;
}
.lane-a tfoot td.cell { text-align: center; }
.lane-a .legend {
  display: flex; flex-wrap: wrap; gap: 1.25rem; margin-top: 1rem;
  font-size: 0.8125rem; color: var(--ink-2);
}
.lane-a .legend span { display: inline-flex; align-items: center; gap: 0.5rem; }

/* ---- the shift, as ruled rows rather than cards ---- */
.lane-a .shift { padding-block: clamp(4rem, 9vw, 7rem); }
.lane-a h2 {
  font-size: clamp(1.75rem, 3.6vw, 2.75rem); line-height: 1.05;
  letter-spacing: -0.03em; font-weight: 700; margin: 0 0 2.5rem; max-width: 20ch;
  text-wrap: balance;
}
.lane-a .shift-row {
  display: grid; gap: 0.5rem 2rem; padding-block: 1.5rem;
  border-top: 1px solid var(--rule); align-items: start;
  grid-template-columns: 1fr;
}
@media (min-width: 48rem) {
  .lane-a .shift-row { grid-template-columns: 9rem 14rem minmax(0, 1fr); }
}
.lane-a .shift-row:last-of-type { border-bottom: 1px solid var(--rule); }
.lane-a .shift-when { font-size: 0.8125rem; color: var(--ink-2); font-weight: 600; }
.lane-a .shift-row[data-now="true"] .shift-when { color: var(--indigo); }
.lane-a .shift-what { font-size: 1.125rem; font-weight: 600; letter-spacing: -0.015em; }
.lane-a .shift-why { font-size: 0.9375rem; line-height: 1.6; color: var(--ink-2); max-width: 58ch; }

/* ---- close ---- */
.lane-a .close { padding-block: clamp(3.5rem, 8vw, 6rem); border-top: 2px solid var(--ink); }
.lane-a .close h2 { margin-bottom: 1.25rem; }
.lane-a .close p { max-width: 52ch; color: var(--ink-2); line-height: 1.6; margin: 0 0 2rem; }

@media (prefers-reduced-motion: reduce) {
  .lane-a * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
`;

const SHIFT = [
  {
    when: "Until recently",
    what: "Google decided",
    why: "Search rankings decided who got the first call. SEO was the whole game, and the scoreboard was public.",
    now: false,
  },
  {
    when: "Now",
    what: "The assistant decides",
    why: "A prospective client asks ChatGPT for an immigration lawyer and gets three names. There is no page two, and no scoreboard you can check.",
    now: true,
  },
  {
    when: "Next",
    what: "The answer is the shortlist",
    why: "If your firm is not in the answer, you are not in the consideration set. You will not see the inquiry you did not get.",
    now: false,
  },
];

export default function Instrument() {
  return (
    <>
      <title>Direction A · Instrument — Clientory</title>
      <meta name="robots" content="noindex" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&display=swap"
      />
      <style>{css}</style>

      <div className="lane-a">
        <CompBar current="instrument" />

        <header className="topbar">
          <div className="wrap topbar-in">
            <div className="mark">
              Clientory<span>.</span>
            </div>
            <a className="topbar-cta" href={CLIENTORY_APP_URL}>
              Run a scan
            </a>
          </div>
        </header>

        <section className="hero wrap">
          <div className="hero-grid">
            <div>
              <h1>
                We ask the assistants. We write down <em>whether they say your name.</em>
              </h1>
              <p className="lede">
                Clientory sends the questions your prospective clients actually type (H-1B
                transfers, I-485 filings, removal defense) through ChatGPT, Claude, and Gemini,
                then reports which answers named your firm and which did not.
              </p>
              <div className="actions">
                <a className="btn btn-primary" href={CLIENTORY_APP_URL}>
                  Run a scan for your firm
                </a>
                <a className="btn btn-ghost" href="#report">
                  Read a sample report
                </a>
              </div>
              <p className="note">Free during beta. No credit card.</p>
            </div>

            <div className="score">
              <div className="score-big">{VISIBILITY_PCT}%</div>
              <p className="score-sub">
                of {TOTAL_ANSWERS} answers named this firm. {NAMED_COUNT} out of {TOTAL_ANSWERS}.
              </p>
              <div className="breakdown">
                {BY_PROVIDER.map((row) => (
                  <div className="breakdown-row" key={row.provider}>
                    <span>{row.provider}</span>
                    <b>
                      {row.hits} / {row.total}
                    </b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="wrap" id="report">
          <div className="matrix-head">
            <div className="matrix-title">Sample report</div>
            <div className="matrix-meta">
              Houston, TX · immigration · {QUERIES.length} queries × {PROVIDERS.length} assistants
            </div>
          </div>
          <div className="scroller">
            <table>
              <caption className="sr-only">
                Which AI assistants named the firm, by prospect query
              </caption>
              <thead>
                <tr>
                  <th scope="col">Prospect query</th>
                  {PROVIDERS.map((p) => (
                    <th scope="col" className="num" key={p}>
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {QUERIES.map((row) => (
                  <tr key={row.query}>
                    <td className="q">{row.query}</td>
                    {PROVIDERS.map((p) => (
                      <td className="cell" key={p}>
                        <span className={row.named[p] ? "dot" : "dot-off"} aria-hidden="true" />
                        <span className="sr-only">{row.named[p] ? "Named" : "Not named"}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Named in</td>
                  {BY_PROVIDER.map((row) => (
                    <td className="cell" key={row.provider}>
                      {row.hits} / {row.total}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="legend">
            <span>
              <i className="dot" aria-hidden="true" /> Firm named in the answer
            </span>
            <span>
              <i className="dot-off" aria-hidden="true" /> Firm absent from the answer
            </span>
            <span>Sample data. Firm names are invented.</span>
          </p>
        </section>

        <section className="shift wrap">
          <h2>Ranking on Google does not mean the assistant knows you.</h2>
          {SHIFT.map((row) => (
            <div className="shift-row" data-now={row.now} key={row.when}>
              <div className="shift-when">{row.when}</div>
              <div className="shift-what">{row.what}</div>
              <div className="shift-why">{row.why}</div>
            </div>
          ))}
        </section>

        <section className="close wrap">
          <h2>Find out where you stand.</h2>
          <p>
            One scan returns the full matrix for your firm, your city, and your practice areas,
            plus the specific gaps worth fixing first.
          </p>
          <div className="actions">
            <a className="btn btn-primary" href={CLIENTORY_APP_URL}>
              Run a scan for your firm
            </a>
          </div>
        </section>
      </div>
    </>
  );
}

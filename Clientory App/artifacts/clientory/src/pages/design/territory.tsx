import { CLIENTORY_APP_URL } from "@/lib/app-url";
import { MARKETS } from "./_data";
import { CompBar } from "./_comp-bar";

/**
 * Direction D — "Territory".
 *
 * Immigration search is intensely geographic, and so is invisibility: a firm can
 * be recommended in one metro and absent in the one next door. Color strategy:
 * Full palette, three named roles — indigo (named), ember (absent), and the
 * neutral graticule everything is plotted on. The coverage plot is the hero
 * object; there is no floating dashboard mock.
 */

const css = `
.lane-d {
  --ground: oklch(0.16 0.021 262);
  --ground-2: oklch(0.21 0.024 262);
  --grid: oklch(0.30 0.022 262);
  --on-ground: oklch(0.97 0.005 262);
  --on-ground-2: oklch(0.75 0.017 262);
  --named: oklch(0.66 0.175 273);
  --absent: oklch(0.68 0.185 42);

  background: var(--ground);
  color: var(--on-ground);
  font-family: Barlow, system-ui, sans-serif;
  min-height: 100vh;
}
.lane-d .cond { font-family: "Barlow Condensed", Barlow, system-ui, sans-serif; }
.lane-d .wrap { max-width: 80rem; margin-inline: auto; padding-inline: clamp(1.25rem, 4vw, 3rem); }

.lane-d .topbar {
  position: sticky; top: 0; z-index: 20;
  background: color-mix(in oklab, var(--ground) 86%, transparent);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--grid);
}
.lane-d .topbar-in {
  display: flex; align-items: center; justify-content: space-between; height: 3.5rem; gap: 1rem;
}
.lane-d .mark { font-weight: 700; font-size: 1.0625rem; letter-spacing: 0.01em; }
.lane-d .topbar-cta {
  font-size: 0.875rem; font-weight: 600; text-decoration: none;
  background: var(--named); color: oklch(0.14 0.02 273);
  padding: 0.4375rem 1rem; border-radius: 3px; white-space: nowrap;
  transition: filter 220ms ease-out;
}
.lane-d .topbar-cta:hover { filter: brightness(1.1); }
.lane-d .topbar-cta:focus-visible { outline: 2px solid var(--on-ground); outline-offset: 2px; }

/* ---- hero ---- */
.lane-d .hero { padding-block: clamp(3rem, 7vw, 5rem) clamp(1.5rem, 3vw, 2.5rem); }
.lane-d h1 {
  font-size: clamp(2.5rem, 7vw, 5rem); line-height: 0.95; letter-spacing: -0.03em;
  font-weight: 600; margin: 0; max-width: 15ch; text-wrap: balance;
}
.lane-d h1 em { font-style: normal; color: var(--absent); }
.lane-d .lede {
  margin: 1.5rem 0 0; max-width: 52ch; font-size: clamp(1.0625rem, 1.6vw, 1.1875rem);
  line-height: 1.55; color: var(--on-ground-2); text-wrap: pretty;
}
.lane-d .actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 2rem; align-items: center; }
.lane-d .btn {
  display: inline-flex; align-items: center; gap: 0.5rem;
  font-size: 0.9375rem; font-weight: 600; text-decoration: none;
  padding: 0.8125rem 1.5rem; border-radius: 3px;
  background: var(--named); color: oklch(0.14 0.02 273);
  transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1), filter 240ms;
}
.lane-d .btn:hover { transform: translateY(-1px); filter: brightness(1.1); }
.lane-d .btn:focus-visible { outline: 2px solid var(--on-ground); outline-offset: 3px; }
.lane-d .note { font-size: 0.875rem; color: var(--on-ground-2); }

/* ---- plot ---- */
.lane-d .plot-panel {
  margin-block: clamp(1.5rem, 4vw, 2.5rem);
  background: var(--ground-2);
  border: 1px solid var(--grid);
  border-radius: 6px;
  overflow: hidden;
}
.lane-d .plot-head {
  display: flex; flex-wrap: wrap; gap: 0.75rem 1.5rem; align-items: baseline;
  justify-content: space-between;
  padding: 1rem clamp(1rem, 2.5vw, 1.5rem);
  border-bottom: 1px solid var(--grid);
}
.lane-d .plot-title { font-size: 0.9375rem; font-weight: 600; letter-spacing: 0.01em; }
.lane-d .legend { display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.8125rem; color: var(--on-ground-2); }
.lane-d .legend span { display: inline-flex; align-items: center; gap: 0.4375rem; }
.lane-d .swatch { width: 0.625rem; height: 0.625rem; border-radius: 50%; display: inline-block; }
.lane-d svg { display: block; width: 100%; height: auto; }
.lane-d .plot-label { display: none; }
@media (min-width: 48rem) { .lane-d .plot-label { display: block; } }
.lane-d .dot-hit { cursor: default; }
.lane-d .dot-hit:hover .ring, .lane-d .dot-hit:focus-visible .ring { opacity: 1; }
.lane-d .ring { opacity: 0; transition: opacity 200ms ease-out; }

/* ---- market table ---- */
.lane-d .markets { padding-block: clamp(3rem, 7vw, 5rem); }
.lane-d h2 {
  font-size: clamp(1.75rem, 3.6vw, 2.75rem); line-height: 1.05; letter-spacing: -0.025em;
  font-weight: 600; margin: 0 0 0.75rem; max-width: 22ch; text-wrap: balance;
}
.lane-d .h2-sub { margin: 0 0 2rem; max-width: 56ch; color: var(--on-ground-2); line-height: 1.6; }
.lane-d .scroller { overflow-x: auto; position: relative; }
.lane-d table { width: 100%; min-width: 34rem; border-collapse: collapse; }
.lane-d th {
  text-align: left; font-family: "Barlow Condensed", sans-serif;
  text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.8125rem;
  color: var(--on-ground-2); font-weight: 600;
  padding: 0.625rem 0.75rem; border-bottom: 1px solid var(--grid);
}
.lane-d th.r, .lane-d td.r { text-align: right; }
.lane-d td {
  padding: 0.75rem; border-bottom: 1px solid var(--grid); font-size: 0.9375rem;
  font-variant-numeric: tabular-nums;
}
.lane-d td.city { font-weight: 500; font-variant-numeric: normal; }
.lane-d tr:hover td { background: var(--ground-2); }
.lane-d .status {
  display: inline-flex; align-items: center; gap: 0.4375rem; font-size: 0.875rem;
}
.lane-d .bar { height: 6px; border-radius: 999px; background: var(--absent); display: block; }
.lane-d .bar[data-named="true"] { background: var(--named); }

/* ---- close ---- */
.lane-d .close {
  border-top: 1px solid var(--grid); padding-block: clamp(3.5rem, 8vw, 6rem);
}
.lane-d .close p { max-width: 54ch; color: var(--on-ground-2); line-height: 1.6; margin: 1.25rem 0 0; }
.lane-d .foot { padding-bottom: 3rem; font-size: 0.75rem; color: var(--on-ground-2); }

@media (prefers-reduced-motion: reduce) {
  .lane-d * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
`;

// Ranked by the size of the miss: big market, not named.
const RANKED = [...MARKETS].sort((a, b) => {
  if (a.named !== b.named) return a.named ? 1 : -1;
  return b.share - a.share;
});

const NAMED_IN = MARKETS.filter((m) => m.named).length;

export default function Territory() {
  return (
    <>
      <title>Direction D · Territory — Clientory</title>
      <meta name="robots" content="noindex" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600&family=Barlow:wght@400;500;600;700&display=swap"
      />
      <style>{css}</style>

      <div className="lane-d">
        <CompBar current="territory" />

        <header className="topbar">
          <div className="wrap topbar-in">
            <div className="mark">Clientory</div>
            <a className="topbar-cta" href={CLIENTORY_APP_URL}>
              Run a scan
            </a>
          </div>
        </header>

        <section className="hero wrap">
          <h1>
            Immigration search is local. So is <em>being invisible.</em>
          </h1>
          <p className="lede">
            An assistant asked for an immigration lawyer answers differently in Houston than in
            Miami. Clientory runs your firm's queries market by market and shows you which ones
            return your name and which return someone else's.
          </p>
          <div className="actions">
            <a className="btn" href={CLIENTORY_APP_URL}>
              Run a scan for your firm
            </a>
            <span className="note">One free report. No credit card.</span>
          </div>
        </section>

        <div className="wrap">
          <div className="plot-panel">
            <div className="plot-head">
              <div className="plot-title">
                Sample coverage · 13 metro markets · named in {NAMED_IN}
              </div>
              <div className="legend">
                <span>
                  <i className="swatch" style={{ background: "var(--named)" }} /> Named in the
                  answer
                </span>
                <span>
                  <i className="swatch" style={{ background: "var(--absent)" }} /> Absent
                </span>
                <span>Dot size = share of national query volume</span>
              </div>
            </div>

            <svg viewBox="0 0 100 62" role="img" aria-labelledby="plot-title plot-desc">
              <title id="plot-title">Sample AI visibility by metro market</title>
              <desc id="plot-desc">
                Thirteen US metro markets plotted by approximate geography. The firm is named in
                assistant answers in {NAMED_IN} of them and absent in the rest, including the
                largest markets. The same data is listed in the table below.
              </desc>

              {/* graticule */}
              <g stroke="var(--grid)" strokeWidth="0.12">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <line key={`v${i}`} x1={i * 12.5} y1="0" x2={i * 12.5} y2="62" />
                ))}
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <line key={`h${i}`} x1="0" y1={i * 12.4} x2="100" y2={i * 12.4} />
                ))}
              </g>

              {MARKETS.map((m) => {
                const cx = 4 + (m.x / 100) * 92;
                const cy = 5 + (m.y / 100) * 52;
                const r = 0.45 + Math.sqrt(m.share) * 0.3;
                const fill = m.named ? "var(--named)" : "var(--absent)";
                const flip = m.x > 72;
                return (
                  <g key={m.city} className="dot-hit" tabIndex={0}>
                    <circle
                      className="ring"
                      cx={cx}
                      cy={cy}
                      r={r + 1.6}
                      fill="none"
                      stroke={fill}
                      strokeWidth="0.3"
                    />
                    <circle cx={cx} cy={cy} r={r} fill={fill} fillOpacity={m.named ? 0.95 : 0.85} />
                    <text
                      className="plot-label cond"
                      x={flip ? cx - r - 0.9 : cx + r + 0.9}
                      y={cy + 0.42}
                      textAnchor={flip ? "end" : "start"}
                      fontSize="1.15"
                      fill="var(--on-ground-2)"
                    >
                      {m.city}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <section className="markets wrap">
          <h2>The biggest markets are the ones you are missing.</h2>
          <p className="h2-sub">
            Ranked by how much query volume each market carries. Absent markets first, because
            that is where the unclaimed work is.
          </p>
          <div className="scroller">
            <table>
              <thead>
                <tr>
                  <th scope="col">Market</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="r">
                    Query share
                  </th>
                  <th scope="col" style={{ width: "30%" }}>
                    <span className="sr-only">Relative share</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {RANKED.map((m) => (
                  <tr key={m.city}>
                    <td className="city">{m.city}</td>
                    <td>
                      <span className="status">
                        <i
                          className="swatch"
                          style={{ background: m.named ? "var(--named)" : "var(--absent)" }}
                          aria-hidden="true"
                        />
                        {m.named ? "Named" : "Absent"}
                      </span>
                    </td>
                    <td className="r">{m.share}%</td>
                    <td>
                      <i
                        className="bar"
                        data-named={m.named}
                        style={{ width: `${(m.share / 14) * 100}%` }}
                        aria-hidden="true"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="close wrap">
          <h2>Find the markets answering with someone else's name.</h2>
          <p>
            One scan covers your city and the metros you actually compete in, across ChatGPT,
            Claude, and Gemini, with the full text of every answer.
          </p>
          <div className="actions">
            <a className="btn" href={CLIENTORY_APP_URL}>
              Run a scan for your firm
            </a>
          </div>
        </section>

        <div className="wrap">
          <p className="foot">
            Sample data. Market positions are schematic rather than cartographic, and the coverage
            shown does not describe a real practice.
          </p>
        </div>
      </div>
    </>
  );
}

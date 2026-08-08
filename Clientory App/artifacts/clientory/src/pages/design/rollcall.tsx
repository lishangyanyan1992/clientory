import { Helmet } from "react-helmet-async";
import { motion, useReducedMotion } from "framer-motion";
import { CLIENTORY_APP_URL } from "@/lib/app-url";
import { ANSWER_FIRMS, HERO_QUERY, VISIBILITY_PCT } from "./_data";
import { CompBar } from "./_comp-bar";

/**
 * Direction B — "Roll call".
 *
 * Color strategy: Drenched. The indigo is the surface, not an accent. The hero
 * is the product's own evidence: a real-shaped assistant answer that names three
 * competitors and not the visitor. The layout makes the argument; the copy just
 * labels it.
 */

const css = `
.lane-b {
  --field: oklch(0.31 0.128 272);
  --field-deep: oklch(0.24 0.114 272);
  --field-lift: oklch(0.38 0.135 272);
  --on-field: oklch(0.98 0.006 272);
  --on-field-dim: oklch(0.82 0.052 272);
  --on-field-faint: oklch(0.71 0.055 272);
  --signal: oklch(0.86 0.17 96);

  background: var(--field);
  color: var(--on-field);
  font-family: "Public Sans", system-ui, sans-serif;
  min-height: 100vh;
  overflow-x: hidden;
}
.lane-b .display { font-family: "Bricolage Grotesque", Archivo, system-ui, sans-serif; }
.lane-b .wrap { max-width: 68rem; margin-inline: auto; padding-inline: clamp(1.25rem, 5vw, 3.5rem); }

.lane-b .topbar {
  position: sticky; top: 0; z-index: 20;
  background: color-mix(in oklab, var(--field) 82%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid color-mix(in oklab, var(--on-field) 14%, transparent);
}
.lane-b .topbar-in {
  display: flex; align-items: center; justify-content: space-between;
  height: 3.75rem; gap: 1rem;
}
.lane-b .mark {
  font-weight: 800; font-size: 1.0625rem; letter-spacing: -0.025em;
  font-family: "Bricolage Grotesque", system-ui, sans-serif;
}
.lane-b .topbar-cta {
  font-size: 0.875rem; font-weight: 600; text-decoration: none;
  color: var(--on-field); border: 1px solid color-mix(in oklab, var(--on-field) 42%, transparent);
  padding: 0.4375rem 1rem; border-radius: 999px; white-space: nowrap;
  transition: background 260ms cubic-bezier(0.22, 1, 0.36, 1), color 260ms, border-color 260ms;
}
.lane-b .topbar-cta:hover { background: var(--on-field); color: var(--field); border-color: var(--on-field); }
.lane-b .topbar-cta:focus-visible { outline: 2px solid var(--signal); outline-offset: 2px; }

/* ---- the scene ---- */
.lane-b .scene { padding-block: clamp(3rem, 8vw, 6rem) clamp(3.5rem, 9vw, 7rem); }
.lane-b .stage-label {
  font-size: 0.875rem; color: var(--on-field-faint); margin: 0 0 1.25rem;
  letter-spacing: 0.01em;
}
.lane-b .query {
  font-family: "Bricolage Grotesque", system-ui, sans-serif;
  font-size: clamp(2rem, 5.6vw, 3.75rem);
  line-height: 1.04; letter-spacing: -0.035em; font-weight: 600;
  margin: 0; max-width: 18ch; text-wrap: balance;
}

.lane-b .answer { margin-top: clamp(2.5rem, 6vw, 4rem); }
.lane-b .answer-label {
  font-size: 0.875rem; color: var(--on-field-dim); margin: 0 0 1.5rem;
  display: flex; align-items: center; gap: 0.625rem;
}
.lane-b .answer-label::after {
  content: ""; flex: 1; height: 1px;
  background: color-mix(in oklab, var(--on-field) 20%, transparent);
}
.lane-b ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 0; }
.lane-b li {
  display: grid; grid-template-columns: 2.25rem minmax(0, 1fr); gap: 0 1rem;
  padding-block: 1.125rem;
  border-top: 1px solid color-mix(in oklab, var(--on-field) 16%, transparent);
  align-items: baseline;
}
.lane-b li:last-child { border-bottom: 1px solid color-mix(in oklab, var(--on-field) 16%, transparent); }
.lane-b .rank {
  font-variant-numeric: tabular-nums; font-size: 0.9375rem;
  color: var(--on-field-faint); font-weight: 600;
}
.lane-b .firm {
  font-family: "Bricolage Grotesque", system-ui, sans-serif;
  font-size: clamp(1.25rem, 2.6vw, 1.75rem); font-weight: 600;
  letter-spacing: -0.02em; line-height: 1.15;
}
.lane-b .firm-note {
  grid-column: 2; margin: 0.375rem 0 0; font-size: 0.9375rem;
  line-height: 1.55; color: var(--on-field-dim); max-width: 62ch;
}

.lane-b .absence {
  margin-top: clamp(2.5rem, 6vw, 3.5rem);
  padding: clamp(1.5rem, 4vw, 2.25rem);
  background: var(--field-deep);
  border-radius: 4px;
  display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.75rem 1.25rem;
  justify-content: space-between;
}
.lane-b .absence-text {
  font-family: "Bricolage Grotesque", system-ui, sans-serif;
  font-size: clamp(1.375rem, 3.4vw, 2.25rem); font-weight: 600;
  letter-spacing: -0.025em; line-height: 1.1; margin: 0; text-wrap: balance;
}
.lane-b .absence-text u {
  text-decoration: underline; text-decoration-color: var(--signal);
  text-decoration-thickness: 3px; text-underline-offset: 6px;
}
.lane-b .absence-meta {
  font-size: 0.875rem; color: var(--on-field-dim); margin: 0; white-space: nowrap;
}
.lane-b .disclaimer {
  margin: 1rem 0 0; font-size: 0.75rem; color: var(--on-field-faint);
}

/* ---- the turn ---- */
.lane-b .turn { background: var(--field-deep); padding-block: clamp(4rem, 10vw, 7.5rem); }
.lane-b h2 {
  font-family: "Bricolage Grotesque", system-ui, sans-serif;
  font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.03; letter-spacing: -0.035em;
  font-weight: 600; margin: 0; max-width: 17ch; text-wrap: balance;
}
.lane-b .turn p {
  margin: 1.5rem 0 0; max-width: 52ch; font-size: clamp(1.0625rem, 1.7vw, 1.1875rem);
  line-height: 1.6; color: var(--on-field-dim); text-wrap: pretty;
}

/* ---- what it does ---- */
.lane-b .does { padding-block: clamp(4rem, 10vw, 7rem); }
.lane-b .steps { display: grid; gap: 0; margin-top: 2.5rem; }
.lane-b .step {
  display: grid; gap: 0.5rem 2rem; padding-block: 1.75rem;
  border-top: 1px solid color-mix(in oklab, var(--on-field) 16%, transparent);
  grid-template-columns: 1fr;
}
@media (min-width: 48rem) { .lane-b .step { grid-template-columns: 16rem minmax(0, 1fr); } }
.lane-b .step:last-child { border-bottom: 1px solid color-mix(in oklab, var(--on-field) 16%, transparent); }
.lane-b .step-t {
  font-family: "Bricolage Grotesque", system-ui, sans-serif;
  font-size: 1.25rem; font-weight: 600; letter-spacing: -0.02em;
}
.lane-b .step-d { font-size: 0.9375rem; line-height: 1.6; color: var(--on-field-dim); max-width: 60ch; }

/* ---- close ---- */
.lane-b .close {
  background: var(--field-lift); padding-block: clamp(4rem, 10vw, 7rem);
}
.lane-b .btn {
  display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 2rem;
  font-size: 1rem; font-weight: 600; text-decoration: none;
  background: var(--on-field); color: var(--field-deep);
  padding: 0.9375rem 1.75rem; border-radius: 999px;
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
}
.lane-b .btn:hover { transform: translateY(-2px); }
.lane-b .btn:focus-visible { outline: 2px solid var(--signal); outline-offset: 3px; }
.lane-b .close small { display: block; margin-top: 1rem; font-size: 0.8125rem; color: var(--on-field-dim); }

@media (prefers-reduced-motion: reduce) {
  .lane-b * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
`;

const STEPS = [
  {
    t: "Your questions, not generic ones",
    d: "Clientory builds the queries from your practice areas and your city: H-1B transfers in Houston, asylum representation in Harris County, an N-400 denial appeal. The questions a client would actually type.",
  },
  {
    t: "Three assistants, every time",
    d: "Each query runs through ChatGPT, Claude, and Gemini in parallel. The same question can return your name in one and skip you in the other two, and that difference is the useful part.",
  },
  {
    t: "The answer, on the record",
    d: "You get the full text of every answer, who was named instead of you, and the specific gaps worth closing first.",
  },
];

export default function RollCall() {
  const reduce = useReducedMotion();

  const item = (i: number) =>
    reduce
      ? {}
      : {
          initial: { y: 18 },
          animate: { y: 0 },
          transition: { duration: 0.55, delay: 0.28 + i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <>
      <Helmet>
        <title>Direction B · Roll call — Clientory</title>
        <meta name="robots" content="noindex" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,800&family=Public+Sans:wght@400;500;600&display=swap"
        />
      </Helmet>
      <style>{css}</style>

      <div className="lane-b">
        <CompBar current="rollcall" />

        <header className="topbar">
          <div className="wrap topbar-in">
            <div className="mark">Clientory</div>
            <a className="topbar-cta" href={CLIENTORY_APP_URL}>
              Run a scan
            </a>
          </div>
        </header>

        <section className="scene wrap">
          <motion.p
            className="stage-label"
            {...(reduce
              ? {}
              : {
                  initial: { y: 8 },
                  animate: { y: 0 },
                  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
                })}
          >
            This morning, someone in Houston asked ChatGPT:
          </motion.p>

          <motion.h1
            className="query"
            {...(reduce
              ? {}
              : {
                  initial: { y: 22 },
                  animate: { y: 0 },
                  transition: { duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const },
                })}
          >
            {HERO_QUERY}
          </motion.h1>

          <div className="answer">
            <motion.p
              className="answer-label"
              {...(reduce
                ? {}
                : {
                    initial: { y: 8 },
                    animate: { y: 0 },
                    transition: { duration: 0.4, delay: 0.22, ease: [0.22, 1, 0.36, 1] as const },
                  })}
            >
              It answered
            </motion.p>

            <ol>
              {ANSWER_FIRMS.map((firm, i) => (
                <motion.li key={firm.name} {...item(i)}>
                  <span className="rank">{String(i + 1).padStart(2, "0")}</span>
                  <span className="firm">{firm.name}</span>
                  <p className="firm-note">{firm.note}</p>
                </motion.li>
              ))}
            </ol>

            <motion.div
              className="absence"
              {...(reduce
                ? {}
                : {
                    initial: { y: 22 },
                    animate: { y: 0 },
                    transition: {
                      duration: 0.5,
                      delay: 0.72,
                      ease: [0.22, 1, 0.36, 1] as const,
                    },
                  })}
            >
              <p className="absence-text">
                Your firm was <u>not in the answer</u>.
              </p>
              <p className="absence-meta">And nothing told you.</p>
            </motion.div>

            <p className="disclaimer">
              Illustrative answer. Firm names are invented and do not refer to real practices.
            </p>
          </div>
        </section>

        <section className="turn">
          <div className="wrap">
            <h2>There is no page two to climb to.</h2>
            <p>
              A search results page gave you a rank and a path upward. An assistant gives your
              prospective client three names and a paragraph, and the conversation moves on. You
              never see the inquiry that did not arrive, so the loss is invisible by construction.
            </p>
            <p>
              In the sample above, this firm was named in {VISIBILITY_PCT}% of answers across the
              questions its own clients ask. Most firms have never checked once.
            </p>
          </div>
        </section>

        <section className="does wrap">
          <h2>Clientory checks, on a schedule, and shows you the text.</h2>
          <div className="steps">
            {STEPS.map((s) => (
              <div className="step" key={s.t}>
                <div className="step-t">{s.t}</div>
                <div className="step-d">{s.d}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="close">
          <div className="wrap">
            <h2>See the answer your clients are getting.</h2>
            <div>
              <a className="btn" href={CLIENTORY_APP_URL}>
                Run a scan for your firm
              </a>
              <small>Free during beta. No credit card. Results in a few minutes.</small>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

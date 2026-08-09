import { Link } from "react-router-dom";

/**
 * Index for the landing-page direction comps. Noindex, not linked from the
 * site; delete the whole `pages/design` folder once a direction is chosen.
 */

const LANES = [
  {
    slug: "instrument",
    label: "A · Instrument",
    strategy: "Restrained · off-white, near-black, indigo as the one state marker",
    anchor: "The Visa Bulletin. A terminal's data density.",
    idea: "The scan matrix is the hero. Says: we are a measurement instrument, not a marketing tool.",
  },
  {
    slug: "rollcall",
    label: "B · Roll call",
    strategy: "Drenched · indigo is the surface, not an accent",
    anchor: "One idea per fold, committed all the way down.",
    idea: "The hero is a real-shaped assistant answer naming three competitors, and not you. The layout makes the argument.",
  },
  {
    slug: "notice",
    label: "C · Notice",
    strategy: "Committed · cool blue-grey stock, indigo as the stamp",
    anchor: "A case notice. A docket sheet.",
    idea: "Speaks the visual language your visitors handle every working day. Mono is literal here, not costume.",
  },
  {
    slug: "territory",
    label: "D · Territory",
    strategy: "Full palette · indigo named, ember absent, neutral graticule",
    anchor: "A coverage plot.",
    idea: "Immigration search is geographic, so invisibility is too. Different topology from the other three entirely.",
  },
];

export default function DesignIndex() {
  return (
    <>
      <title>Landing page directions — Clientory</title>
      <meta name="robots" content="noindex" />
      <div className="min-h-screen bg-background px-6 py-16 text-foreground">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight">Landing page directions</h1>
          <p className="mt-3 max-w-prose leading-relaxed text-muted-foreground">
            Four comps. Each keeps indigo as the brand anchor and changes everything else. Hero,
            problem section, and close only: enough to judge a direction, not a full page.
          </p>
          <div className="mt-10 divide-y divide-border border-y border-border">
            {LANES.map((lane) => (
              <Link
                key={lane.slug}
                to={`/_design/${lane.slug}`}
                className="group block py-6 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="text-lg font-semibold group-hover:text-primary">{lane.label}</div>
                <div className="mt-1 text-sm text-muted-foreground">{lane.strategy}</div>
                <div className="mt-1 text-sm text-muted-foreground">{lane.anchor}</div>
                <p className="mt-2 max-w-prose text-sm leading-relaxed">{lane.idea}</p>
              </Link>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            Sample data throughout. Firm names are invented and do not refer to real practices.
          </p>
        </div>
      </div>
    </>
  );
}

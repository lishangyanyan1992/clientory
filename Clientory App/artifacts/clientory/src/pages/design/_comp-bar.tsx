import { Link } from "react-router-dom";

/**
 * Comparison bar shared by the four direction comps. Not part of any design;
 * it exists so the lanes can be flipped through quickly and it deletes with the
 * comps once a direction is chosen.
 */

export const LANES = [
  { slug: "instrument", label: "A · Instrument" },
  { slug: "rollcall", label: "B · Roll call" },
  { slug: "notice", label: "C · Notice" },
  { slug: "territory", label: "D · Territory" },
] as const;

export type LaneSlug = (typeof LANES)[number]["slug"];

export function CompBar({ current }: { current: LaneSlug }) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
        flexWrap: "wrap",
        padding: "0.4375rem 0.75rem",
        background: "#0b0b0f",
        color: "#f4f4f5",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "12px",
        lineHeight: 1.2,
      }}
    >
      <Link
        to="/_design"
        style={{ color: "#a1a1aa", textDecoration: "none", marginRight: "0.5rem" }}
      >
        ← comps
      </Link>
      {LANES.map((lane) => (
        <Link
          key={lane.slug}
          to={`/_design/${lane.slug}`}
          style={{
            padding: "0.25rem 0.5rem",
            borderRadius: "3px",
            textDecoration: "none",
            background: lane.slug === current ? "#f4f4f5" : "transparent",
            color: lane.slug === current ? "#0b0b0f" : "#a1a1aa",
            fontWeight: lane.slug === current ? 600 : 400,
          }}
        >
          {lane.label}
        </Link>
      ))}
    </div>
  );
}

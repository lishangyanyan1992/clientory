import { describe, expect, it, vi } from "vitest";

vi.mock("@workspace/db", () => ({ db: {} }));
import {
  actionForGap,
  buildCompetitorGapAnalysis,
  deriveGapAnalysisStatus,
  evidenceSnippetFor,
  isTargetFirm,
  normalizeFirmName,
  parseExtractionResponse,
} from "./competitor-gaps";

const prompts = [
  {
    id: 1,
    prompt: "Who is best for an employment matter?",
    category: "CATEGORY_GEO",
    audience: "business" as const,
  },
  {
    id: 2,
    prompt: "Who handles immigration cases?",
    category: "SPECIALTY_LONGTAIL",
    audience: "individual" as const,
  },
  {
    id: 3,
    prompt: "Which local firm should I call?",
    category: "CATEGORY_GEO",
    audience: null,
  },
];

const results = [
  {
    id: 10,
    scanPromptId: 1,
    provider: "openai",
    mentioned: true,
    grounded: false,
    sources: [],
  },
  {
    id: 11,
    scanPromptId: 2,
    provider: "anthropic",
    mentioned: false,
    grounded: true,
    sources: [
      { url: "https://www.avvo.com/example", title: "Directory result" },
    ],
  },
  {
    id: 12,
    scanPromptId: 3,
    provider: "openai",
    mentioned: false,
    grounded: false,
    sources: [],
  },
];

const entities = [
  {
    scanResultId: 11,
    displayName: "Northstar Immigration Law LLC",
    normalizedName: "northstar immigration law",
    rank: 2,
    evidenceSnippet: "Northstar Immigration Law is a strong option.",
  },
  {
    scanResultId: 12,
    displayName: "Northstar Immigration Law",
    normalizedName: "northstar immigration law",
    rank: 1,
    evidenceSnippet: "Consider Northstar Immigration Law.",
  },
  {
    scanResultId: 11,
    displayName: "Harbor Legal Group, P.C.",
    normalizedName: "harbor legal group",
    rank: 1,
    evidenceSnippet: "Harbor Legal Group is another choice.",
  },
];

describe("competitor gap discovery", () => {
  it("normalizes punctuation, casing, ampersands, and legal suffixes", () => {
    expect(normalizeFirmName(" Smith & O'Brien, LLP ")).toBe(
      "smith and obrien",
    );
    expect(normalizeFirmName("ACME Legal, P.C.")).toBe("acme legal");
  });

  it("excludes target aliases and requires evidence in the original answer", () => {
    expect(isTargetFirm("Acme Legal, P.C.", ["Acme Legal PC", "Acme Legal Group"])).toBe(true);
    expect(isTargetFirm("Northstar Immigration Law", ["Acme Legal PC"])).toBe(false);
    expect(evidenceSnippetFor("We recommend Northstar Immigration Law for this matter.", "Northstar Immigration Law"))
      .toContain("Northstar Immigration Law");
    expect(evidenceSnippetFor("No firm is explicitly named.", "Northstar Immigration Law")).toBeNull();
  });

  it("derives complete, partial, and failed batch states", () => {
    expect(deriveGapAnalysisStatus(2, 0)).toBe("completed");
    expect(deriveGapAnalysisStatus(1, 1)).toBe("partial");
    expect(deriveGapAnalysisStatus(0, 2)).toBe("failed");
  });

  it("validates extraction JSON and rejects malformed responses", () => {
    expect(
      parseExtractionResponse('```json\n[{"resultId":1,"firms":[]}]\n```'),
    ).toEqual([{ resultId: 1, firms: [] }]);
    expect(() => parseExtractionResponse('{"resultId":1}')).toThrow();
    expect(() =>
      parseExtractionResponse(
        '[{"resultId":1,"firms":[{"name":"Firm","confidence":2}]}]',
      ),
    ).toThrow();
  });

  it("calculates share of voice, deduplicated frequency, and prioritized gaps", () => {
    const analysis = buildCompetitorGapAnalysis({
      status: "completed",
      prompts,
      results,
      entities,
      fullAccess: true,
    });

    expect(analysis.targetMentions).toBe(1);
    expect(analysis.targetShareOfVoice).toBe(25);
    expect(analysis.leadingCompetitor).toBe("Northstar Immigration Law LLC");
    expect(analysis.competitors).toMatchObject([
      { mentions: 2, shareOfVoice: 50, topRank: 1 },
      {
        name: "Harbor Legal Group, P.C.",
        mentions: 1,
        shareOfVoice: 25,
        topRank: 1,
      },
    ]);
    expect(analysis.gaps).toHaveLength(3);
    expect(analysis.gaps[0]).toMatchObject({
      grounded: true,
      competitor: { name: "Harbor Legal Group, P.C.", rank: 1 },
      action: { type: "directory" },
    });
    expect(analysis.gaps[2]).toMatchObject({
      grounded: false,
      action: { type: "authority" },
    });
  });

  it("returns only the leading competitor and top gap for free reports", () => {
    const analysis = buildCompetitorGapAnalysis({
      status: "partial",
      prompts,
      results,
      entities,
      fullAccess: false,
    });

    expect(analysis.completeness).toBe("partial");
    expect(analysis.competitors).toHaveLength(1);
    expect(analysis.gaps).toHaveLength(1);
    expect(analysis).toMatchObject({
      isLocked: true,
      totalGaps: 3,
      visibleGapCount: 1,
      lockedCount: 2,
    });
  });

  it.each(["unavailable", "failed"] as const)("returns a %s state without inventing entities", (status) => {
    const analysis = buildCompetitorGapAnalysis({ status, prompts, results: [], entities: [], fullAccess: true });
    expect(analysis).toMatchObject({
      status,
      completeness: "none",
      targetShareOfVoice: null,
      totalGaps: 0,
      competitors: [],
      gaps: [],
    });
  });

  it("classifies grounded source actions deterministically", () => {
    expect(
      actionForGap("Example Firm", true, [{ url: "https://agency.gov/guide" }])
        .type,
    ).toBe("authoritative_content");
    expect(
      actionForGap("Example Firm", true, [
        { url: "https://examplefirm.com/service" },
      ]).type,
    ).toBe("owned_content");
    expect(
      actionForGap("Example Firm", true, [
        { url: "https://news.example.com/story" },
      ]).type,
    ).toBe("digital_pr");
    expect(actionForGap("Example Firm", false, []).type).toBe("authority");
  });
});

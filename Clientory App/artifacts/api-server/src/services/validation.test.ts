import { describe, it, expect } from "vitest";
import { validateScanInput } from "./validation";

describe("validateScanInput", () => {
  const valid = {
    name: "Sunrise Bakery",
    type: "Bakery",
    location: "Austin, TX",
  };

  // ── Happy path ──────────────────────────────────────────────────────────────
  it("accepts valid inputs", () => {
    expect(validateScanInput(valid.name, valid.type, valid.location)).toEqual({ valid: true });
  });

  // ── Business name ───────────────────────────────────────────────────────────
  it("rejects business name shorter than 2 chars", () => {
    const r = validateScanInput("A", valid.type, valid.location);
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/2 and 80/);
  });

  it("rejects business name longer than 80 chars", () => {
    const r = validateScanInput("A".repeat(81), valid.type, valid.location);
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/2 and 80/);
  });

  it("accepts business name at exactly 2 chars", () => {
    expect(validateScanInput("AB", valid.type, valid.location).valid).toBe(true);
  });

  it("accepts business name at exactly 80 chars", () => {
    expect(validateScanInput("Sunrise Bakery Co".padEnd(80, " X"), valid.type, valid.location).valid).toBe(true);
  });

  // ── Business type ───────────────────────────────────────────────────────────
  it("rejects business type shorter than 2 chars", () => {
    const r = validateScanInput(valid.name, "B", valid.location);
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/2 and 60/);
  });

  it("rejects business type longer than 60 chars", () => {
    const r = validateScanInput(valid.name, "B".repeat(61), valid.location);
    expect(r.valid).toBe(false);
  });

  // ── Location ────────────────────────────────────────────────────────────────
  it("rejects location shorter than 2 chars", () => {
    const r = validateScanInput(valid.name, valid.type, "X");
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/2 and 60/);
  });

  it("rejects location longer than 60 chars", () => {
    const r = validateScanInput(valid.name, valid.type, "X".repeat(61));
    expect(r.valid).toBe(false);
  });

  // ── Blocked terms ───────────────────────────────────────────────────────────
  it("rejects input containing 'test123'", () => {
    const r = validateScanInput("test123 Shop", valid.type, valid.location);
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/real business/);
  });

  it("rejects input containing 'lorem ipsum'", () => {
    const r = validateScanInput("lorem ipsum cafe", valid.type, valid.location);
    expect(r.valid).toBe(false);
  });

  it("rejects 'asdf' in business type", () => {
    const r = validateScanInput(valid.name, "asdf services", valid.location);
    expect(r.valid).toBe(false);
  });

  it("rejects 'foo bar' in location", () => {
    const r = validateScanInput(valid.name, valid.type, "foo bar city");
    expect(r.valid).toBe(false);
  });

  // ── Repeated characters ─────────────────────────────────────────────────────
  it("rejects business name with repeated chars (aaaaa)", () => {
    const r = validateScanInput("aaaaa", valid.type, valid.location);
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/valid business name/);
  });

  it("rejects business type with repeated chars (bbbbb)", () => {
    const r = validateScanInput(valid.name, "bbbbb", valid.location);
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/valid business type/);
  });

  it("rejects location with repeated chars (ccccc)", () => {
    const r = validateScanInput(valid.name, valid.type, "ccccc");
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/valid location/);
  });

  // ── Minimum letters ──────────────────────────────────────────────────────────
  it("rejects business name with fewer than 2 letters (all digits)", () => {
    const r = validateScanInput("12345", valid.type, valid.location);
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/at least 2 letters/);
  });

  // ── Digit ratio ──────────────────────────────────────────────────────────────
  it("rejects business name with >50% digits", () => {
    const r = validateScanInput("Abc 123456", valid.type, valid.location);
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/too many digits/);
  });

  it("rejects business type with >30% digits", () => {
    const r = validateScanInput(valid.name, "AB12345", valid.location);
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/too many digits|describe a service/);
  });

  // ── Symbol ratio ─────────────────────────────────────────────────────────────
  it("rejects business name with >30% special characters", () => {
    const r = validateScanInput("A!@#$%B", valid.type, valid.location);
    expect(r.valid).toBe(false);
    expect(r.error).toMatch(/special characters/);
  });

  // ── Real-world edge cases ────────────────────────────────────────────────────
  it("accepts business names with apostrophes (O'Brien's)", () => {
    expect(validateScanInput("O'Brien's Pub", valid.type, valid.location).valid).toBe(true);
  });

  it("accepts business names with hyphens (Café-Bistro)", () => {
    expect(validateScanInput("Café-Bistro", valid.type, valid.location).valid).toBe(true);
  });

  it("accepts location with comma and state (Austin, TX)", () => {
    expect(validateScanInput(valid.name, valid.type, "Austin, TX").valid).toBe(true);
  });
});

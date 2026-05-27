import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module — otp functions that touch the db are tested via routes
vi.mock("@workspace/db", () => ({
  db: {
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue([]) }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: 1 }]) }),
      }),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }),
  },
}));

import {
  createEmailToken,
  verifyEmailToken,
  createSessionToken,
  createVerifiedToken,
  verifyVerifiedToken,
  hashPassword,
  verifyPassword,
} from "./otp";
import { hashIp, getClientIp } from "./rate-limit";

// ── Email token (OTP-issued) ───────────────────────────────────────────────────
describe("createEmailToken / verifyEmailToken", () => {
  it("roundtrips a valid token", () => {
    const token = createEmailToken("user@example.com");
    expect(verifyEmailToken(token)).toBe("user@example.com");
  });

  it("normalises email to lowercase", () => {
    const token = createEmailToken("User@Example.COM");
    expect(verifyEmailToken(token)).toBe("user@example.com");
  });

  it("rejects a token with a tampered payload", () => {
    const token = createEmailToken("user@example.com");
    const tampered = "evilpayload." + token.split(".")[1];
    expect(verifyEmailToken(tampered)).toBeNull();
  });

  it("rejects a token with a tampered signature", () => {
    const token = createEmailToken("user@example.com");
    const tampered = token.split(".")[0] + ".badsignature";
    expect(verifyEmailToken(tampered)).toBeNull();
  });

  it("rejects a malformed token (no dot)", () => {
    expect(verifyEmailToken("notavalidtoken")).toBeNull();
  });

  it("rejects an expired token", () => {
    // Create token that expired 2ms ago
    const token = createEmailToken("user@example.com", -2);
    expect(verifyEmailToken(token)).toBeNull();
  });
});

// ── Session token (password login — 7-day TTL) ────────────────────────────────
describe("createSessionToken", () => {
  it("creates a valid long-lived token", () => {
    const token = createSessionToken("admin@example.com");
    expect(verifyEmailToken(token)).toBe("admin@example.com");
  });
});

// ── Verified token (password setup flow) ─────────────────────────────────────
describe("createVerifiedToken / verifyVerifiedToken", () => {
  it("roundtrips a valid verified token", () => {
    const token = createVerifiedToken("user@example.com");
    expect(verifyVerifiedToken(token)).toBe("user@example.com");
  });

  it("rejects if purpose is missing (email token used instead)", () => {
    const emailToken = createEmailToken("user@example.com");
    expect(verifyVerifiedToken(emailToken)).toBeNull();
  });

  it("rejects tampered verified token", () => {
    const token = createVerifiedToken("user@example.com");
    const tampered = token.split(".")[0] + ".badsig";
    expect(verifyVerifiedToken(tampered)).toBeNull();
  });
});

// ── Password hashing ──────────────────────────────────────────────────────────
describe("hashPassword / verifyPassword", () => {
  it("verifies correct password", async () => {
    const hash = await hashPassword("correct-horse-battery");
    expect(await verifyPassword("correct-horse-battery", hash)).toBe(true);
  });

  it("rejects wrong password", async () => {
    const hash = await hashPassword("correct-horse-battery");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("produces different hashes for the same password (salted)", async () => {
    const hash1 = await hashPassword("same-password");
    const hash2 = await hashPassword("same-password");
    expect(hash1).not.toBe(hash2);
  });

  it("rejects malformed hash (missing colon)", async () => {
    expect(await verifyPassword("any", "nocolon")).toBe(false);
  });
});

// ── IP utilities ──────────────────────────────────────────────────────────────
describe("hashIp", () => {
  it("returns a 16-char hex string", () => {
    const h = hashIp("127.0.0.1");
    expect(h).toHaveLength(16);
    expect(h).toMatch(/^[0-9a-f]+$/);
  });

  it("is deterministic", () => {
    expect(hashIp("1.2.3.4")).toBe(hashIp("1.2.3.4"));
  });

  it("produces different hashes for different IPs", () => {
    expect(hashIp("1.2.3.4")).not.toBe(hashIp("1.2.3.5"));
  });
});

describe("getClientIp", () => {
  it("prefers req.ip", () => {
    expect(getClientIp({ ip: "1.2.3.4", socket: { remoteAddress: "9.9.9.9" } })).toBe("1.2.3.4");
  });

  it("falls back to socket.remoteAddress", () => {
    expect(getClientIp({ socket: { remoteAddress: "9.9.9.9" } })).toBe("9.9.9.9");
  });

  it("returns 'unknown' when no ip is available", () => {
    expect(getClientIp({})).toBe("unknown");
  });
});

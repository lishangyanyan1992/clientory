import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

// ── Mocks (must be before app/route imports) ──────────────────────────────────

// Always-allow rate limiter so route logic is tested in isolation
vi.mock("../../services/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, remaining: 9, resetAt: new Date() }),
  hashIp: vi.fn().mockReturnValue("hashed-ip"),
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

// Silence Sentry in tests
vi.mock("@sentry/node", () => ({
  init: vi.fn(),
  setupExpressErrorHandler: vi.fn(),
}));

// DB mock — we'll override per-test with mockResolvedValueOnce
const mockDbSelect = vi.fn();
const mockDbInsert = vi.fn();
const mockDbUpdate = vi.fn();

vi.mock("@workspace/db", () => ({
  db: {
    select: () => ({ from: () => ({ where: mockDbSelect }) }),
    insert: () => ({ values: () => ({ onConflictDoUpdate: () => ({ returning: mockDbInsert }), returning: mockDbInsert }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: mockDbUpdate }) }) }),
  },
}));

import app from "../../app";
import { hashPassword, createEmailToken, createVerifiedToken } from "../../services/otp";

// ── Helper ────────────────────────────────────────────────────────────────────
async function makeUser(overrides = {}) {
  return {
    id: 1,
    email: "user@example.com",
    emailVerified: true,
    passwordHash: await hashPassword("correct-password"),
    isAdmin: false,
    freeReportUsedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("400 — missing email", async () => {
    const res = await request(app).post("/api/auth/login").send({ password: "pw" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it("400 — missing password", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "user@example.com" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it("400 — invalid email format", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "notanemail", password: "pw" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid email/i);
  });

  it("401 — user has no password set", async () => {
    const user = await makeUser({ passwordHash: null });
    mockDbSelect.mockResolvedValueOnce([user]);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@example.com", password: "any" });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("NO_PASSWORD");
  });

  it("401 — user not found", async () => {
    mockDbSelect.mockResolvedValueOnce([]);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "ghost@example.com", password: "any" });

    expect(res.status).toBe(401);
  });

  it("401 — wrong password", async () => {
    const user = await makeUser();
    mockDbSelect.mockResolvedValueOnce([user]);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@example.com", password: "wrong-password" });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/incorrect password/i);
  });

  it("200 — successful login returns emailToken and userId", async () => {
    const user = await makeUser();
    mockDbSelect.mockResolvedValueOnce([user]);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@example.com", password: "correct-password" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.emailToken).toBeTruthy();
    expect(res.body.userId).toBe("1");
  });

  it("200 — email is case-insensitive", async () => {
    const user = await makeUser();
    mockDbSelect.mockResolvedValueOnce([user]);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "USER@EXAMPLE.COM", password: "correct-password" });

    expect(res.status).toBe(200);
  });
});

// ── POST /api/auth/send-otp ───────────────────────────────────────────────────
describe("POST /api/auth/send-otp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock email sending
    vi.doMock("../../services/email", () => ({ sendOtpEmail: vi.fn().mockResolvedValue(undefined) }));
    // Mock OTP creation (touches db)
    vi.doMock("../../services/otp", async (importOriginal) => {
      const original = await importOriginal<typeof import("../../services/otp")>();
      return { ...original, createOtp: vi.fn().mockResolvedValue("123456") };
    });
  });

  it("400 — missing email", async () => {
    const res = await request(app).post("/api/auth/send-otp").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email is required/i);
  });

  it("400 — invalid email format", async () => {
    const res = await request(app).post("/api/auth/send-otp").send({ email: "bademail" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid email/i);
  });
});

// ── POST /api/auth/submit-password ───────────────────────────────────────────
describe("POST /api/auth/submit-password", () => {
  beforeEach(() => vi.clearAllMocks());

  it("400 — missing verifiedToken", async () => {
    const res = await request(app).post("/api/auth/submit-password").send({ password: "newpassword" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it("400 — password too short", async () => {
    const token = createVerifiedToken("user@example.com");
    const res = await request(app)
      .post("/api/auth/submit-password")
      .send({ verifiedToken: token, password: "short" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/8 characters/i);
  });

  it("400 — invalid verifiedToken", async () => {
    const res = await request(app)
      .post("/api/auth/submit-password")
      .send({ verifiedToken: "badtoken", password: "longpassword" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/session expired/i);
  });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
describe("GET /api/auth/me", () => {
  beforeEach(() => vi.clearAllMocks());

  it("401 — no token header", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("401 — invalid token", async () => {
    const res = await request(app).get("/api/auth/me").set("x-email-token", "badtoken");
    expect(res.status).toBe(401);
  });

  it("200 — valid token returns user info", async () => {
    const user = await makeUser();
    mockDbSelect.mockResolvedValueOnce([user]);

    const token = createEmailToken("user@example.com");
    const res = await request(app).get("/api/auth/me").set("x-email-token", token);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("user@example.com");
    expect(res.body.isAdmin).toBe(false);
  });
});

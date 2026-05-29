import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @sentry/node before importing business-logger
vi.mock("@sentry/node", () => ({
  captureMessage: vi.fn(),
}));

import * as Sentry from "@sentry/node";
import { logBusinessEvent, timedQuery } from "./business-logger";

describe("business-logger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("logBusinessEvent", () => {
    it("writes structured JSON to stdout for scan_started", () => {
      const lines: string[] = [];
      const spy = vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
        lines.push(String(chunk));
        return true;
      });

      logBusinessEvent("scan_started", { scanId: 42, businessId: 7 });
      spy.mockRestore();

      const entry = JSON.parse(lines.find(l => l.includes("scan_started")) ?? "{}");
      expect(entry.level).toBe("info");
      expect(entry.type).toBe("business");
      expect(entry.event).toBe("scan_started");
      expect(entry.scanId).toBe(42);
      expect(entry.businessId).toBe(7);
      expect(entry.ts).toBeTruthy();
    });

    it("does NOT send scan_started to Sentry (info-level, not alert-worthy)", () => {
      vi.spyOn(process.stdout, "write").mockReturnValue(true);
      logBusinessEvent("scan_started", { scanId: 1 });
      expect(Sentry.captureMessage).not.toHaveBeenCalled();
    });

    it("sends scan_failed to Sentry at error level", () => {
      vi.spyOn(process.stdout, "write").mockReturnValue(true);
      logBusinessEvent("scan_failed", { scanId: 99, reason: "ai_timeout" });
      expect(Sentry.captureMessage).toHaveBeenCalledOnce();
      const [msg, opts] = (Sentry.captureMessage as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(msg).toContain("scan_failed");
      expect(opts.level).toBe("error");
    });

    it("sends payment_failed to Sentry at error level", () => {
      vi.spyOn(process.stdout, "write").mockReturnValue(true);
      logBusinessEvent("payment_failed", { stripeSubscriptionId: "sub_123" });
      expect(Sentry.captureMessage).toHaveBeenCalledOnce();
      const [msg, opts] = (Sentry.captureMessage as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(msg).toContain("payment_failed");
      expect(opts.level).toBe("error");
    });

    it("sends slow_query to Sentry at warning level", () => {
      vi.spyOn(process.stdout, "write").mockReturnValue(true);
      logBusinessEvent("slow_query", { label: "test_query", durationMs: 800 });
      expect(Sentry.captureMessage).toHaveBeenCalledOnce();
      const [msg, opts] = (Sentry.captureMessage as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(msg).toContain("slow_query");
      expect(opts.level).toBe("warning");
    });

    it("does NOT send scan_completed or subscription_created to Sentry", () => {
      vi.spyOn(process.stdout, "write").mockReturnValue(true);
      logBusinessEvent("scan_completed", { scanId: 1, score: 75 });
      logBusinessEvent("subscription_created", { userId: 1, businessId: 2 });
      expect(Sentry.captureMessage).not.toHaveBeenCalled();
    });
  });

  describe("timedQuery", () => {
    it("returns the query result", async () => {
      const result = await timedQuery("test", async () => "hello");
      expect(result).toBe("hello");
    });

    it("does NOT fire slow_query when under threshold", async () => {
      vi.spyOn(process.stdout, "write").mockReturnValue(true);
      await timedQuery("fast", async () => "ok", 5000); // 5 s threshold — never fires
      expect(Sentry.captureMessage).not.toHaveBeenCalled();
    });

    it("fires slow_query + Sentry when query exceeds threshold", async () => {
      const lines: string[] = [];
      vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
        lines.push(String(chunk));
        return true;
      });

      await timedQuery(
        "slow_test",
        async () => {
          await new Promise(r => setTimeout(r, 30)); // 30 ms > 5 ms threshold
          return "done";
        },
        5,
      );

      const entry = JSON.parse(lines.find(l => l.includes("slow_query")) ?? "{}");
      expect(entry.event).toBe("slow_query");
      expect(entry.label).toBe("slow_test");
      expect(entry.durationMs).toBeGreaterThanOrEqual(5);
      expect(Sentry.captureMessage).toHaveBeenCalledOnce();
    });
  });
});

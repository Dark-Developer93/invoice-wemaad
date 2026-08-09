import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma before importing anything that touches it
vi.mock("@/lib/db", () => ({
  default: {
    user: { findUniqueOrThrow: vi.fn() },
    invoice: { count: vi.fn() },
    emailLog: { count: vi.fn(), create: vi.fn() },
    planConfig: { findMany: vi.fn() },
  },
}));

// Bypass caching so each call reflects the current mock data.
vi.mock("next/cache", () => ({
  unstable_cache: (fn: () => unknown) => fn,
}));

import prisma from "@/lib/db";
import { getUserUsage, logEmailSent } from "../usage";

const db = prisma as unknown as {
  user: { findUniqueOrThrow: ReturnType<typeof vi.fn> };
  invoice: { count: ReturnType<typeof vi.fn> };
  emailLog: { count: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
  planConfig: { findMany: ReturnType<typeof vi.fn> };
};

beforeEach(() => {
  vi.clearAllMocks();
  // No PlanConfig rows in this mock — getPlanConfig() falls back to
  // DEFAULT_PLAN_CONFIG, which is what all the expected limits below match.
  db.planConfig.findMany.mockResolvedValue([]);
});

describe("getUserUsage", () => {
  it("returns correct usage for FREE plan", async () => {
    db.user.findUniqueOrThrow.mockResolvedValue({ plan: "FREE" });
    db.invoice.count.mockResolvedValue(3);
    db.emailLog.count.mockResolvedValue(7);

    const result = await getUserUsage("user-1");

    expect(result.plan).toBe("FREE");
    expect(result.invoicesThisMonth).toBe(3);
    expect(result.emailsThisMonth).toBe(7);
    expect(result.invoiceLimit).toBe(5);
    expect(result.emailLimit).toBe(20);
  });

  it("returns null limits for BUSINESS plan (unlimited)", async () => {
    db.user.findUniqueOrThrow.mockResolvedValue({ plan: "BUSINESS" });
    db.invoice.count.mockResolvedValue(500);
    db.emailLog.count.mockResolvedValue(1000);

    const result = await getUserUsage("user-2");

    expect(result.invoiceLimit).toBeNull();
    expect(result.emailLimit).toBeNull();
  });

  it("returns correct limits for STARTER plan", async () => {
    db.user.findUniqueOrThrow.mockResolvedValue({ plan: "STARTER" });
    db.invoice.count.mockResolvedValue(10);
    db.emailLog.count.mockResolvedValue(20);

    const result = await getUserUsage("user-3");

    expect(result.invoiceLimit).toBe(25);
    expect(result.emailLimit).toBe(50);
  });

  it("returns correct limits for PRO plan", async () => {
    db.user.findUniqueOrThrow.mockResolvedValue({ plan: "PRO" });
    db.invoice.count.mockResolvedValue(0);
    db.emailLog.count.mockResolvedValue(0);

    const result = await getUserUsage("user-4");

    expect(result.invoiceLimit).toBe(100);
    expect(result.emailLimit).toBe(500);
  });

  it("passes the userId to all three queries", async () => {
    db.user.findUniqueOrThrow.mockResolvedValue({ plan: "FREE" });
    db.invoice.count.mockResolvedValue(0);
    db.emailLog.count.mockResolvedValue(0);

    await getUserUsage("specific-user-id");

    expect(db.user.findUniqueOrThrow).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "specific-user-id" } })
    );
    expect(db.invoice.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: "specific-user-id" }) })
    );
    expect(db.emailLog.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: "specific-user-id" }) })
    );
  });

  it("queries invoice count within the current month only", async () => {
    db.user.findUniqueOrThrow.mockResolvedValue({ plan: "FREE" });
    db.invoice.count.mockResolvedValue(0);
    db.emailLog.count.mockResolvedValue(0);

    await getUserUsage("user-5");

    const call = db.invoice.count.mock.calls[0][0];
    expect(call.where.createdAt).toHaveProperty("gte");
    expect(call.where.createdAt).toHaveProperty("lte");
    expect(call.where.createdAt.gte).toBeInstanceOf(Date);
    expect(call.where.createdAt.lte).toBeInstanceOf(Date);
    expect(call.where.createdAt.gte <= call.where.createdAt.lte).toBe(true);
  });
});

describe("logEmailSent", () => {
  it("creates an email log entry with userId and emailType", async () => {
    db.emailLog.create.mockResolvedValue({});

    await logEmailSent("user-1", "newInvoice", "invoice-42");

    expect(db.emailLog.create).toHaveBeenCalledWith({
      data: { userId: "user-1", emailType: "newInvoice", invoiceId: "invoice-42" },
    });
  });

  it("creates an entry without invoiceId when not provided", async () => {
    db.emailLog.create.mockResolvedValue({});

    await logEmailSent("user-1", "contactForm");

    expect(db.emailLog.create).toHaveBeenCalledWith({
      data: { userId: "user-1", emailType: "contactForm", invoiceId: undefined },
    });
  });
});

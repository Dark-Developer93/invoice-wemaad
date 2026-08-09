import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/lib/db", () => ({
  default: {
    recurringInvoice: { findMany: vi.fn(), update: vi.fn(), delete: vi.fn() },
    invoice: { findFirst: vi.fn() },
    notification: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/usage", () => ({
  getUserUsage: vi.fn(),
  logEmailSent: vi.fn(),
  isEmailLimitOk: vi.fn(() => true),
}));

vi.mock("@/lib/email/index", () => ({
  sendEmail: vi.fn(),
}));

vi.mock("@/lib/planConfig", () => ({
  getPlanConfig: vi.fn().mockResolvedValue({ customBranding: false }),
}));

vi.mock("@/lib/env", () => ({
  env: { AUTH_SECRET: "a".repeat(32), NEXT_PUBLIC_APP_URL: "https://example.com" },
}));

vi.mock("@/lib/session", () => ({
  requireUser: vi.fn(),
  getRequiredUserId: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// ── Imports ───────────────────────────────────────────────────────────────────

import prisma from "@/lib/db";
import { getUserUsage } from "@/lib/usage";
import { sendEmail } from "@/lib/email/index";
import {
  processRecurringInvoices,
  toggleRecurringInvoice,
  deleteRecurringInvoice,
} from "../recurringInvoices";
import { getRequiredUserId } from "@/lib/session";

// ── Helpers ───────────────────────────────────────────────────────────────────

const db = prisma as unknown as {
  recurringInvoice: {
    findMany: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  invoice: { findFirst: ReturnType<typeof vi.fn> };
  notification: { create: ReturnType<typeof vi.fn> };
  $transaction: ReturnType<typeof vi.fn>;
};

const mockGetUserUsage = vi.mocked(getUserUsage);
const mockSendEmail = vi.mocked(sendEmail);
const mockGetRequiredUserId = vi.mocked(getRequiredUserId);

const UNLIMITED_USAGE = {
  plan: "BUSINESS" as const,
  invoicesThisMonth: 0,
  emailsThisMonth: 0,
  invoiceLimit: null,
  emailLimit: null,
};

const AT_LIMIT_USAGE = {
  plan: "FREE" as const,
  invoicesThisMonth: 5,
  emailsThisMonth: 0,
  invoiceLimit: 5,
  emailLimit: 20,
};

function makeRecurringInvoice(overrides = {}) {
  return {
    id: "rec-1",
    userId: "user-1",
    isActive: true,
    interval: "MONTHLY" as const,
    startDate: new Date("2026-01-01"),
    endDate: null,
    nextRunAt: new Date("2026-01-01"), // past → due
    invoiceName: "Monthly Retainer",
    total: 10000,
    fromName: "John Doe",
    fromEmail: "john@example.com",
    fromAddress: "123 Main St",
    currency: "USD",
    dueDate: 30,
    invoiceNote: null,
    items: [{ description: "Consulting", quantity: 1, rate: 10000 }],
    clientId: "client-1",
    client: {
      name: "Acme Corp",
      contactPersons: [{ email: "acme@example.com", isPrimary: true }],
    },
    User: { isActive: true },
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  db.notification.create.mockResolvedValue({});
  mockGetRequiredUserId.mockResolvedValue("user-1");
});

// Builds a fake tx client and wires db.$transaction to run the callback
// against it — mirrors the per-invoice locked transaction processRecurringInvoices
// now opens (advisory lock + fresh usage check + fresh invoiceNumber lookup).
function mockTransactionOnce({
  lastInvoiceNumber = 0,
  createdInvoice = { id: "inv-new", invoiceNumber: lastInvoiceNumber + 1 },
}: {
  lastInvoiceNumber?: number;
  createdInvoice?: { id: string; invoiceNumber?: number };
} = {}) {
  const tx = {
    $executeRaw: vi.fn().mockResolvedValue(undefined),
    invoice: {
      findFirst: vi.fn().mockResolvedValue(
        lastInvoiceNumber > 0 ? { invoiceNumber: lastInvoiceNumber } : null
      ),
      create: vi.fn().mockResolvedValue(createdInvoice),
    },
    recurringInvoice: { update: vi.fn().mockResolvedValue({}) },
  };
  db.$transaction.mockImplementationOnce(async (fn: (tx: unknown) => Promise<unknown>) => fn(tx));
  return tx;
}

describe("processRecurringInvoices", () => {
  it("does nothing when no due invoices exist", async () => {
    db.recurringInvoice.findMany.mockResolvedValue([]);

    const result = await processRecurringInvoices();

    expect(db.$transaction).not.toHaveBeenCalled();
    expect(result).toEqual({ processed: 0, skippedAtLimit: 0, failed: 0, errors: [] });
  });

  it("skips invoice when user is at monthly limit (checked fresh inside the lock)", async () => {
    db.recurringInvoice.findMany.mockResolvedValue([makeRecurringInvoice()]);
    mockGetUserUsage.mockResolvedValue(AT_LIMIT_USAGE);
    const tx = mockTransactionOnce();

    const result = await processRecurringInvoices();

    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.$executeRaw).toHaveBeenCalled();
    expect(tx.invoice.create).not.toHaveBeenCalled();
    expect(result.skippedAtLimit).toBe(1);
    expect(result.processed).toBe(0);
  });

  it("creates invoice and advances nextRunAt", async () => {
    const rec = makeRecurringInvoice();
    db.recurringInvoice.findMany.mockResolvedValue([rec]);
    mockGetUserUsage.mockResolvedValue(UNLIMITED_USAGE);
    const tx = mockTransactionOnce({ lastInvoiceNumber: 4 });

    const result = await processRecurringInvoices();

    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.invoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          invoiceNumber: 5, // incremented from 4
          userId: "user-1",
          recurringInvoiceId: "rec-1",
        }),
      })
    );
    expect(result.processed).toBe(1);
  });

  it("marks recurring invoice inactive when endDate is passed", async () => {
    const pastEndDate = new Date("2026-01-01");
    const rec = makeRecurringInvoice({ endDate: pastEndDate });
    db.recurringInvoice.findMany.mockResolvedValue([rec]);
    mockGetUserUsage.mockResolvedValue(UNLIMITED_USAGE);
    const tx = mockTransactionOnce({ lastInvoiceNumber: 1 });

    await processRecurringInvoices();

    expect(tx.recurringInvoice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isActive: false }),
      })
    );
  });

  it("sends email to primary contact after creating invoice", async () => {
    const rec = makeRecurringInvoice();
    db.recurringInvoice.findMany.mockResolvedValue([rec]);
    mockGetUserUsage.mockResolvedValue(UNLIMITED_USAGE);
    mockTransactionOnce({ lastInvoiceNumber: 1 });
    mockSendEmail.mockResolvedValue(undefined);

    await processRecurringInvoices();
    await new Promise((r) => setTimeout(r, 10));

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "acme@example.com",
        templateName: "newInvoice",
      })
    );
  });

  it("continues processing other invoices when one transaction fails", async () => {
    const rec1 = makeRecurringInvoice({ id: "rec-1" });
    const rec2 = makeRecurringInvoice({ id: "rec-2" });
    db.recurringInvoice.findMany.mockResolvedValue([rec1, rec2]);
    mockGetUserUsage.mockResolvedValue(UNLIMITED_USAGE);

    db.$transaction.mockImplementationOnce(async () => {
      throw new Error("DB timeout");
    });
    mockTransactionOnce({ lastInvoiceNumber: 1 });

    // Should not throw even when one invoice fails
    const result = await processRecurringInvoices();
    expect(db.$transaction).toHaveBeenCalledTimes(2);
    expect(result.processed).toBe(1);
    expect(result.failed).toBe(1);
    expect(result.errors[0]).toContain("rec-1");
  });

  it("creates failure notification when email fails", async () => {
    const rec = makeRecurringInvoice();
    db.recurringInvoice.findMany.mockResolvedValue([rec]);
    mockGetUserUsage.mockResolvedValue(UNLIMITED_USAGE);
    mockTransactionOnce({ lastInvoiceNumber: 1 });
    mockSendEmail.mockRejectedValue(new Error("SMTP timeout"));

    await processRecurringInvoices();
    await new Promise((r) => setTimeout(r, 10));

    expect(db.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          title: "Email delivery failed",
        }),
      })
    );
  });
});

describe("toggleRecurringInvoice", () => {
  it("flips isActive from true to false", async () => {
    type RecurringInvoiceDb = {
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
    };
    (prisma as unknown as { recurringInvoice: RecurringInvoiceDb }).recurringInvoice = {
      ...db.recurringInvoice,
      findUnique: vi.fn().mockResolvedValue({ isActive: true }),
      update: vi.fn().mockResolvedValue({}),
    } as unknown as RecurringInvoiceDb;

    const result = await toggleRecurringInvoice("rec-1");
    expect(result).toEqual({ success: true });
  });

  it("returns error when DB throws", async () => {
    (prisma as unknown as { recurringInvoice: { findUnique: ReturnType<typeof vi.fn> } })
      .recurringInvoice.findUnique = vi.fn().mockRejectedValue(new Error("DB error"));

    const result = await toggleRecurringInvoice("rec-1");
    expect(result).toEqual({ error: "Failed to update recurring invoice" });
  });
});

describe("deleteRecurringInvoice", () => {
  it("deletes and returns success", async () => {
    db.recurringInvoice.delete.mockResolvedValue({});
    const result = await deleteRecurringInvoice("rec-1");
    expect(result).toEqual({ success: true });
    expect(db.recurringInvoice.delete).toHaveBeenCalledWith({
      where: { id: "rec-1", userId: "user-1" },
    });
  });

  it("returns error when delete throws", async () => {
    db.recurringInvoice.delete.mockRejectedValue(new Error("Constraint violation"));
    const result = await deleteRecurringInvoice("rec-1");
    expect(result).toEqual({ error: "Failed to delete recurring invoice" });
  });
});

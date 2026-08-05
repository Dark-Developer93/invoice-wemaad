import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/lib/session", () => ({
  requireUser: vi.fn(),
  getRequiredUserId: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: {
    invoice: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    client: { findUnique: vi.fn() },
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

vi.mock("@/lib/env", () => ({
  env: { AUTH_SECRET: "a".repeat(32), NEXT_PUBLIC_APP_URL: "https://example.com" },
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import prisma from "@/lib/db";
import { getRequiredUserId } from "@/lib/session";
import { getUserUsage } from "@/lib/usage";
import { sendEmail } from "@/lib/email/index";
import { createInvoice, deleteInvoice, markAsPaid } from "../invoices";

// ── Helpers ───────────────────────────────────────────────────────────────────

const db = prisma as unknown as {
  invoice: { create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  client: { findUnique: ReturnType<typeof vi.fn> };
  notification: { create: ReturnType<typeof vi.fn> };
  $transaction: ReturnType<typeof vi.fn>;
};

const mockGetRequiredUserId = vi.mocked(getRequiredUserId);
const mockGetUserUsage = vi.mocked(getUserUsage);
const mockSendEmail = vi.mocked(sendEmail);

function makeValidFormData(overrides: Record<string, string> = {}): FormData {
  const fd = new FormData();
  const defaults: Record<string, string> = {
    invoiceName: "Test Invoice",
    total: "100",
    status: "PENDING",
    date: new Date().toISOString(),
    dueDate: "30",
    fromName: "John Doe",
    fromEmail: "john@example.com",
    fromAddress: "123 Main St",
    clientId: "client-1",
    currency: "USD",
    invoiceNumber: "5",
    items: JSON.stringify([{ description: "Consulting", quantity: 1, rate: 100 }]),
    sendEmail: "true",
    ...overrides,
  };
  for (const [key, value] of Object.entries(defaults)) {
    fd.append(key, value);
  }
  return fd;
}

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
  emailsThisMonth: 20,
  invoiceLimit: 5,
  emailLimit: 20,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  mockGetRequiredUserId.mockResolvedValue("user-1");
  db.notification.create.mockResolvedValue({});
  db.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
    fn({ $executeRaw: vi.fn().mockResolvedValue(undefined), invoice: db.invoice })
  );
});

describe("createInvoice", () => {
  it("returns error when monthly invoice limit is reached", async () => {
    mockGetUserUsage.mockResolvedValue(AT_LIMIT_USAGE);

    const result = await createInvoice(null, makeValidFormData());

    expect(result.status).toBe("error");
    expect(Object.values(result.error ?? {}).flat()[0]).toMatch(/limit/i);
    expect(db.invoice.create).not.toHaveBeenCalled();
  });

  it("returns error when form data is invalid", async () => {
    mockGetUserUsage.mockResolvedValue(UNLIMITED_USAGE);

    const fd = new FormData();
    fd.append("invoiceName", ""); // missing required fields

    const result = await createInvoice(null, fd);

    expect(result.status).toBe("error");
    expect(db.invoice.create).not.toHaveBeenCalled();
  });

  it("creates invoice and returns success", async () => {
    mockGetUserUsage.mockResolvedValue(UNLIMITED_USAGE);
    db.invoice.create.mockResolvedValue({ id: "inv-1" });
    db.client.findUnique.mockResolvedValue(null); // no email sent when client not found

    const result = await createInvoice(null, makeValidFormData({ sendEmail: "false" }));

    expect(result.status).toBe("success");
    expect(db.invoice.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: "user-1" }) })
    );
  });

  it("sends email when sendEmail=true and client has primary contact", async () => {
    mockGetUserUsage.mockResolvedValue(UNLIMITED_USAGE);
    db.invoice.create.mockResolvedValue({ id: "inv-1" });
    db.client.findUnique.mockResolvedValue({
      name: "Acme Corp",
      contactPersons: [{ email: "client@acme.com", isPrimary: true }],
    });
    mockSendEmail.mockResolvedValue(undefined);

    await createInvoice(null, makeValidFormData({ sendEmail: "true" }));

    // sendEmail is fire-and-forget — give microtasks a tick to run
    await new Promise((r) => setTimeout(r, 10));

    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "client@acme.com", templateName: "newInvoice" })
    );
  });

  it("does not send email when sendEmail=false", async () => {
    mockGetUserUsage.mockResolvedValue(UNLIMITED_USAGE);
    db.invoice.create.mockResolvedValue({ id: "inv-1" });
    db.client.findUnique.mockResolvedValue({
      name: "Acme Corp",
      contactPersons: [{ email: "client@acme.com", isPrimary: true }],
    });

    await createInvoice(null, makeValidFormData({ sendEmail: "false" }));

    await new Promise((r) => setTimeout(r, 10));
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it("returns error when Prisma create throws", async () => {
    mockGetUserUsage.mockResolvedValue(UNLIMITED_USAGE);
    db.invoice.create.mockRejectedValue(new Error("DB connection lost"));
    db.client.findUnique.mockResolvedValue(null);

    const result = await createInvoice(null, makeValidFormData());

    expect(result.status).toBe("error");
    expect(Object.values(result.error ?? {}).flat()[0]).toMatch(/failed to create/i);
  });

  it("creates failure notification when email sending fails", async () => {
    mockGetUserUsage.mockResolvedValue(UNLIMITED_USAGE);
    db.invoice.create.mockResolvedValue({ id: "inv-1" });
    db.client.findUnique.mockResolvedValue({
      name: "Acme Corp",
      contactPersons: [{ email: "client@acme.com", isPrimary: true }],
    });
    mockSendEmail.mockRejectedValue(new Error("SMTP error"));

    await createInvoice(null, makeValidFormData({ sendEmail: "true" }));
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

describe("deleteInvoice", () => {
  it("deletes invoice and redirects", async () => {
    const { redirect } = await import("next/navigation");
    db.invoice.delete.mockResolvedValue({});

    await deleteInvoice("inv-1");

    expect(db.invoice.delete).toHaveBeenCalledWith({
      where: { userId: "user-1", id: "inv-1" },
    });
    expect(redirect).toHaveBeenCalledWith("/dashboard/invoices");
  });

  it("returns error when delete throws", async () => {
    db.invoice.delete.mockRejectedValue(new Error("Not found"));

    const result = await deleteInvoice("inv-1");

    expect(result).toEqual({ error: "Failed to delete invoice" });
  });
});

describe("markAsPaid", () => {
  it("updates status to PAID and redirects", async () => {
    const { redirect } = await import("next/navigation");
    db.invoice.update.mockResolvedValue({});

    await markAsPaid("inv-1");

    expect(db.invoice.update).toHaveBeenCalledWith({
      where: { userId: "user-1", id: "inv-1" },
      data: { status: "PAID" },
    });
    expect(redirect).toHaveBeenCalledWith("/dashboard/invoices");
  });

  it("returns error when update throws", async () => {
    db.invoice.update.mockRejectedValue(new Error("DB error"));

    const result = await markAsPaid("inv-1");

    expect(result).toEqual({ error: "Failed to update invoice status" });
  });
});

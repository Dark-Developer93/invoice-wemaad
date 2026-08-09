import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  default: {
    cronRun: { create: vi.fn() },
    user: { findMany: vi.fn() },
    notification: { create: vi.fn() },
  },
}));

vi.mock("@/lib/email", () => ({
  sendEmail: vi.fn(),
}));

import prisma from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { recordCronRun, alertAdmins } from "../monitoring";

const db = prisma as unknown as {
  cronRun: { create: ReturnType<typeof vi.fn> };
  user: { findMany: ReturnType<typeof vi.fn> };
  notification: { create: ReturnType<typeof vi.fn> };
};

const mockSendEmail = vi.mocked(sendEmail);

beforeEach(() => {
  vi.clearAllMocks();
  db.cronRun.create.mockResolvedValue({});
  db.notification.create.mockResolvedValue({});
});

describe("recordCronRun", () => {
  it("records SUCCESS when there are no failures and no error", async () => {
    const startedAt = new Date("2026-01-01T00:00:00Z");
    const finishedAt = new Date("2026-01-01T00:00:05Z");

    const status = await recordCronRun({
      jobName: "recurring-invoices",
      startedAt,
      finishedAt,
      processed: 5,
      failed: 0,
    });

    expect(status).toBe("SUCCESS");
    expect(db.cronRun.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        jobName: "recurring-invoices",
        status: "SUCCESS",
        startedAt,
        finishedAt,
        processed: 5,
        failed: 0,
        errorMessage: undefined,
      }),
    });
  });

  it("records PARTIAL_FAILURE when some invoices failed but no top-level error occurred", async () => {
    const status = await recordCronRun({
      jobName: "recurring-invoices",
      startedAt: new Date(),
      finishedAt: new Date(),
      processed: 3,
      failed: 2,
    });

    expect(status).toBe("PARTIAL_FAILURE");
  });

  it("records FAILURE and truncates a very long error message", async () => {
    const longError = "x".repeat(3000);

    const status = await recordCronRun({
      jobName: "recurring-invoices",
      startedAt: new Date(),
      finishedAt: new Date(),
      errorMessage: longError,
    });

    expect(status).toBe("FAILURE");
    const call = db.cronRun.create.mock.calls[0][0];
    expect(call.data.errorMessage).toHaveLength(2000);
  });
});

describe("alertAdmins", () => {
  it("notifies every active admin in-app and by email", async () => {
    db.user.findMany.mockResolvedValue([
      { id: "admin-1", email: "admin1@example.com" },
      { id: "admin-2", email: "admin2@example.com" },
    ]);
    mockSendEmail.mockResolvedValue(undefined);

    await alertAdmins({ title: "Job failed", message: "Something broke", href: "/admin/monitoring" });

    expect(db.user.findMany).toHaveBeenCalledWith({
      where: { isAdmin: true, isActive: true },
      select: { id: true, email: true },
    });
    expect(db.notification.create).toHaveBeenCalledTimes(2);
    expect(db.notification.create).toHaveBeenCalledWith({
      data: {
        userId: "admin-1",
        title: "Job failed",
        message: "Something broke",
        href: "/admin/monitoring",
      },
    });
    expect(mockSendEmail).toHaveBeenCalledTimes(2);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "admin1@example.com",
        templateName: "systemAlert",
        variables: { title: "Job failed", message: "Something broke", href: "/admin/monitoring" },
      })
    );
  });

  it("does not throw when one admin's email send fails", async () => {
    db.user.findMany.mockResolvedValue([{ id: "admin-1", email: "admin1@example.com" }]);
    mockSendEmail.mockRejectedValue(new Error("SMTP down"));

    await expect(alertAdmins({ title: "t", message: "m" })).resolves.toBeUndefined();
    expect(db.notification.create).toHaveBeenCalledTimes(1);
  });

  it("does nothing (no throw) when there are no admins", async () => {
    db.user.findMany.mockResolvedValue([]);

    await expect(alertAdmins({ title: "t", message: "m" })).resolves.toBeUndefined();
    expect(db.notification.create).not.toHaveBeenCalled();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });
});

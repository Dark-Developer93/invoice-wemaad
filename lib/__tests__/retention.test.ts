import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  default: {
    emailLog: { deleteMany: vi.fn() },
    notification: { deleteMany: vi.fn() },
    cronRun: { deleteMany: vi.fn() },
  },
}));

import prisma from "@/lib/db";
import { pruneOldRecords, RETENTION_DAYS } from "../retention";

const db = prisma as unknown as {
  emailLog: { deleteMany: ReturnType<typeof vi.fn> };
  notification: { deleteMany: ReturnType<typeof vi.fn> };
  cronRun: { deleteMany: ReturnType<typeof vi.fn> };
};

beforeEach(() => {
  vi.clearAllMocks();
  db.emailLog.deleteMany.mockResolvedValue({ count: 0 });
  db.notification.deleteMany.mockResolvedValue({ count: 0 });
  db.cronRun.deleteMany.mockResolvedValue({ count: 0 });
});

describe("pruneOldRecords", () => {
  it("deletes email logs older than the retention window", async () => {
    db.emailLog.deleteMany.mockResolvedValue({ count: 7 });

    const result = await pruneOldRecords();

    expect(result.emailLogsDeleted).toBe(7);
    const call = db.emailLog.deleteMany.mock.calls[0][0];
    const cutoff: Date = call.where.sentAt.lt;
    const expectedCutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
    expect(Math.abs(cutoff.getTime() - expectedCutoff)).toBeLessThan(5000);
  });

  it("only deletes read notifications older than the retention window", async () => {
    db.notification.deleteMany.mockResolvedValue({ count: 3 });

    await pruneOldRecords();

    expect(db.notification.deleteMany).toHaveBeenCalledWith({
      where: {
        createdAt: { lt: expect.any(Date) },
        readAt: { not: null },
      },
    });
  });

  it("deletes cron run history older than the retention window", async () => {
    db.cronRun.deleteMany.mockResolvedValue({ count: 12 });

    const result = await pruneOldRecords();

    expect(result.cronRunsDeleted).toBe(12);
    expect(db.cronRun.deleteMany).toHaveBeenCalledWith({
      where: { startedAt: { lt: expect.any(Date) } },
    });
  });

  it("returns combined counts for all three models", async () => {
    db.emailLog.deleteMany.mockResolvedValue({ count: 1 });
    db.notification.deleteMany.mockResolvedValue({ count: 2 });
    db.cronRun.deleteMany.mockResolvedValue({ count: 3 });

    const result = await pruneOldRecords();

    expect(result).toEqual({
      emailLogsDeleted: 1,
      notificationsDeleted: 2,
      cronRunsDeleted: 3,
    });
  });
});

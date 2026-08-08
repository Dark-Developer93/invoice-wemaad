import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/lib/session", () => ({
  requireUser: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: {
    user: { findUnique: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: vi.fn((fn: unknown) => fn),
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import prisma from "@/lib/db";
import { requireUser } from "@/lib/session";
import { requestPlanUpgrade } from "../billing";

// ── Helpers ───────────────────────────────────────────────────────────────────

const db = prisma as unknown as {
  user: { findUnique: ReturnType<typeof vi.fn> };
  $transaction: ReturnType<typeof vi.fn>;
};

const mockRequireUser = vi.mocked(requireUser);

// Mirrors the per-user locked transaction requestPlanUpgrade opens (advisory
// lock + supersede-old-pending + create-new-pending, all inside one tx).
function mockTransactionOnce() {
  const tx = {
    $executeRaw: vi.fn().mockResolvedValue(undefined),
    planUpgradeRequest: {
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      create: vi.fn().mockResolvedValue({ id: "req-new" }),
    },
  };
  db.$transaction.mockImplementationOnce(async (fn: (tx: unknown) => Promise<unknown>) => fn(tx));
  return tx;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireUser.mockResolvedValue({
    user: { id: "user-1", isActive: true, isAdmin: false },
  } as unknown as Awaited<ReturnType<typeof requireUser>>);
});

describe("requestPlanUpgrade", () => {
  it("creates a PENDING request inside a locked transaction", async () => {
    db.user.findUnique.mockResolvedValue({ plan: "FREE" });
    const tx = mockTransactionOnce();

    const result = await requestPlanUpgrade("STARTER");

    expect(result).toEqual({ status: "success" });
    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.$executeRaw).toHaveBeenCalled();
    expect(tx.planUpgradeRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          requestedPlan: "STARTER",
          status: "PENDING",
        }),
      })
    );
  });

  it("supersedes an existing PENDING request before creating the new one, in the same transaction", async () => {
    db.user.findUnique.mockResolvedValue({ plan: "FREE" });
    const tx = mockTransactionOnce();

    await requestPlanUpgrade("PRO");

    expect(tx.planUpgradeRequest.updateMany).toHaveBeenCalledWith({
      where: { userId: "user-1", status: "PENDING" },
      data: { status: "REJECTED", adminNote: "Superseded by a new request" },
    });
    // Both writes happened inside the same $transaction call — not as two
    // separate top-level prisma calls that could interleave with another
    // concurrent request for the same user.
    expect(db.$transaction).toHaveBeenCalledTimes(1);
  });

  it("rejects a request for the user's current plan without opening a transaction", async () => {
    db.user.findUnique.mockResolvedValue({ plan: "PRO" });

    const result = await requestPlanUpgrade("PRO");

    expect(result).toEqual({
      status: "error",
      message: "You are already on this plan.",
    });
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("returns an error when the user record is missing", async () => {
    db.user.findUnique.mockResolvedValue(null);

    const result = await requestPlanUpgrade("STARTER");

    expect(result).toEqual({ status: "error", message: "User not found" });
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it("returns a generic error and does not throw when the transaction fails", async () => {
    db.user.findUnique.mockResolvedValue({ plan: "FREE" });
    db.$transaction.mockRejectedValueOnce(new Error("DB timeout"));

    const result = await requestPlanUpgrade("STARTER");

    expect(result).toEqual({
      status: "error",
      message: "Failed to submit upgrade request. Please try again.",
    });
  });
});

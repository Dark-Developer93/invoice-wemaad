import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/lib/session", () => ({
  requireUser: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: {
    user: { findUniqueOrThrow: vi.fn() },
    client: { count: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/planConfig", () => ({
  getPlanConfig: vi.fn(),
}));

vi.mock("@/lib/env", () => ({
  env: { AUTH_SECRET: "a".repeat(32), NEXT_PUBLIC_APP_URL: "https://example.com" },
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import prisma from "@/lib/db";
import { requireUser } from "@/lib/session";
import { getPlanConfig } from "@/lib/planConfig";
import { createClient } from "../clients";

// ── Helpers ───────────────────────────────────────────────────────────────────

const db = prisma as unknown as {
  user: { findUniqueOrThrow: ReturnType<typeof vi.fn> };
  client: { count: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
  $transaction: ReturnType<typeof vi.fn>;
};

const mockRequireUser = vi.mocked(requireUser);
const mockGetPlanConfig = vi.mocked(getPlanConfig);

function makeValidFormData(): FormData {
  const fd = new FormData();
  fd.append("name", "Acme Corp");
  fd.append(
    "addresses",
    JSON.stringify([
      { type: "BILLING", street: "1 Main St", city: "Testville", country: "US", zipCode: "00000", isDefault: true },
    ])
  );
  fd.append(
    "contactPersons",
    JSON.stringify([
      { firstName: "Jane", lastName: "Doe", email: "jane@acme.test", isPrimary: true },
    ])
  );
  fd.append("customFields", JSON.stringify([]));
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockRequireUser.mockResolvedValue({ user: { id: "user-1" } } as never);
  db.user.findUniqueOrThrow.mockResolvedValue({ plan: "FREE" });
  db.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
    fn({
      $executeRaw: vi.fn().mockResolvedValue(undefined),
      user: db.user,
      client: db.client,
    })
  );
});

describe("createClient", () => {
  it("creates the client when under the plan's client limit", async () => {
    mockGetPlanConfig.mockResolvedValue({ clientLimit: 3 } as never);
    db.client.count.mockResolvedValue(2);
    db.client.create.mockResolvedValue({ id: "client-1" });

    const result = await createClient(null, makeValidFormData());

    expect(result.status).toBe("success");
    expect(db.client.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: "user-1", name: "Acme Corp" }) })
    );
  });

  it("returns an error and does not create when at the plan's client limit", async () => {
    mockGetPlanConfig.mockResolvedValue({ clientLimit: 3 } as never);
    db.client.count.mockResolvedValue(3);

    const result = await createClient(null, makeValidFormData());

    expect(result.status).toBe("error");
    expect(Object.values(result.error ?? {}).flat()[0]).toMatch(/limit/i);
    expect(db.client.create).not.toHaveBeenCalled();
  });

  it("does not count-check when the plan has no client limit (null = unlimited)", async () => {
    mockGetPlanConfig.mockResolvedValue({ clientLimit: null } as never);
    db.client.create.mockResolvedValue({ id: "client-1" });

    const result = await createClient(null, makeValidFormData());

    expect(result.status).toBe("success");
    expect(db.client.count).not.toHaveBeenCalled();
    expect(db.client.create).toHaveBeenCalled();
  });
});

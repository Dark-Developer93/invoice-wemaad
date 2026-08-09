import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  default: {
    planConfig: { findMany: vi.fn() },
  },
}));

vi.mock("next/cache", () => ({
  // Bypass caching in tests so each call reflects the current mock data.
  unstable_cache: (fn: () => unknown) => fn,
}));

import prisma from "@/lib/db";
import { getPlanConfigs, getPlanConfig } from "../planConfig";

const db = prisma as unknown as {
  planConfig: { findMany: ReturnType<typeof vi.fn> };
};

beforeEach(() => {
  vi.clearAllMocks();
});

const ROW_FREE = {
  plan: "FREE",
  price: 0,
  invoiceLimit: 5,
  emailLimit: 20,
  clientLimit: 3,
  recurringInvoices: false,
  analyticsLevel: "NONE",
  brandingLevel: "SHOWN",
  teamCollaboration: false,
  apiAccessLevel: "NONE",
  multiUser: false,
  customIntegrations: false,
  supportLevel: "STANDARD",
  slaGuarantee: false,
  description: "Perfect for freelancers",
  popular: false,
};

const ROW_STARTER = {
  plan: "STARTER",
  price: 15, // deliberately different from DEFAULT_PLAN_CONFIG to prove the DB value wins
  invoiceLimit: 25,
  emailLimit: 50,
  clientLimit: 15,
  recurringInvoices: true,
  analyticsLevel: "BASIC",
  brandingLevel: "SHOWN",
  teamCollaboration: false,
  apiAccessLevel: "NONE",
  multiUser: false,
  customIntegrations: false,
  supportLevel: "PRIORITY",
  slaGuarantee: false,
  description: "Great for growing businesses",
  popular: false,
};

describe("getPlanConfigs", () => {
  it("maps DB rows onto their plan", async () => {
    db.planConfig.findMany.mockResolvedValue([ROW_FREE, ROW_STARTER]);

    const configs = await getPlanConfigs();

    expect(configs.STARTER.price).toBe(15);
    expect(configs.FREE.invoiceLimit).toBe(5);
  });

  it("falls back to DEFAULT_PLAN_CONFIG for a plan with no row", async () => {
    db.planConfig.findMany.mockResolvedValue([ROW_FREE]);

    const configs = await getPlanConfigs();

    // BUSINESS has no row in this mock, but every plan is still present.
    expect(configs.BUSINESS).toBeDefined();
    expect(configs.BUSINESS.invoiceLimit).toBeNull();
    expect(configs.BUSINESS.supportLevel).toBe("DEDICATED");
  });

  it("maps marketing copy fields (description, supportLevel, popular)", async () => {
    db.planConfig.findMany.mockResolvedValue([ROW_STARTER]);

    const configs = await getPlanConfigs();

    expect(configs.STARTER.description).toBe("Great for growing businesses");
    expect(configs.STARTER.supportLevel).toBe("PRIORITY");
    expect(configs.STARTER.popular).toBe(false);
  });
});

describe("getPlanConfig", () => {
  it("returns a single plan's config", async () => {
    db.planConfig.findMany.mockResolvedValue([ROW_STARTER]);

    const config = await getPlanConfig("STARTER");

    expect(config.price).toBe(15);
    expect(config.recurringInvoices).toBe(true);
  });
});

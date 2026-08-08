import { describe, it, expect } from "vitest";
import { DEFAULT_PLAN_CONFIG, PLAN_ORDER, type PlanType } from "../plans";

const ALL_PLANS: PlanType[] = ["FREE", "STARTER", "PRO", "BUSINESS"];

describe("DEFAULT_PLAN_CONFIG limits", () => {
  it("defines limits for every plan", () => {
    for (const plan of ALL_PLANS) {
      expect(DEFAULT_PLAN_CONFIG[plan]).toBeDefined();
      expect(DEFAULT_PLAN_CONFIG[plan]).toHaveProperty("invoiceLimit");
      expect(DEFAULT_PLAN_CONFIG[plan]).toHaveProperty("emailLimit");
    }
  });

  it("FREE plan has the tightest limits", () => {
    expect(DEFAULT_PLAN_CONFIG.FREE.invoiceLimit).toBe(5);
    expect(DEFAULT_PLAN_CONFIG.FREE.emailLimit).toBe(20);
  });

  it("limits increase as the plan upgrades", () => {
    const tiers: PlanType[] = ["FREE", "STARTER", "PRO"];
    for (let i = 0; i < tiers.length - 1; i++) {
      const lower = DEFAULT_PLAN_CONFIG[tiers[i]].invoiceLimit!;
      const higher = DEFAULT_PLAN_CONFIG[tiers[i + 1]].invoiceLimit!;
      expect(higher).toBeGreaterThan(lower);
    }
  });

  it("BUSINESS plan has no limits (unlimited)", () => {
    expect(DEFAULT_PLAN_CONFIG.BUSINESS.invoiceLimit).toBeNull();
    expect(DEFAULT_PLAN_CONFIG.BUSINESS.emailLimit).toBeNull();
  });
});

describe("DEFAULT_PLAN_CONFIG features", () => {
  it("defines features for every plan", () => {
    for (const plan of ALL_PLANS) {
      const f = DEFAULT_PLAN_CONFIG[plan];
      expect(typeof f.analytics).toBe("boolean");
      expect(typeof f.customBranding).toBe("boolean");
      expect(typeof f.teamCollaboration).toBe("boolean");
      expect(typeof f.apiAccess).toBe("boolean");
      expect(typeof f.multiUser).toBe("boolean");
    }
  });

  it("FREE plan has no premium features", () => {
    const f = DEFAULT_PLAN_CONFIG.FREE;
    expect(f.analytics).toBe(false);
    expect(f.customBranding).toBe(false);
    expect(f.teamCollaboration).toBe(false);
    expect(f.apiAccess).toBe(false);
    expect(f.multiUser).toBe(false);
  });

  it("analytics unlocks at STARTER and stays on for higher plans", () => {
    expect(DEFAULT_PLAN_CONFIG.FREE.analytics).toBe(false);
    expect(DEFAULT_PLAN_CONFIG.STARTER.analytics).toBe(true);
    expect(DEFAULT_PLAN_CONFIG.PRO.analytics).toBe(true);
    expect(DEFAULT_PLAN_CONFIG.BUSINESS.analytics).toBe(true);
  });

  it("multiUser is exclusive to BUSINESS", () => {
    expect(DEFAULT_PLAN_CONFIG.FREE.multiUser).toBe(false);
    expect(DEFAULT_PLAN_CONFIG.STARTER.multiUser).toBe(false);
    expect(DEFAULT_PLAN_CONFIG.PRO.multiUser).toBe(false);
    expect(DEFAULT_PLAN_CONFIG.BUSINESS.multiUser).toBe(true);
  });

  it("BUSINESS plan has every boolean feature enabled", () => {
    const f = DEFAULT_PLAN_CONFIG.BUSINESS;
    expect(f.recurringInvoices).toBe(true);
    expect(f.analytics).toBe(true);
    expect(f.customBranding).toBe(true);
    expect(f.teamCollaboration).toBe(true);
    expect(f.apiAccess).toBe(true);
    expect(f.multiUser).toBe(true);
  });
});

describe("PLAN_ORDER", () => {
  it("starts with FREE and ends with BUSINESS", () => {
    expect(PLAN_ORDER[0]).toBe("FREE");
    expect(PLAN_ORDER[PLAN_ORDER.length - 1]).toBe("BUSINESS");
  });

  it("contains every plan exactly once", () => {
    expect(PLAN_ORDER).toHaveLength(ALL_PLANS.length);
    for (const plan of ALL_PLANS) {
      expect(PLAN_ORDER).toContain(plan);
    }
  });
});

describe("DEFAULT_PLAN_CONFIG price", () => {
  it("FREE plan costs nothing", () => {
    expect(DEFAULT_PLAN_CONFIG.FREE.price).toBe(0);
  });

  it("BUSINESS plan has no fixed price (custom/enterprise)", () => {
    expect(DEFAULT_PLAN_CONFIG.BUSINESS.price).toBeNull();
  });

  it("paid plan prices increase with tier", () => {
    expect(DEFAULT_PLAN_CONFIG.STARTER.price!).toBeGreaterThan(DEFAULT_PLAN_CONFIG.FREE.price!);
    expect(DEFAULT_PLAN_CONFIG.PRO.price!).toBeGreaterThan(DEFAULT_PLAN_CONFIG.STARTER.price!);
  });
});

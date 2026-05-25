import { describe, it, expect } from "vitest";
import {
  PLAN_LIMITS,
  PLAN_FEATURES,
  PLAN_PRICE,
  PLAN_ORDER,
  type PlanType,
} from "../plans";

const ALL_PLANS: PlanType[] = ["FREE", "STARTER", "PRO", "BUSINESS"];

describe("PLAN_LIMITS", () => {
  it("defines limits for every plan", () => {
    for (const plan of ALL_PLANS) {
      expect(PLAN_LIMITS[plan]).toBeDefined();
      expect(PLAN_LIMITS[plan]).toHaveProperty("invoices");
      expect(PLAN_LIMITS[plan]).toHaveProperty("emails");
    }
  });

  it("FREE plan has the tightest limits", () => {
    expect(PLAN_LIMITS.FREE.invoices).toBe(5);
    expect(PLAN_LIMITS.FREE.emails).toBe(20);
  });

  it("limits increase as the plan upgrades", () => {
    const tiers: PlanType[] = ["FREE", "STARTER", "PRO"];
    for (let i = 0; i < tiers.length - 1; i++) {
      const lower = PLAN_LIMITS[tiers[i]].invoices!;
      const higher = PLAN_LIMITS[tiers[i + 1]].invoices!;
      expect(higher).toBeGreaterThan(lower);
    }
  });

  it("BUSINESS plan has no limits (unlimited)", () => {
    expect(PLAN_LIMITS.BUSINESS.invoices).toBeNull();
    expect(PLAN_LIMITS.BUSINESS.emails).toBeNull();
  });
});

describe("PLAN_FEATURES", () => {
  it("defines features for every plan", () => {
    for (const plan of ALL_PLANS) {
      const f = PLAN_FEATURES[plan];
      expect(typeof f.analytics).toBe("boolean");
      expect(typeof f.customBranding).toBe("boolean");
      expect(typeof f.teamCollaboration).toBe("boolean");
      expect(typeof f.apiAccess).toBe("boolean");
      expect(typeof f.multiUser).toBe("boolean");
    }
  });

  it("FREE plan has no premium features", () => {
    const f = PLAN_FEATURES.FREE;
    expect(f.analytics).toBe(false);
    expect(f.customBranding).toBe(false);
    expect(f.teamCollaboration).toBe(false);
    expect(f.apiAccess).toBe(false);
    expect(f.multiUser).toBe(false);
  });

  it("analytics unlocks at STARTER and stays on for higher plans", () => {
    expect(PLAN_FEATURES.FREE.analytics).toBe(false);
    expect(PLAN_FEATURES.STARTER.analytics).toBe(true);
    expect(PLAN_FEATURES.PRO.analytics).toBe(true);
    expect(PLAN_FEATURES.BUSINESS.analytics).toBe(true);
  });

  it("multiUser is exclusive to BUSINESS", () => {
    expect(PLAN_FEATURES.FREE.multiUser).toBe(false);
    expect(PLAN_FEATURES.STARTER.multiUser).toBe(false);
    expect(PLAN_FEATURES.PRO.multiUser).toBe(false);
    expect(PLAN_FEATURES.BUSINESS.multiUser).toBe(true);
  });

  it("BUSINESS plan has every feature enabled", () => {
    const f = PLAN_FEATURES.BUSINESS;
    for (const value of Object.values(f)) {
      expect(value).toBe(true);
    }
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

describe("PLAN_PRICE", () => {
  it("FREE plan costs nothing", () => {
    expect(PLAN_PRICE.FREE).toBe(0);
  });

  it("BUSINESS plan has no fixed price (custom/enterprise)", () => {
    expect(PLAN_PRICE.BUSINESS).toBeNull();
  });

  it("paid plan prices increase with tier", () => {
    expect(PLAN_PRICE.STARTER!).toBeGreaterThan(PLAN_PRICE.FREE!);
    expect(PLAN_PRICE.PRO!).toBeGreaterThan(PLAN_PRICE.STARTER!);
  });
});

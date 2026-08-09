import { describe, it, expect } from "vitest";
import { DEFAULT_PLAN_CONFIG, PLAN_NAMES, PLAN_ORDER } from "@/lib/plans";
import {
  type MarketingPlanData,
  getCardFeatures,
  getDynamicFeatures,
  COMPARE_ROWS,
} from "../pricingFeatures";

// Real production data (same values PLAN_ORDER.map(...) in app/page.tsx
// spreads into the cards) rather than hand-rolled fixtures, so these
// tests fail the moment lib/plans.ts and pricingFeatures.ts disagree —
// not just when a synthetic test fixture happens to.
const plans: MarketingPlanData[] = PLAN_ORDER.map((plan) => ({
  plan,
  title: PLAN_NAMES[plan],
  ...DEFAULT_PLAN_CONFIG[plan],
}));

const [free, starter, pro, business] = plans;

describe("getDynamicFeatures", () => {
  it("FREE (lowest tier) has nothing to diff against", () => {
    expect(getDynamicFeatures(free, undefined)).toEqual([]);
  });

  it("STARTER lists what it adds over FREE", () => {
    const features = getDynamicFeatures(starter, free);
    expect(features).toContain("Recurring invoices");
    expect(features).toContain("Basic reports");
    expect(features).toContain("Priority support");
    // Nothing branding/API/team/multi-user-related unlocks at Starter.
    expect(features).not.toContain("Minimal branding");
    expect(features).not.toContain("Team collaboration");
  });

  it("PRO lists what it adds over STARTER, not what STARTER already had", () => {
    const features = getDynamicFeatures(pro, starter);
    expect(features).toContain("Advanced reports");
    expect(features).toContain("Minimal branding");
    expect(features).toContain("Basic API access");
    expect(features).toContain("Team collaboration");
    // Starter already unlocked these — Pro shouldn't repeat them.
    expect(features).not.toContain("Recurring invoices");
    expect(features).not.toContain("Priority support");
  });

  it("BUSINESS lists what it adds over PRO, not what PRO already had", () => {
    const features = getDynamicFeatures(business, pro);
    expect(features).toContain("Fully white-labeled");
    expect(features).toContain("Advanced API access");
    expect(features).toContain("Multi-user access");
    expect(features).toContain("Dedicated support");
    expect(features).toContain("Custom integrations");
    expect(features).toContain("SLA guarantee");
    // Pro already unlocked these — Business shouldn't repeat them.
    expect(features).not.toContain("Advanced reports");
    expect(features).not.toContain("Team collaboration");
    expect(features).not.toContain("Basic API access");
  });
});

describe("getCardFeatures", () => {
  it("FREE's card lists baseline features directly (no lower plan to lean on)", () => {
    const features = getCardFeatures(free, undefined);
    expect(features).toContain("Client management");
    expect(features).toContain("Basic invoice templates");
    expect(features.some((f) => f.startsWith("Everything in"))).toBe(false);
  });

  it("every plan above the lowest leads with \"Everything in [lower plan]\"", () => {
    for (let i = 1; i < plans.length; i++) {
      const features = getCardFeatures(plans[i], plans[i - 1]);
      const everythingIndex = features.indexOf(`Everything in ${plans[i - 1].title}`);
      expect(everythingIndex).toBeGreaterThanOrEqual(0);
      // It leads — nothing before it except the invoice/email/client lines.
      expect(everythingIndex).toBeLessThanOrEqual(2);
      // And baseline features aren't repeated once "Everything in X" covers them.
      expect(features).not.toContain("Client management");
    }
  });
});

// The invariant the user actually asked about: whenever a Compare Plans
// row's value changes between a plan and the one directly below it, the
// card must say so too — and this table is intentionally a *separate*
// hand-written mapping from getDynamicFeatures' own internals, so it
// catches real divergence between the two instead of just mirroring the
// same logic back at itself (which is exactly the bug class reported:
// a PlanConfig toggle updated the table but not the card's stale text).
const ROW_TO_CARD_TEXT: Record<string, (value: string | boolean) => string | null> = {
  "Recurring invoices": (v) => (v === true ? "Recurring invoices" : null),
  "Reports & analytics": (v) =>
    v === "Basic" ? "Basic reports" : v === "Advanced" ? "Advanced reports" : null,
  "Our branding on your invoices": (v) =>
    v === "Minimal" ? "Minimal branding" : v === "Removed" ? "Fully white-labeled" : null,
  "Team collaboration": (v) => (v === true ? "Team collaboration" : null),
  "API access": (v) => (v === "Basic" ? "Basic API access" : v === "Advanced" ? "Advanced API access" : null),
  "Multi-user access": (v) => (v === true ? "Multi-user access" : null),
  Support: (v) => (v === "Priority" ? "Priority support" : v === "Dedicated" ? "Dedicated support" : null),
  "Custom integrations": (v) => (v === true ? "Custom integrations" : null),
  "SLA guarantee": (v) => (v === true ? "SLA guarantee" : null),
};

describe("cards and the Compare Plans table stay aligned", () => {
  it("every table row that changes between adjacent plans has a matching card line", () => {
    for (let i = 1; i < plans.length; i++) {
      const prev = plans[i - 1];
      const curr = plans[i];
      const cardFeatures = getDynamicFeatures(curr, prev);

      for (const row of COMPARE_ROWS) {
        const mapper = ROW_TO_CARD_TEXT[row.label];
        if (!mapper) continue; // limits/baseline rows aren't part of the per-tier diff

        const prevValue = row.value(prev);
        const currValue = row.value(curr);
        if (currValue === prevValue) continue;

        const expectedCardText = mapper(currValue);
        if (expectedCardText) {
          expect(
            cardFeatures,
            `${curr.title}'s card should mention "${expectedCardText}" because the table's ` +
              `"${row.label}" row changed from "${prevValue}" to "${currValue}"`
          ).toContain(expectedCardText);
        }
      }
    }
  });

  it("every dynamic card line is backed by an actual table-row change", () => {
    for (let i = 1; i < plans.length; i++) {
      const prev = plans[i - 1];
      const curr = plans[i];
      const cardFeatures = getDynamicFeatures(curr, prev);

      const allPossibleCardTexts = new Set(
        COMPARE_ROWS.flatMap((row) => {
          const mapper = ROW_TO_CARD_TEXT[row.label];
          if (!mapper) return [];
          const prevValue = row.value(prev);
          const currValue = row.value(curr);
          if (currValue === prevValue) return [];
          const text = mapper(currValue);
          return text ? [text] : [];
        })
      );

      for (const cardText of cardFeatures) {
        expect(
          allPossibleCardTexts.has(cardText),
          `${curr.title}'s card mentions "${cardText}" but no Compare Plans row changed to justify it`
        ).toBe(true);
      }
    }
  });
});

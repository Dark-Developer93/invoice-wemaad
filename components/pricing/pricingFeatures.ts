// Pure data/logic behind the pricing cards and the Compare Plans table —
// deliberately kept free of React/JSX so it can be unit tested without a
// DOM, and so both surfaces (cards + table) provably read the same data
// instead of drifting apart the way they did before (see git history:
// card copy used to be typed-in text independent of the live flags).

export interface MarketingPlanData {
  plan: string;
  title: string;
  price: number | null; // monthly; null = custom pricing
  description: string;
  popular: boolean;
  invoiceLimit: number | null;
  emailLimit: number | null;
  clientLimit: number | null;
  recurringInvoices: boolean;
  analyticsLevel: "NONE" | "BASIC" | "ADVANCED";
  brandingLevel: "SHOWN" | "MINIMAL" | "HIDDEN";
  teamCollaboration: boolean;
  apiAccessLevel: "NONE" | "BASIC" | "ADVANCED";
  multiUser: boolean;
  customIntegrations: boolean;
  supportLevel: "STANDARD" | "PRIORITY" | "DEDICATED";
  slaGuarantee: boolean;
}

export const ANALYTICS_LABEL: Record<MarketingPlanData["analyticsLevel"], string> = {
  NONE: "—",
  BASIC: "Basic",
  ADVANCED: "Advanced",
};

export const BRANDING_LABEL: Record<MarketingPlanData["brandingLevel"], string> = {
  SHOWN: "Shown",
  MINIMAL: "Minimal",
  HIDDEN: "Removed",
};

export const API_ACCESS_LABEL: Record<MarketingPlanData["apiAccessLevel"], string> = {
  NONE: "—",
  BASIC: "Basic",
  ADVANCED: "Advanced",
};

export const SUPPORT_LABEL: Record<MarketingPlanData["supportLevel"], string> = {
  STANDARD: "Standard",
  PRIORITY: "Priority",
  DEDICATED: "Dedicated",
};

// Ascending order for diffing a plan's tier against the one below it —
// each array's index doubles as its "how much better" rank.
const ANALYTICS_ORDER: MarketingPlanData["analyticsLevel"][] = ["NONE", "BASIC", "ADVANCED"];
const BRANDING_ORDER: MarketingPlanData["brandingLevel"][] = ["SHOWN", "MINIMAL", "HIDDEN"];
const API_ACCESS_ORDER: MarketingPlanData["apiAccessLevel"][] = ["NONE", "BASIC", "ADVANCED"];
const SUPPORT_ORDER: MarketingPlanData["supportLevel"][] = ["STANDARD", "PRIORITY", "DEDICATED"];

// Only the features a plan adds on top of the one directly below it in
// PLAN_ORDER, in short/scannable form — the full explanation (e.g. what
// "Minimal branding" means) lives in the Compare Plans table, not
// repeated on every card. The lowest plan (no `previous`) gets nothing
// here, since it has nothing to diff against and no "Everything in..."
// line to lead with.
export function getDynamicFeatures(
  plan: MarketingPlanData,
  previous: MarketingPlanData | undefined
): string[] {
  const features: string[] = [];

  if (plan.recurringInvoices && !previous?.recurringInvoices) {
    features.push("Recurring invoices");
  }

  const analyticsRank = ANALYTICS_ORDER.indexOf(plan.analyticsLevel);
  const prevAnalyticsRank = previous ? ANALYTICS_ORDER.indexOf(previous.analyticsLevel) : -1;
  if (analyticsRank > prevAnalyticsRank) {
    if (plan.analyticsLevel === "BASIC") features.push("Basic reports");
    if (plan.analyticsLevel === "ADVANCED") features.push("Advanced reports");
  }

  const brandingRank = BRANDING_ORDER.indexOf(plan.brandingLevel);
  const prevBrandingRank = previous ? BRANDING_ORDER.indexOf(previous.brandingLevel) : -1;
  if (brandingRank > prevBrandingRank) {
    if (plan.brandingLevel === "MINIMAL") features.push("Minimal branding");
    if (plan.brandingLevel === "HIDDEN") features.push("Fully white-labeled");
  }

  const apiRank = API_ACCESS_ORDER.indexOf(plan.apiAccessLevel);
  const prevApiRank = previous ? API_ACCESS_ORDER.indexOf(previous.apiAccessLevel) : -1;
  if (apiRank > prevApiRank) {
    if (plan.apiAccessLevel === "BASIC") features.push("Basic API access");
    if (plan.apiAccessLevel === "ADVANCED") features.push("Advanced API access");
  }

  if (plan.teamCollaboration && !previous?.teamCollaboration) features.push("Team collaboration");
  if (plan.multiUser && !previous?.multiUser) features.push("Multi-user access");

  const supportRank = SUPPORT_ORDER.indexOf(plan.supportLevel);
  const prevSupportRank = previous ? SUPPORT_ORDER.indexOf(previous.supportLevel) : -1;
  if (supportRank > prevSupportRank) {
    if (plan.supportLevel === "PRIORITY") features.push("Priority support");
    if (plan.supportLevel === "DEDICATED") features.push("Dedicated support");
  }

  if (plan.customIntegrations && !previous?.customIntegrations) features.push("Custom integrations");
  if (plan.slaGuarantee && !previous?.slaGuarantee) features.push("SLA guarantee");

  return features;
}

// Rows that don't vary by plan — included with every tier, so they don't
// need a PlanConfig field of their own. Shown on every plan's Compare
// Plans row, and on the lowest-tier card only (higher cards imply them
// via "Everything in [lower plan]" instead of repeating them).
export const BASELINE_FEATURES = [
  "Client management",
  "PDF generation & secure sharing",
  "Automated invoice emails",
  "Basic invoice templates",
];

export function getEverythingInLine(previousPlan: MarketingPlanData | undefined): string | null {
  return previousPlan ? `Everything in ${previousPlan.title}` : null;
}

// The exact bullet list a pricing card renders — shared by PricingSection
// and by tests, so a test can assert against the real card content
// instead of a hand-copied reimplementation of it.
export function getCardFeatures(
  plan: MarketingPlanData,
  previousPlan: MarketingPlanData | undefined
): string[] {
  const everythingInLine = getEverythingInLine(previousPlan);
  const dynamicFeatures = getDynamicFeatures(plan, previousPlan);

  return [
    `${plan.invoiceLimit ?? "Unlimited"} invoices & ${plan.emailLimit ?? "unlimited"} emails / month`,
    `${plan.clientLimit ?? "Unlimited"} clients`,
    // The lowest plan has no "Everything in..." line to lean on, so it
    // lists the always-included baseline features directly.
    ...(everythingInLine ? [everythingInLine] : BASELINE_FEATURES),
    ...dynamicFeatures,
  ];
}

export interface CompareRow {
  label: string;
  value: (plan: MarketingPlanData) => string | boolean;
}

export const COMPARE_ROWS: CompareRow[] = [
  { label: "Monthly invoices", value: (p) => p.invoiceLimit?.toString() ?? "Unlimited" },
  { label: "Monthly emails", value: (p) => p.emailLimit?.toString() ?? "Unlimited" },
  { label: "Clients", value: (p) => p.clientLimit?.toString() ?? "Unlimited" },
  ...BASELINE_FEATURES.map((label): CompareRow => ({ label, value: () => true })),
  { label: "Recurring invoices", value: (p) => p.recurringInvoices },
  { label: "Reports & analytics", value: (p) => ANALYTICS_LABEL[p.analyticsLevel] },
  { label: "Our branding on your invoices", value: (p) => BRANDING_LABEL[p.brandingLevel] },
  { label: "Team collaboration", value: (p) => p.teamCollaboration },
  { label: "API access", value: (p) => API_ACCESS_LABEL[p.apiAccessLevel] },
  { label: "Multi-user access", value: (p) => p.multiUser },
  { label: "Support", value: (p) => SUPPORT_LABEL[p.supportLevel] },
  { label: "Custom integrations", value: (p) => p.customIntegrations },
  { label: "SLA guarantee", value: (p) => p.slaGuarantee },
];

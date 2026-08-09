export type PlanType = "FREE" | "STARTER" | "PRO" | "BUSINESS";

export const PLAN_ORDER: PlanType[] = ["FREE", "STARTER", "PRO", "BUSINESS"];

export const PLAN_NAMES: Record<PlanType, string> = {
  FREE: "Free",
  STARTER: "Starter",
  PRO: "Pro",
  BUSINESS: "Business",
};

export type AnalyticsLevel = "NONE" | "BASIC" | "ADVANCED";
export type BrandingLevel = "SHOWN" | "MINIMAL" | "HIDDEN";
export type ApiAccessLevel = "NONE" | "BASIC" | "ADVANCED";
export type SupportLevel = "STANDARD" | "PRIORITY" | "DEDICATED";

export interface PlanConfigData {
  price: number | null;
  invoiceLimit: number | null;
  emailLimit: number | null;
  clientLimit: number | null;
  recurringInvoices: boolean;
  analyticsLevel: AnalyticsLevel;
  brandingLevel: BrandingLevel;
  teamCollaboration: boolean;
  apiAccessLevel: ApiAccessLevel;
  multiUser: boolean;
  customIntegrations: boolean;
  supportLevel: SupportLevel;
  slaGuarantee: boolean;
  // Public marketing copy — see the PlanConfig model comment in
  // schema.prisma for why this is separate from the fields above.
  description: string;
  popular: boolean;
}

// Values a plan falls back to if its PlanConfig row is ever missing (should
// only happen before the seed migration runs, or if a row is deleted
// directly in the DB outside the admin UI). The admin-editable source of
// truth is the PlanConfig table — see lib/planConfig.ts.
export const DEFAULT_PLAN_CONFIG: Record<PlanType, PlanConfigData> = {
  FREE: {
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
    description: "Perfect for freelancers just starting out",
    popular: false,
  },
  STARTER: {
    price: 9,
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
  },
  PRO: {
    price: 29,
    invoiceLimit: 100,
    emailLimit: 500,
    clientLimit: 50,
    recurringInvoices: true,
    analyticsLevel: "ADVANCED",
    brandingLevel: "MINIMAL",
    teamCollaboration: true,
    apiAccessLevel: "BASIC",
    multiUser: false,
    customIntegrations: false,
    supportLevel: "PRIORITY",
    slaGuarantee: false,
    description: "For established businesses",
    popular: true,
  },
  BUSINESS: {
    price: null,
    invoiceLimit: null,
    emailLimit: null,
    clientLimit: null,
    recurringInvoices: true,
    analyticsLevel: "ADVANCED",
    brandingLevel: "HIDDEN",
    teamCollaboration: true,
    apiAccessLevel: "ADVANCED",
    multiUser: true,
    customIntegrations: true,
    supportLevel: "DEDICATED",
    slaGuarantee: true,
    description: "For large organizations",
    popular: false,
  },
};

export type PlanType = "FREE" | "STARTER" | "PRO" | "BUSINESS";

export const PLAN_ORDER: PlanType[] = ["FREE", "STARTER", "PRO", "BUSINESS"];

export const PLAN_NAMES: Record<PlanType, string> = {
  FREE: "Free",
  STARTER: "Starter",
  PRO: "Pro",
  BUSINESS: "Business",
};

export interface PlanConfigData {
  price: number | null;
  invoiceLimit: number | null;
  emailLimit: number | null;
  recurringInvoices: boolean;
  analytics: boolean;
  customBranding: boolean;
  teamCollaboration: boolean;
  apiAccess: boolean;
  multiUser: boolean;
  // Public marketing copy — see the PlanConfig model comment in
  // schema.prisma for why these are separate from the fields above.
  description: string;
  extraFeatures: string[];
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
    recurringInvoices: false,
    analytics: false,
    customBranding: false,
    teamCollaboration: false,
    apiAccess: false,
    multiUser: false,
    description: "Perfect for freelancers just starting out",
    extraFeatures: [
      "Client management",
      "PDF generation & secure sharing",
      "Automated invoice emails",
      "Basic invoice templates",
    ],
    popular: false,
  },
  STARTER: {
    price: 9,
    invoiceLimit: 25,
    emailLimit: 50,
    recurringInvoices: true,
    analytics: true,
    customBranding: false,
    teamCollaboration: false,
    apiAccess: false,
    multiUser: false,
    description: "Great for growing businesses",
    extraFeatures: [
      "Everything in Free",
      "Recurring invoices automation",
      "Financial reports & analytics",
      "Priority email support",
    ],
    popular: false,
  },
  PRO: {
    price: 29,
    invoiceLimit: 100,
    emailLimit: 500,
    recurringInvoices: true,
    analytics: true,
    customBranding: true,
    teamCollaboration: true,
    apiAccess: true,
    multiUser: false,
    description: "For established businesses",
    extraFeatures: [
      "Everything in Starter",
      "Advanced analytics",
      "Custom branding",
      "Team collaboration",
      "Basic API access",
      "Priority support",
    ],
    popular: true,
  },
  BUSINESS: {
    price: null,
    invoiceLimit: null,
    emailLimit: null,
    recurringInvoices: true,
    analytics: true,
    customBranding: true,
    teamCollaboration: true,
    apiAccess: true,
    multiUser: true,
    description: "For large organizations",
    extraFeatures: [
      "Everything in Pro",
      "Multi-user access",
      "Advanced API access",
      "Full custom branding",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
    ],
    popular: false,
  },
};

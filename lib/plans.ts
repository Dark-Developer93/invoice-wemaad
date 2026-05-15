export type PlanType = "FREE" | "STARTER" | "PRO" | "BUSINESS";

export const PLAN_LIMITS: Record<PlanType, { invoices: number | null; emails: number | null }> = {
  FREE:     { invoices: 5,    emails: 20   },
  STARTER:  { invoices: 25,   emails: 50   },
  PRO:      { invoices: 100,  emails: 500  },
  BUSINESS: { invoices: null, emails: null },
};

export const PLAN_FEATURES: Record<
  PlanType,
  {
    analytics: boolean;
    customBranding: boolean;
    teamCollaboration: boolean;
    apiAccess: boolean;
    multiUser: boolean;
  }
> = {
  FREE:     { analytics: false, customBranding: false, teamCollaboration: false, apiAccess: false, multiUser: false },
  STARTER:  { analytics: true,  customBranding: false, teamCollaboration: false, apiAccess: false, multiUser: false },
  PRO:      { analytics: true,  customBranding: true,  teamCollaboration: true,  apiAccess: true,  multiUser: false },
  BUSINESS: { analytics: true,  customBranding: true,  teamCollaboration: true,  apiAccess: true,  multiUser: true  },
};

export const PLAN_PRICE: Record<PlanType, number | null> = {
  FREE:     0,
  STARTER:  9,
  PRO:      29,
  BUSINESS: null,
};

export const PLAN_ORDER: PlanType[] = ["FREE", "STARTER", "PRO", "BUSINESS"];

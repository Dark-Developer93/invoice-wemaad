import { unstable_cache } from "next/cache";
import prisma from "@/lib/db";
import { cacheTags } from "@/lib/cache";
import { DEFAULT_PLAN_CONFIG, PLAN_ORDER, PlanConfigData, PlanType } from "@/lib/plans";

// Cached until invalidated by revalidateTag(cacheTags.planConfig) in
// adminUpdatePlanConfig — no time-based staleness. This is read on every
// invoice/email limit check (lib/usage.ts) and every billing page load, so
// it's worth caching even though PlanConfig rows change rarely.
async function fetchPlanConfigs(): Promise<Record<PlanType, PlanConfigData>> {
  const rows = await prisma.planConfig.findMany();
  const byPlan = new Map(rows.map((row) => [row.plan, row]));

  const result = {} as Record<PlanType, PlanConfigData>;
  for (const plan of PLAN_ORDER) {
    const row = byPlan.get(plan);
    result[plan] = row
      ? {
          price: row.price,
          invoiceLimit: row.invoiceLimit,
          emailLimit: row.emailLimit,
          clientLimit: row.clientLimit,
          recurringInvoices: row.recurringInvoices,
          analyticsLevel: row.analyticsLevel,
          brandingLevel: row.brandingLevel,
          teamCollaboration: row.teamCollaboration,
          apiAccessLevel: row.apiAccessLevel,
          multiUser: row.multiUser,
          customIntegrations: row.customIntegrations,
          supportLevel: row.supportLevel,
          slaGuarantee: row.slaGuarantee,
          description: row.description,
          popular: row.popular,
        }
      : DEFAULT_PLAN_CONFIG[plan];
  }
  return result;
}

export async function getPlanConfigs(): Promise<Record<PlanType, PlanConfigData>> {
  return unstable_cache(fetchPlanConfigs, ["plan-configs"], {
    tags: [cacheTags.planConfig],
  })();
}

export async function getPlanConfig(plan: PlanType): Promise<PlanConfigData> {
  const configs = await getPlanConfigs();
  return configs[plan];
}

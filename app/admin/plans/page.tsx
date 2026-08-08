import type { Metadata } from "next";

import { adminGetPlanConfigs } from "@/app/actions/admin";
import { PLAN_ORDER, PLAN_NAMES } from "@/lib/plans";
import { AdminPlanConfigForm } from "./AdminPlanConfigForm";

export const metadata: Metadata = {
  title: "Admin – Plans",
  description: "Edit pricing, usage limits, and features for each plan tier.",
  robots: { index: false, follow: false },
};

export default async function AdminPlansPage() {
  const configs = await adminGetPlanConfigs();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pricing Plans</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Changes here take effect immediately — for every user&apos;s usage-limit
          enforcement and for the billing page. The public marketing pricing
          section on the homepage is separate static content and isn&apos;t
          affected by this page.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PLAN_ORDER.map((plan) => (
          <AdminPlanConfigForm
            key={plan}
            plan={plan}
            name={PLAN_NAMES[plan]}
            config={configs[plan]}
          />
        ))}
      </div>
    </div>
  );
}

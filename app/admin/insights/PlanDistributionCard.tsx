import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLAN_NAMES } from "@/lib/plans";
import type { PlanType } from "@/lib/plans";

interface PlanDistributionEntry {
  plan: PlanType;
  count: number;
  price: number | null;
}

export function PlanDistributionCard({
  data,
  totalUsers,
}: {
  data: PlanDistributionEntry[];
  totalUsers: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Distribution</CardTitle>
        <CardDescription>How users are spread across plan tiers.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map(({ plan, count, price }) => {
          const pct = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
          return (
            <div key={plan} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{PLAN_NAMES[plan]}</span>
                  <Badge variant="outline" className="text-xs">
                    {price !== null ? `$${price}/mo` : "Custom"}
                  </Badge>
                </div>
                <span className="text-muted-foreground">
                  {count} user{count === 1 ? "" : "s"} ({pct}%)
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Activity } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminGetRecentCronRuns } from "@/app/actions/admin";
import { AdminMonitoringSkeleton } from "./_skeleton";

export const metadata: Metadata = {
  title: "Admin – Monitoring",
  description: "Scheduled job run history and health.",
  robots: { index: false, follow: false },
};

const STATUS_BADGE: Record<string, { variant: "default" | "destructive" | "secondary"; label: string }> = {
  SUCCESS: { variant: "default", label: "Success" },
  PARTIAL_FAILURE: { variant: "secondary", label: "Partial failure" },
  FAILURE: { variant: "destructive", label: "Failure" },
};

function formatDuration(startedAt: Date, finishedAt: Date): string {
  const ms = finishedAt.getTime() - startedAt.getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

async function AdminMonitoringContent() {
  const runs = await adminGetRecentCronRuns();

  const lastRun = runs[0];
  const failuresLast7Days = runs.filter(
    (r) =>
      r.status !== "SUCCESS" &&
      r.startedAt.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Last Run</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {lastRun ? (
              <div className="flex items-center gap-2">
                <Badge variant={STATUS_BADGE[lastRun.status]?.variant ?? "secondary"}>
                  {STATUS_BADGE[lastRun.status]?.label ?? lastRun.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {lastRun.startedAt.toLocaleString()}
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No runs recorded yet.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Failures (7 days)</CardTitle>
            {failuresLast7Days > 0 ? (
              <AlertTriangle className="size-4 text-destructive" />
            ) : (
              <CheckCircle2 className="size-4 text-green-600" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={
                failuresLast7Days > 0
                  ? "text-2xl font-bold text-destructive"
                  : "text-2xl font-bold text-green-600"
              }
            >
              {failuresLast7Days}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recorded Runs</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runs.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cron Run History</CardTitle>
          <CardDescription>
            Most recent {runs.length} executions of scheduled jobs. Failures also trigger an
            in-app notification and email to all admins.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {runs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No cron runs recorded yet — this fills in after the daily job runs at least once.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-left">
                    <th className="pb-3 pr-4 font-medium">Job</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Started</th>
                    <th className="pb-3 pr-4 font-medium hidden sm:table-cell">Duration</th>
                    <th className="pb-3 pr-4 font-medium hidden md:table-cell">Processed</th>
                    <th className="pb-3 pr-4 font-medium hidden md:table-cell">Failed</th>
                    <th className="pb-3 font-medium hidden lg:table-cell">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {runs.map((run) => (
                    <tr key={run.id}>
                      <td className="py-3 pr-4">{run.jobName}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={STATUS_BADGE[run.status]?.variant ?? "secondary"}>
                          {STATUS_BADGE[run.status]?.label ?? run.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        {run.startedAt.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 hidden sm:table-cell">
                        {formatDuration(run.startedAt, run.finishedAt)}
                      </td>
                      <td className="py-3 pr-4 hidden md:table-cell">{run.processed}</td>
                      <td className="py-3 pr-4 hidden md:table-cell">{run.failed}</td>
                      <td className="py-3 hidden lg:table-cell max-w-xs truncate text-muted-foreground">
                        {run.errorMessage ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <XCircle className="size-4 text-muted-foreground" />
            Not covered here
          </CardTitle>
          <CardDescription>
            This page tracks scheduled-job outcomes only. It is not a substitute for
            application error tracking (e.g. Sentry) or external uptime monitoring — point a
            service like UptimeRobot or BetterStack at{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">/api/health</code> for uptime
            alerts independent of this dashboard.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function AdminMonitoringPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Monitoring</h1>
        <p className="text-muted-foreground">Scheduled job run history and health.</p>
      </div>
      <Suspense fallback={<AdminMonitoringSkeleton />}>
        <AdminMonitoringContent />
      </Suspense>
    </div>
  );
}

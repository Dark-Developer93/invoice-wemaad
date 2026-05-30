"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  adminApproveUpgradeRequest,
  adminRejectUpgradeRequest,
} from "@/app/actions/admin";

type UpgradeRequest = {
  id: string;
  requestedPlan: string;
  status: string;
  createdAt: Date;
  adminNote?: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-600 border-yellow-600",
  APPROVED: "text-green-600 border-green-600",
  REJECTED: "text-destructive border-destructive",
};

export function AdminUpgradeRequests({
  upgradeRequests,
}: {
  upgradeRequests: UpgradeRequest[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (upgradeRequests.length === 0) return null;

  const pendingCount = upgradeRequests.filter((r) => r.status === "PENDING").length;

  function handleApprove(requestId: string) {
    startTransition(async () => {
      try {
        await adminApproveUpgradeRequest(requestId);
        toast.success("Upgrade request approved. Plan updated.");
        router.refresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to approve request.";
        toast.error(message);
      }
    });
  }

  function handleReject(requestId: string) {
    startTransition(async () => {
      try {
        await adminRejectUpgradeRequest(requestId);
        toast.success("Upgrade request rejected.");
        router.refresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to reject request.";
        toast.error(message);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Plan Upgrade Requests
          {pendingCount > 0 && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              {pendingCount} pending
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Review and act on this user&apos;s plan upgrade requests.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {upgradeRequests.map((req) => (
          <div
            key={req.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">
                  Requested: <span className="font-bold">{req.requestedPlan}</span>
                </span>
                <Badge
                  variant="outline"
                  className={`text-xs ${STATUS_COLORS[req.status] ?? ""}`}
                >
                  {req.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(req.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
              {req.adminNote && (
                <p className="text-xs text-muted-foreground italic">{req.adminNote}</p>
              )}
            </div>

            {req.status === "PENDING" && (
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={() => handleApprove(req.id)}
                  disabled={isPending}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(req.id)}
                  disabled={isPending}
                >
                  Reject
                </Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

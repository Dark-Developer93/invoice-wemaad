"use client";

import { useState, useTransition } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  adminUpdateUserPlan,
  adminToggleUserActive,
  adminDeleteUser,
  adminApproveUpgradeRequest,
  adminRejectUpgradeRequest,
} from "@/app/actions/admin";

type User = {
  id: string;
  plan: "FREE" | "STARTER" | "PRO" | "BUSINESS";
  isAdmin: boolean;
  isActive: boolean;
};

type UpgradeRequest = {
  id: string;
  requestedPlan: string;
  status: string;
  createdAt: Date;
  adminNote?: string | null;
};

const PLAN_OPTIONS = ["FREE", "STARTER", "PRO", "BUSINESS"] as const;

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-600 border-yellow-600",
  APPROVED: "text-green-600 border-green-600",
  REJECTED: "text-destructive border-destructive",
};

export function AdminUserActions({
  user,
  upgradeRequests = [],
}: {
  user: User;
  upgradeRequests?: UpgradeRequest[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedPlan, setSelectedPlan] = useState<string>(user.plan);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  function handlePlanUpdate() {
    startTransition(async () => {
      try {
        await adminUpdateUserPlan(user.id, selectedPlan as User["plan"]);
        toast.success(`Plan updated to ${selectedPlan}`);
        router.refresh();
      } catch {
        toast.error("Failed to update plan.");
      }
    });
  }

  function handleToggleActive() {
    startTransition(async () => {
      try {
        await adminToggleUserActive(user.id, !user.isActive);
        toast.success(user.isActive ? "Account deactivated." : "Account activated.");
        router.refresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update status.";
        toast.error(message);
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await adminDeleteUser(user.id);
        toast.success("User deleted.");
        setDeleteDialogOpen(false);
        router.push("/admin/users");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to delete user.";
        toast.error(message);
      }
    });
  }

  function handleApproveRequest(requestId: string) {
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

  function handleRejectRequest(requestId: string) {
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

  const pendingRequests = upgradeRequests.filter((r) => r.status === "PENDING");

  return (
    <div className="flex flex-col gap-6">
      {/* Upgrade Requests */}
      {upgradeRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Plan Upgrade Requests
              {pendingRequests.length > 0 && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                  {pendingRequests.length} pending
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
                      className={`text-xs ${STATUS_COLORS[req.status] || ""}`}
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
                      onClick={() => handleApproveRequest(req.id)}
                      disabled={isPending}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectRequest(req.id)}
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
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Plan Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plan Management</CardTitle>
            <CardDescription>
              Change the user&apos;s subscription plan manually.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Current plan:</span>
              <Badge>{user.plan}</Badge>
            </div>
            <div className="flex gap-2">
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAN_OPTIONS.map((plan) => (
                    <SelectItem key={plan} value={plan}>
                      {plan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handlePlanUpdate}
                disabled={isPending || selectedPlan === user.plan}
              >
                Update Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Status</CardTitle>
            <CardDescription>
              Activate or deactivate this user&apos;s account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              {user.isActive ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Active
                </Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </div>

            {user.isAdmin ? (
              <p className="text-sm text-muted-foreground">
                Admin accounts cannot be deactivated.
              </p>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant={user.isActive ? "destructive" : "default"}
                  onClick={handleToggleActive}
                  disabled={isPending}
                >
                  {user.isActive ? "Deactivate Account" : "Activate Account"}
                </Button>

                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" disabled={isPending}>
                      Delete User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete User Account</DialogTitle>
                      <DialogDescription>
                        This will permanently delete this user and all their data
                        (invoices, clients, recurring invoices, email logs). This
                        action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isPending}
                      >
                        Delete Permanently
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

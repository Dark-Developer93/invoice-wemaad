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
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  adminUpdateUserPlan,
  adminToggleUserActive,
  adminDeleteUser,
  adminToggleUserAdmin,
  adminApproveUpgradeRequest,
  adminRejectUpgradeRequest,
} from "@/app/actions/admin";

type User = {
  id: string;
  plan: "FREE" | "STARTER" | "PRO" | "BUSINESS";
  isAdmin: boolean;
  isActive: boolean;
};

type Props = {
  user: User;
  upgradeRequests?: UpgradeRequest[];
  currentUserId?: string;
};

type UpgradeRequest = {
  id: string;
  requestedPlan: string;
  status: string;
  createdAt: Date;
  adminNote?: string | null;
};

type ConfirmConfig = {
  title: string;
  description: string;
  confirmLabel: string;
  variant: "default" | "destructive";
  onConfirm: () => void;
} | null;

const PLAN_OPTIONS = ["FREE", "STARTER", "PRO", "BUSINESS"] as const;

const STATUS_COLORS: Record<string, string> = {
  PENDING: "text-yellow-600 border-yellow-600",
  APPROVED: "text-green-600 border-green-600",
  REJECTED: "text-destructive border-destructive",
};

export function AdminUserActions({
  user,
  upgradeRequests = [],
  currentUserId,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedPlan, setSelectedPlan] = useState<string>(user.plan);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig>(null);

  function handleToggleAdmin() {
    startTransition(async () => {
      try {
        await adminToggleUserAdmin(user.id, !user.isAdmin);
        toast.success(user.isAdmin ? "Admin privileges removed." : "User promoted to admin.");
        router.refresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update admin status.";
        toast.error(message);
      }
    });
  }

  function handlePlanUpdate() {
    startTransition(async () => {
      try {
        await adminUpdateUserPlan(user.id, selectedPlan as User["plan"]);
        toast.success(`Plan updated to ${selectedPlan}`);
        router.refresh();
      } catch (err: unknown) {
        console.error("Failed to update plan:", err);
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
                  onClick={() =>
                    user.isActive
                      ? setConfirmConfig({
                          title: "Deactivate Account",
                          description:
                            "This will deactivate the user's account and pause all their recurring invoices. They will not be able to log in until reactivated.",
                          confirmLabel: "Deactivate",
                          variant: "destructive",
                          onConfirm: handleToggleActive,
                        })
                      : handleToggleActive()
                  }
                  disabled={isPending}
                >
                  {user.isActive ? "Deactivate Account" : "Activate Account"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    setConfirmConfig({
                      title: "Delete User Account",
                      description:
                        "This will permanently delete this user and all their data (invoices, clients, recurring invoices, email logs). This action cannot be undone.",
                      confirmLabel: "Delete Permanently",
                      variant: "destructive",
                      onConfirm: handleDelete,
                    })
                  }
                  disabled={isPending}
                >
                  Delete User
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Admin Access */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Admin Access</CardTitle>
          <CardDescription>
            Grant or revoke admin privileges for this user.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Role:</span>
            <Badge variant={user.isAdmin ? "default" : "secondary"}>
              {user.isAdmin ? "Admin" : "User"}
            </Badge>
          </div>
          {currentUserId === user.id ? (
            <p className="text-sm text-muted-foreground">
              You cannot modify your own admin privileges.
            </p>
          ) : (
            <Button
              variant={user.isAdmin ? "destructive" : "default"}
              onClick={() =>
                setConfirmConfig(
                  user.isAdmin
                    ? {
                        title: "Remove Admin Privileges",
                        description:
                          "This user will lose all admin access and be reverted to a regular user.",
                        confirmLabel: "Remove Privileges",
                        variant: "destructive",
                        onConfirm: handleToggleAdmin,
                      }
                    : {
                        title: "Promote to Admin",
                        description:
                          "This user will gain full admin access to the platform, including user management and billing controls.",
                        confirmLabel: "Promote",
                        variant: "default",
                        onConfirm: handleToggleAdmin,
                      }
                )
              }
              disabled={isPending}
            >
              {user.isAdmin ? "Remove Admin Privileges" : "Promote to Admin"}
            </Button>
          )}
        </CardContent>
      </Card>

      {confirmConfig && (
        <ConfirmDialog
          open={!!confirmConfig}
          onOpenChange={(open) => !open && setConfirmConfig(null)}
          title={confirmConfig.title}
          description={confirmConfig.description}
          confirmLabel={confirmConfig.confirmLabel}
          variant={confirmConfig.variant}
          onConfirm={confirmConfig.onConfirm}
        />
      )}
    </div>
  );
}

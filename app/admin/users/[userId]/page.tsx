import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  FileText,
  Users,
  RefreshCw,
  Send,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminGetUser, adminGetUserUpgradeRequests } from "@/app/actions/admin";
import { requireAdmin } from "@/lib/session";
import { getUserUsage } from "@/lib/usage";
import { AdminUserActions } from "./AdminUserActions";
import { AdminUpgradeRequests } from "./AdminUpgradeRequests";

function UsageBar({
  icon: Icon,
  label,
  used,
  limit,
  activeColor,
}: {
  icon: LucideIcon;
  label: string;
  used: number;
  limit: number | null;
  activeColor: string;
}) {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : null;
  const overLimit = pct !== null && pct >= 100;
  const nearLimit = pct !== null && pct >= 80;
  const textColor = overLimit ? "text-red-600" : nearLimit ? "text-yellow-600" : "text-muted-foreground";
  const barColor = overLimit ? "bg-red-500" : nearLimit ? "bg-yellow-500" : activeColor;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5">
          <Icon className="size-3.5" /> {label}
        </span>
        <span className={`font-medium tabular-nums ${textColor}`}>
          {used}{limit !== null ? ` / ${limit}` : " / ∞"}
          {pct !== null && <span className="ml-1.5 text-xs">({pct}%)</span>}
        </span>
      </div>
      {pct !== null ? (
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Unlimited</p>
      )}
    </div>
  );
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const [session, user, upgradeRequests, usage] = await Promise.all([
    requireAdmin(),
    adminGetUser(userId),
    adminGetUserUpgradeRequests(userId),
    getUserUsage(userId),
  ]);

  if (!user) notFound();

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href="/admin/users">
            <ArrowLeft className="size-4 mr-1" />
            Back
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
            {user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.email}
          </h1>
          <p className="text-muted-foreground text-sm truncate">{user.email}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {user.isAdmin && (
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              Admin
            </Badge>
          )}
          {user.isActive ? (
            <Badge variant="outline" className="text-green-600 border-green-600">
              Active
            </Badge>
          ) : (
            <Badge variant="destructive">Inactive</Badge>
          )}
        </div>
      </div>

      {/* Two-column on desktop, single column on mobile */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_320px] lg:items-start">
        {/* Left column — info */}
        <div className="flex flex-col gap-6">
          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <span>{user.email}</span>
              </div>
              {user.address && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4 shrink-0" />
                  <span>{user.address}</span>
                </div>
              )}
              {user.companyName && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="size-4 shrink-0" />
                  <span>{user.companyName}</span>
                </div>
              )}
              {user.companyEmail && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Mail className="size-4 mt-0.5 shrink-0" />
                  <span>{user.companyEmail}</span>
                </div>
              )}
              <div className="pt-2 border-t text-xs text-muted-foreground">
                Joined{" "}
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Usage Stats</CardTitle>
              <CardDescription>All-time totals and this month&apos;s plan usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex flex-col items-center justify-center rounded-lg bg-muted/50 p-4">
                  <FileText className="size-6 text-blue-600 mb-1" />
                  <span className="text-2xl font-bold">{user._count.invoices}</span>
                  <span className="text-xs text-muted-foreground">Invoices</span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg bg-muted/50 p-4">
                  <Users className="size-6 text-green-600 mb-1" />
                  <span className="text-2xl font-bold">{user._count.clients}</span>
                  <span className="text-xs text-muted-foreground">Clients</span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg bg-muted/50 p-4">
                  <RefreshCw className="size-6 text-purple-600 mb-1" />
                  <span className="text-2xl font-bold">{user._count.recurringInvoices}</span>
                  <span className="text-xs text-muted-foreground">Recurring</span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg bg-muted/50 p-4">
                  <Send className="size-6 text-orange-600 mb-1" />
                  <span className="text-2xl font-bold">{user._count.emailLogs}</span>
                  <span className="text-xs text-muted-foreground">Emails Sent</span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  This Month&apos;s Plan Usage
                </p>
                <UsageBar
                  icon={FileText}
                  label="Invoices"
                  used={usage.invoicesThisMonth}
                  limit={usage.invoiceLimit}
                  activeColor="bg-blue-500"
                />
                <UsageBar
                  icon={Send}
                  label="Emails"
                  used={usage.emailsThisMonth}
                  limit={usage.emailLimit}
                  activeColor="bg-orange-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Requests */}
          <AdminUpgradeRequests upgradeRequests={upgradeRequests} />
        </div>

        {/* Right sidebar — actions (sticky on desktop) */}
        <div className="lg:sticky lg:top-6">
          <AdminUserActions
            user={user}
            currentUserId={session.user!.id!}
          />
        </div>
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Mail, MapPin, FileText, Users, RefreshCw, Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminGetUser } from "@/app/actions/admin";
import { AdminUserActions } from "./AdminUserActions";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const user = await adminGetUser(userId);

  if (!user) notFound();

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/users">
            <ArrowLeft className="size-4 mr-1" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.email}
          </h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4" />
              <span>{user.email}</span>
            </div>
            {user.address && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4" />
                <span>{user.address}</span>
              </div>
            )}
            {user.companyName && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="size-4" />
                <span>{user.companyName}</span>
              </div>
            )}
            {user.companyEmail && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <Mail className="size-4 mt-0.5" />
                <span>{user.companyEmail}</span>
              </div>
            )}
            <div className="pt-2 border-t text-xs text-muted-foreground">
              Joined {new Date(user.createdAt).toLocaleDateString("en-US", {
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
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
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
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <AdminUserActions user={user} />
    </div>
  );
}

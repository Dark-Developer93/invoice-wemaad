import { formatCurrency } from "@/lib/formatCurrency";
import { Currency } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import prisma from "@/lib/db";

export async function getRecentInvoices(userId: string) {
  return prisma.invoice.findMany({
    where: {
      userId,
    },
    include: {
      client: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
  });
}

interface RecentInvoicesProps {
  data: Array<{
    id: string;
    total: number;
    currency: string;
    status: string;
    client: {
      name: string | null;
      email: string | null;
    } | null;
  }>;
}

export default function RecentInvoices({
  data: invoices,
}: RecentInvoicesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Invoices</CardTitle>
        <CardDescription>
          You have {invoices.length} total invoices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {invoices.map((item) => (
            <div key={item.id} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  {item.client?.name?.slice(0, 2) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {item.client?.name || "—"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.client?.email || "—"}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm font-medium leading-none">
                  {formatCurrency({
                    amount: item.total,
                    currency: item.currency as Currency,
                  })}
                </p>
                <Badge
                  variant={item.status === "PAID" ? "outline" : "secondary"}
                  className="mt-1"
                >
                  {item.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentInvoicesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-[140px]" />
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        {Array.from({ length: 7 }).map((_, i) => (
          <div className="flex items-center gap-4" key={i}>
            <Skeleton className="hidden sm:flex size-9 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-3 w-[150px]" />
            </div>
            <Skeleton className="h-4 w-[80px] ml-auto" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export { RecentInvoicesSkeleton };

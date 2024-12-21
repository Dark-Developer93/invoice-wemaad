import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/session";
import { formatCurrency } from "@/lib/formatCurrency";
import { Currency } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

async function getData(userId: string) {
  const data = await prisma.invoice.findMany({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      clientName: true,
      clientEmail: true,
      total: true,
      currency: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 7,
  });

  return data;
}

export async function RecentInvoices() {
  const session = await requireUser();
  const data = await getData(session.user?.id as string);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Invoices</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        {data.map((item) => (
          <div className="flex items-center gap-4" key={item.id}>
            <Avatar className="hidden sm:flex size-9">
              <AvatarFallback>{item.clientName.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium leadin-none">
                {item.clientName}
              </p>
              <p className="text-sm text-muted-foreground">
                {item.clientEmail}
              </p>
            </div>
            <div className="ml-auto font-medium">
              +
              {formatCurrency({
                amount: item.total,
                currency: item.currency as Currency,
              })}
            </div>
          </div>
        ))}
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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Graph } from "@/components/graph/Graph";
import prisma from "@/lib/db";
import { subDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export async function getInvoiceData(userId: string) {
  const rawData = await prisma.invoice.findMany({
    where: {
      status: "PAID",
      userId: userId,
      createdAt: {
        lte: new Date(),
        gte: subDays(new Date(), 30),
      },
    },
    select: {
      createdAt: true,
      total: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Group and aggregate data by date
  const aggregatedData = rawData.reduce(
    (acc: { [key: number]: number }, curr) => {
      const timestamp = new Date(curr.createdAt).getTime();
      acc[timestamp] = (acc[timestamp] || 0) + curr.total;
      return acc;
    },
    {}
  );

  // Convert to array format and sort by date
  return Object.entries(aggregatedData)
    .map(([date, amount]) => ({
      date: Number(date),
      amount,
    }))
    .sort((a, b) => a.date - b.date);
}

interface InvoiceGraphProps {
  data: Array<{
    date: number;
    amount: number;
  }>;
}

export function InvoiceGraph({ data }: InvoiceGraphProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Paid Invoices</CardTitle>
        <CardDescription>
          Invoices which have been paid in the last 30 days.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Graph data={data} />
      </CardContent>
    </Card>
  );
}

function InvoiceGraphSkeleton() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <Skeleton className="h-6 w-[140px] mb-2" />
        <Skeleton className="h-4 w-[250px]" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[350px] w-full" />
      </CardContent>
    </Card>
  );
}

export { InvoiceGraphSkeleton };

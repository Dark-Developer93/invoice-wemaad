import { NextResponse } from "next/server";
import { subDays } from "date-fns";
import { unstable_cache } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { cacheTags } from "@/lib/cache";

const CHART_RANGE_DEFAULT = 30;
const CHART_RANGE_MIN = 1;
const CHART_RANGE_MAX = 365;

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = Math.min(
    Math.max(parseInt(searchParams.get("range") ?? String(CHART_RANGE_DEFAULT), 10), CHART_RANGE_MIN),
    CHART_RANGE_MAX
  );
  const statusParam = searchParams.get("status") ?? "PAID";

  type InvoiceStatus = "PAID" | "PENDING";
  const validStatuses: InvoiceStatus[] = ["PAID", "PENDING"];
  const statusFilter: InvoiceStatus | undefined = validStatuses.includes(statusParam as InvoiceStatus)
    ? (statusParam as InvoiceStatus)
    : undefined;

  try {
    const userId = session.user.id;
    // The query window is relative to "now", so the cache key includes
    // today's date (UTC) as a coarse bucket — the window rolls forward once
    // per day even with no invoice changes, while any actual mutation still
    // invalidates it immediately within the same day via the invoices tag.
    const dayBucket = new Date().toISOString().slice(0, 10);

    const getChartData = unstable_cache(
      async () => {
        const rawData = await prisma.invoice.findMany({
          where: {
            userId,
            ...(statusFilter ? { status: statusFilter } : {}),
            createdAt: {
              gte: subDays(new Date(), range),
              lte: new Date(),
            },
          },
          select: { createdAt: true, total: true },
          orderBy: { createdAt: "asc" },
        });

        const aggregated = rawData.reduce((acc: Record<number, number>, curr) => {
          const timestamp = new Date(curr.createdAt).setHours(0, 0, 0, 0);
          acc[timestamp] = (acc[timestamp] ?? 0) + Number(curr.total);
          return acc;
        }, {});

        return Object.entries(aggregated)
          .map(([date, amount]) => ({ date: Number(date), amount }))
          .sort((a, b) => a.date - b.date);
      },
      ["chart-data", userId, String(range), statusFilter ?? "all", dayBucket],
      { tags: [cacheTags.invoices(userId)] }
    );

    const data = await getChartData();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch chart data:", error);
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 });
  }
}

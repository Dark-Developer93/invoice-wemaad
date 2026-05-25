import { NextResponse } from "next/server";
import { subDays } from "date-fns";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = Math.min(Math.max(parseInt(searchParams.get("range") ?? "30", 10), 1), 365);
  const statusParam = searchParams.get("status") ?? "PAID";

  type InvoiceStatus = "PAID" | "PENDING";
  const validStatuses: InvoiceStatus[] = ["PAID", "PENDING"];
  const statusFilter: InvoiceStatus | undefined = validStatuses.includes(statusParam as InvoiceStatus)
    ? (statusParam as InvoiceStatus)
    : undefined;

  const rawData = await prisma.invoice.findMany({
    where: {
      userId: session.user.id,
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
    acc[timestamp] = (acc[timestamp] ?? 0) + curr.total;
    return acc;
  }, {});

  const data = Object.entries(aggregated)
    .map(([date, amount]) => ({ date: Number(date), amount }))
    .sort((a, b) => a.date - b.date);

  return NextResponse.json(data);
}

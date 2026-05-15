import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoices = await prisma.invoice.findMany({
    where: { userId: session.user.id },
    include: { client: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "Invoice Number",
    "Invoice Name",
    "Client",
    "Status",
    "Date",
    "Due Date (days)",
    "Total",
    "Currency",
    "Item Description",
    "Quantity",
    "Rate",
  ];

  const rows = invoices.map((inv) => [
    inv.invoiceNumber,
    `"${inv.invoiceName.replace(/"/g, '""')}"`,
    `"${(inv.client?.name ?? "").replace(/"/g, '""')}"`,
    inv.status,
    new Date(inv.date).toISOString().split("T")[0],
    inv.dueDate,
    (inv.total / 100).toFixed(2),
    inv.currency,
    `"${inv.invoiceItemDescription.replace(/"/g, '""')}"`,
    inv.invoiceItemQuantity,
    (inv.invoiceItemRate / 100).toFixed(2),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="invoices.csv"',
    },
  });
}

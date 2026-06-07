import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { parseInvoiceItems } from "@/lib/invoiceItems";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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
      "Items",
    ];

    const rows = invoices.map((inv) => {
      const items = parseInvoiceItems(inv.items);
      const itemsSummary = items
        .map((item) => `${item.description} (${item.quantity} x ${(item.rate / 100).toFixed(2)})`)
        .join("; ");

      return [
        inv.invoiceNumber,
        `"${inv.invoiceName.replace(/"/g, '""')}"`,
        `"${(inv.client?.name ?? "").replace(/"/g, '""')}"`,
        inv.status,
        new Date(inv.date).toISOString().split("T")[0],
        inv.dueDate,
        (inv.total / 100).toFixed(2),
        inv.currency,
        `"${itemsSummary.replace(/"/g, '""')}"`,
      ];
    });

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="invoices.csv"',
      },
    });
  } catch (error) {
    console.error("Failed to export report:", error);
    return NextResponse.json({ error: "Failed to generate export" }, { status: 500 });
  }
}

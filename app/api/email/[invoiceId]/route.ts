import { NextResponse } from "next/server";
import { format, addDays } from "date-fns";

import prisma from "@/lib/db";
import { requireUser } from "@/lib/session";
import { sendEmail } from "@/lib/email";
import { formatCurrency } from "@/lib/formatCurrency";
import { Currency } from "@/types";

export async function POST(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ invoiceId: string }>;
  }
) {
  try {
    const session = await requireUser();

    if (!session.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { invoiceId } = await params;

    const invoiceData = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        userId: session.user.id,
      },
    });

    if (!invoiceData) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const dueDate = addDays(
      new Date(invoiceData.date),
      parseInt(invoiceData.dueDate.toString())
    );

    await sendEmail({
      to: invoiceData.clientEmail,
      templateName: "reminderInvoice",
      variables: {
        clientName: invoiceData.clientName,
        invoiceNumber: invoiceData.invoiceNumber.toString(),
        invoiceDueDate: format(dueDate, "PPP"),
        invoiceAmount: formatCurrency({
          amount: invoiceData.total,
          currency: invoiceData.currency as Currency,
        }),
        invoiceLink:
          process.env.NODE_ENV !== "production"
            ? `http://localhost:3000/api/invoice/${invoiceData.id}`
            : `https://invoice-wemaad.vercel.app/api/invoice/${invoiceData.id}`, // TODO: change to production url
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send Email reminder", error);
    return NextResponse.json(
      { error: "Failed to send Email reminder" },
      { status: 500 }
    );
  }
}

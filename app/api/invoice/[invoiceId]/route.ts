import { NextRequest, NextResponse } from "next/server";
import { loadInvoiceForPdf, renderInvoicePDF } from "@/lib/invoicePdf";
import { verifyInvoiceToken } from "@/lib/urls";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ invoiceId: string }>;
  }
) {
  try {
    const { invoiceId } = await params;

    const token = request.nextUrl.searchParams.get("token");
    if (!token || !verifyInvoiceToken(invoiceId, token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Token-authorized (not session): the signed link is how clients open
    // an invoice from the email. One query — the render reuses this row.
    const invoice = await loadInvoiceForPdf(invoiceId);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const pdfBuffer = await renderInvoicePDF(invoice);

    // Return the PDF with appropriate headers
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${invoice.invoiceName}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[GET_INVOICE]", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}

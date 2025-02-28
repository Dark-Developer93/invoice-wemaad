import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateInvoicePDF } from "@/app/actions/generate-invoice";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: { invoiceId: string };
  }
) {
  try {
    const { invoiceId } = params;

    // Find the invoice without requiring user authentication
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
      },
      include: {
        client: {
          include: {
            addresses: {
              where: {
                isDefault: true,
              },
              take: 1,
            },
            contactPersons: {
              where: {
                isPrimary: true,
              },
              take: 1,
            },
          },
        },
        User: {
          select: {
            companyName: true,
            companyEmail: true,
            companyAddress: true,
            companyTaxId: true,
            companyLogoUrl: true,
            stampsUrl: true,
            bankName: true,
            bankAccountName: true,
            bankAccountNumber: true,
            bankSwiftCode: true,
            bankIBAN: true,
            bankAddress: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceId, true);

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

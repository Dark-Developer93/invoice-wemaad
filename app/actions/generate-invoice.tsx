"use server";

import { Prisma } from "@prisma/client";
import { pdf } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/pdf/InvoicePDF";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

export type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
  include: {
    client: {
      include: {
        addresses: true;
        contactPersons: true;
      };
    };
    User: {
      select: {
        companyName: true;
        companyEmail: true;
        companyAddress: true;
        companyTaxId: true;
        companyLogoUrl: true;
        stampsUrl: true;
        bankName: true;
        bankAccountName: true;
        bankAccountNumber: true;
        bankSwiftCode: true;
        bankIBAN: true;
        bankAddress: true;
      };
    };
  };
}>;

export async function generateInvoicePDF(invoiceId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const data = (await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        userId: session.user.id,
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
    })) as InvoiceWithRelations | null;

    if (!data) {
      throw new Error("Invoice not found");
    }

    console.log("Invoice data:", JSON.stringify(data, null, 2));

    const pdfDoc = await pdf(<InvoicePDF invoice={data} />);
    const blob = await pdfDoc.toBlob();
    const arrayBuffer = await blob.arrayBuffer();
    return arrayBuffer;
  } catch (error) {
    console.error("[GENERATE_INVOICE_PDF]", error);
    throw error;
  }
}

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

export async function generateInvoicePDF(
  invoiceId: string,
  skipAuthCheck: boolean = false
) {
  try {
    let userId: string | undefined;

    if (!skipAuthCheck) {
      const session = await auth();
      if (!session?.user?.id) {
        throw new Error("Unauthorized");
      }
      userId = session.user.id;
    }

    const data = (await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        ...(userId ? { userId } : {}),
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

    const pdfDoc = await pdf(<InvoicePDF invoice={data} />);
    const blob = await pdfDoc.toBlob();
    const arrayBuffer = await blob.arrayBuffer();
    return arrayBuffer;
  } catch (error) {
    console.error("[GENERATE_INVOICE_PDF]", error);
    throw error;
  }
}

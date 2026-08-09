"use server";

import { Prisma } from "@prisma/client";
import { pdf } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/pdf/InvoicePDF";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { getPlanConfig } from "@/lib/planConfig";
import { PlanType } from "@/lib/plans";

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
        plan: true;
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
            plan: true,
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

    // Free/Starter plans (customBranding: false) show a "Sent via
    // InvoiceWeMaAd" footer with a link back to the homepage — every free
    // invoice doubles as a small ad shown to the actual target market
    // (the invoice's recipient). Pro/Business get a fully white-labeled PDF.
    const planConfig = await getPlanConfig((data.User?.plan as PlanType) ?? "FREE");
    const showBranding = !planConfig.customBranding;

    const pdfDoc = await pdf(<InvoicePDF invoice={data} showBranding={showBranding} />);
    const blob = await pdfDoc.toBlob();
    const arrayBuffer = await blob.arrayBuffer();
    return arrayBuffer;
  } catch (error) {
    console.error("[GENERATE_INVOICE_PDF]", error);
    throw error;
  }
}

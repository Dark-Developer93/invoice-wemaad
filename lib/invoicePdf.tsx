import { Prisma } from "@prisma/client";
import { pdf } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/pdf/InvoicePDF";
import prisma from "@/lib/db";

// Deliberately NOT a "use server" module. Everything exported from a server
// action file is callable by any client with arbitrary arguments — this used
// to live in app/actions/generate-invoice.tsx behind a `skipAuthCheck`
// parameter, which let any logged-in user download any other user's invoice
// PDF (bank details included) by passing `true`. Authorization decisions
// belong to the callers: the generateInvoicePDF action (session owner only)
// and the signed-link route (HMAC token).

const invoicePdfInclude = {
  client: {
    include: {
      addresses: { where: { isDefault: true }, take: 1 },
      contactPersons: { where: { isPrimary: true }, take: 1 },
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
} satisfies Prisma.InvoiceInclude;

export type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
  include: typeof invoicePdfInclude;
}>;

// Pass `userId` to scope the lookup to that owner (pattern 2: ownership in
// the WHERE clause). Omit it only when the caller has already authorized
// access some other way (the HMAC-signed public link).
export function loadInvoiceForPdf(
  invoiceId: string,
  userId?: string
): Promise<InvoiceWithRelations | null> {
  return prisma.invoice.findUnique({
    where: { id: invoiceId, ...(userId ? { userId } : {}) },
    include: invoicePdfInclude,
  });
}

export async function renderInvoicePDF(invoice: InvoiceWithRelations): Promise<ArrayBuffer> {
  const pdfDoc = pdf(<InvoicePDF invoice={invoice} />);
  const blob = await pdfDoc.toBlob();
  return blob.arrayBuffer();
}

import { createHash } from "crypto";
import type { ComponentProps } from "react";
import { unstable_cache } from "next/cache";
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

// Bump when InvoicePDF's layout changes, so PDFs rendered by the old template
// aren't served from cache after a deploy.
const PDF_TEMPLATE_VERSION = "1";

async function renderUncached(props: ComponentProps<typeof InvoicePDF>): Promise<ArrayBuffer> {
  const blob = await pdf(<InvoicePDF {...props} />).toBlob();
  return blob.arrayBuffer();
}

// Rendering is the most CPU-heavy thing this app does (a full react-pdf
// layout pass, plus fetching the logo/stamp images by URL), and the same
// invoice is typically opened many times: by the owner, and by their
// customer via the emailed link. The output is a pure function of the props,
// so it's cached under a hash of exactly those props. Any change to the
// invoice, client, address, contact or company/bank details changes the
// hash, so a stale PDF can't be served and no invalidation is needed.
// (Known gap: replacing a logo/stamp image *at the same URL* shows up only
// once something else on the invoice changes. Uploads get new URLs.)
export async function renderInvoicePDF(invoice: InvoiceWithRelations): Promise<ArrayBuffer> {
  const props: ComponentProps<typeof InvoicePDF> = { invoice };
  const key = createHash("sha256")
    .update(JSON.stringify({ v: PDF_TEMPLATE_VERSION, year: new Date().getFullYear(), props }))
    .digest("hex");

  const base64 = await unstable_cache(
    async () => Buffer.from(await renderUncached(props)).toString("base64"),
    ["invoice-pdf", key]
  )();

  const bytes = Buffer.from(base64, "base64");
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

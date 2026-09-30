"use server";

import { auth } from "@/lib/auth";
import { loadInvoiceForPdf, renderInvoicePDF } from "@/lib/invoicePdf";

// Callable from the browser (the invoice list's "Download" action), so its
// arguments are attacker-controlled: it must always authorize via the session
// and scope the lookup to the caller's own invoices. The public signed-link
// route uses lib/invoicePdf directly instead of going through this action.
export async function generateInvoicePDF(invoiceId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const invoice = await loadInvoiceForPdf(invoiceId, session.user.id);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    return await renderInvoicePDF(invoice);
  } catch (error) {
    console.error("[GENERATE_INVOICE_PDF]", error);
    throw error;
  }
}

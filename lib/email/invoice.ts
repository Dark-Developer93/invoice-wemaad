import { revalidateTag } from "next/cache";
import { sendEmail } from "@/lib/email/index";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import { logEmailSent } from "@/lib/usage";
import { getInvoiceUrl } from "@/lib/urls";
import { Currency } from "@/types";
import prisma from "@/lib/db";
import { cacheTags } from "@/lib/cache";

export async function dispatchInvoiceEmail({
  userId,
  clientName,
  contactEmail,
  templateName,
  logType,
  invoiceNumber,
  invoiceDueDate,
  total,
  currency,
  invoiceId,
  notificationHref = "/dashboard/invoices",
}: {
  userId: string;
  clientName: string;
  contactEmail: string;
  templateName: "newInvoice" | "updatedInvoice" | "reminderInvoice";
  logType?: string;
  invoiceNumber: number;
  invoiceDueDate: string | Date;
  total: number;
  currency: string;
  invoiceId: string;
  notificationHref?: string;
}) {
  try {
    await sendEmail({
      to: contactEmail,
      templateName,
      variables: {
        clientName,
        invoiceNumber: invoiceNumber.toString(),
        invoiceDueDate: formatDate.long(invoiceDueDate),
        invoiceAmount: formatCurrency({ amount: total, currency: currency as Currency }),
        invoiceLink: getInvoiceUrl(invoiceId),
      },
    });
    await logEmailSent(userId, logType ?? templateName, invoiceId);
  } catch (error) {
    console.error(`Failed to send ${templateName} email for invoice ${invoiceId}:`, error);
    await prisma.notification.create({
      data: {
        userId,
        title: "Email delivery failed",
        message: `Invoice email to ${clientName} could not be sent. Please resend manually.`,
        href: notificationHref,
      },
    }).then(() => {
      revalidateTag(cacheTags.notifications(userId));
    }).catch((notifError: unknown) => {
      console.error(`Failed to create notification for user ${userId}:`, notifError);
    });
    throw error;
  }
}

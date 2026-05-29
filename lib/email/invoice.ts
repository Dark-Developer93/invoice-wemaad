import { sendEmail } from "@/lib/email/index";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import { logEmailSent } from "@/lib/usage";
import { getInvoiceUrl } from "@/lib/urls";
import { Currency } from "@/types";
import prisma from "@/lib/db";

export function dispatchInvoiceEmail({
  userId,
  clientName,
  contactEmail,
  templateName,
  logType,
  invoiceNumber,
  invoiceDate,
  total,
  currency,
  invoiceId,
  notificationHref = "/dashboard/invoices",
}: {
  userId: string;
  clientName: string;
  contactEmail: string;
  templateName: "newInvoice" | "updatedInvoice";
  logType?: string;
  invoiceNumber: number;
  invoiceDate: string | Date;
  total: number;
  currency: string;
  invoiceId: string;
  notificationHref?: string;
}) {
  sendEmail({
    to: contactEmail,
    templateName,
    variables: {
      clientName,
      invoiceNumber: invoiceNumber.toString(),
      invoiceDueDate: formatDate.long(invoiceDate),
      invoiceAmount: formatCurrency({ amount: total, currency: currency as Currency }),
      invoiceLink: getInvoiceUrl(invoiceId),
    },
  })
    .then(() => logEmailSent(userId, logType ?? templateName, invoiceId))
    .catch((error) => {
      console.error(`Failed to send ${templateName} email for invoice ${invoiceId}:`, error);
      prisma.notification.create({
        data: {
          userId,
          title: "Email delivery failed",
          message: `Invoice email to ${clientName} could not be sent. Please resend manually.`,
          href: notificationHref,
        },
      }).catch((notifError: unknown) => {
        console.error(`Failed to create notification for user ${userId}:`, notifError);
      });
    });
}

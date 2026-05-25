"use server";

import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";
import { SubmissionResult } from "@conform-to/react";

import { requireUser } from "@/lib/session";
import { invoiceSchema } from "@/lib/zodSchemas";
import prisma from "@/lib/db";
import { sendEmail } from "@/lib/email/index";
import { formatCurrency } from "@/lib/formatCurrency";
import { formatDate } from "@/lib/formatDate";
import { Currency } from "@/types";
import { getUserUsage, logEmailSent } from "@/lib/usage";
import { getInvoiceUrl } from "@/lib/urls";

async function sendInvoiceEmail(
  userId: string,
  clientName: string,
  contactEmail: string,
  templateName: "newInvoice" | "updatedInvoice",
  invoiceNumber: number,
  invoiceDate: string,
  total: number,
  currency: string,
  invoiceId: string
) {
  try {
    const emailUsage = await getUserUsage(userId);
    if (emailUsage.emailLimit !== null && emailUsage.emailsThisMonth >= emailUsage.emailLimit) {
      return;
    }
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
      .then(() => logEmailSent(userId, templateName, invoiceId))
      .catch((error) => {
        console.error(`Failed to send ${templateName} email:`, error);
        prisma.notification.create({
          data: {
            userId,
            title: "Email delivery failed",
            message: `Invoice email to ${clientName} could not be sent. Please resend from the invoice page.`,
            href: "/dashboard/invoices",
          },
        }).catch(() => {});
      });
  } catch (error) {
    console.error("Failed to initiate invoice email:", error);
  }
}

export async function createInvoice(
  _prevState: SubmissionResult<string[]> | null | undefined,
  formData: FormData
): Promise<SubmissionResult<string[]>> {
  const session = await requireUser();

  if (!session?.user?.id) {
    return {
      status: "error",
      error: { "": ["User not found"] },
    };
  }

  const usage = await getUserUsage(session.user.id);
  if (usage.invoiceLimit !== null && usage.invoicesThisMonth >= usage.invoiceLimit) {
    return {
      status: "error",
      error: { "": [`Monthly invoice limit (${usage.invoiceLimit}) reached on the ${usage.plan} plan. Upgrade to create more.`] },
    };
  }

  const submission = parseWithZod(formData, {
    schema: invoiceSchema,
  });

  if (submission.status !== "success") {
    return {
      status: "error",
      error: { form: ["Invalid form data"] },
    };
  }

  try {
    // Create invoice first
    const data = await prisma.invoice.create({
      data: {
        ...submission.value,
        userId: session.user.id,
      },
    });

    // Send email asynchronously without waiting.
    const client = await prisma.client.findUnique({
      where: {
        id: submission.value.clientId,
        userId: session.user.id,
      },
      include: {
        contactPersons: {
          where: {
            isPrimary: true,
          },
          take: 1,
        },
      },
    });

    const shouldSendEmail = formData.get("sendEmail") !== "false";

    if (shouldSendEmail && client && client.contactPersons[0]) {
      await sendInvoiceEmail(
        session.user.id,
        client.name,
        client.contactPersons[0].email,
        "newInvoice",
        submission.value.invoiceNumber,
        submission.value.date,
        submission.value.total,
        submission.value.currency,
        data.id
      );
    }

    return { status: "success", error: {} };
  } catch (error) {
    console.error("Failed to create invoice:", error);
    return {
      status: "error",
      error: { "": ["Failed to create invoice"] },
    };
  }
}

export async function editInvoice(
  _prevState: SubmissionResult<string[]> | null | undefined,
  formData: FormData
): Promise<SubmissionResult<string[]>> {
  const session = await requireUser();

  if (!session?.user?.id) {
    return {
      status: "error",
      error: { "": ["User not found"] },
    };
  }

  const submission = parseWithZod(formData, {
    schema: invoiceSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    // Update invoice first
    const data = await prisma.invoice.update({
      where: {
        id: formData.get("id") as string,
        userId: session.user.id,
      },
      data: {
        ...submission.value,
        userId: session.user.id,
      },
    });

    // Send email asynchronously without waiting
    const client = await prisma.client.findUnique({
      where: {
        id: submission.value.clientId,
        userId: session.user.id,
      },
      include: {
        contactPersons: {
          where: {
            isPrimary: true,
          },
          take: 1,
        },
      },
    });

    const shouldSendEmail = formData.get("sendEmail") !== "false";

    if (shouldSendEmail && client && client.contactPersons[0]) {
      await sendInvoiceEmail(
        session.user.id,
        client.name,
        client.contactPersons[0].email,
        "updatedInvoice",
        submission.value.invoiceNumber,
        submission.value.date,
        submission.value.total,
        submission.value.currency,
        data.id
      );
    }

    return { status: "success", error: {} };
  } catch (error) {
    console.error("Failed to update invoice:", error);
    return {
      status: "error",
      error: { "": ["Failed to update invoice"] },
    };
  }
}

export async function deleteInvoice(invoiceId: string) {
  const session = await requireUser();

  if (!session.user?.id) {
    return { error: "User not found" };
  }

  try {
    await prisma.invoice.delete({
      where: {
        userId: session.user.id,
        id: invoiceId,
      },
    });
  } catch (error) {
    console.error("Failed to delete invoice:", error);
    return { error: "Failed to delete invoice" };
  }

  return redirect("/dashboard/invoices");
}

export async function markAsPaid(invoiceId: string) {
  const session = await requireUser();

  if (!session.user?.id) {
    return { error: "User not found" };
  }

  try {
    await prisma.invoice.update({
      where: {
        userId: session.user.id,
        id: invoiceId,
      },
      data: {
        status: "PAID",
      },
    });
  } catch (error) {
    console.error("Failed to mark invoice as paid:", error);
    return { error: "Failed to update invoice status" };
  }

  return redirect("/dashboard/invoices");
}

"use server";

import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";
import { SubmissionResult } from "@conform-to/react";

import { requireUser } from "@/lib/session";
import { invoiceSchema } from "@/lib/zodSchemas";
import prisma from "@/lib/db";
import { sendEmail } from "@/lib/email/index";
import { formatCurrency } from "@/lib/formatCurrency";
import { Currency } from "@/types";

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

    if (client && client.contactPersons[0]) {
      // Fire and forget email sending
      sendEmail({
        to: client.contactPersons[0].email,
        templateName: "newInvoice",
        variables: {
          clientName: client.name,
          invoiceNumber: submission.value.invoiceNumber.toString(),
          invoiceDueDate: new Intl.DateTimeFormat("en-US", {
            dateStyle: "long",
          }).format(new Date(submission.value.date)),
          invoiceAmount: formatCurrency({
            amount: submission.value.total,
            currency: submission.value.currency as Currency,
          }),
          invoiceLink:
            process.env.NODE_ENV !== "production"
              ? `http://localhost:3000/api/invoice/${data.id}`
              : `https://invoice-wemaad.vercel.app/api/invoice/${data.id}`,
        },
      }).catch((error) => {
        console.error("Failed to send invoice email:", error);
        // Don't throw error as invoice is already created
      });
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

    if (client && client.contactPersons[0]) {
      // Fire and forget email sending
      sendEmail({
        to: client.contactPersons[0].email,
        templateName: "updatedInvoice",
        variables: {
          clientName: client.name,
          invoiceNumber: submission.value.invoiceNumber.toString(),
          invoiceDueDate: new Intl.DateTimeFormat("en-US", {
            dateStyle: "long",
          }).format(new Date(submission.value.date)),
          invoiceAmount: formatCurrency({
            amount: submission.value.total,
            currency: submission.value.currency as Currency,
          }),
          invoiceLink:
            process.env.NODE_ENV !== "production"
              ? `http://localhost:3000/api/invoice/${data.id}`
              : `https://invoice-wemaad.vercel.app/api/invoice/${data.id}`,
        },
      }).catch((error) => {
        console.error("Failed to send invoice update email:", error);
        // Don't throw error as invoice is already updated
      });
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

  await prisma.invoice.delete({
    where: {
      userId: session.user.id,
      id: invoiceId,
    },
  });

  return redirect("/dashboard/invoices");
}

export async function markAsPaid(invoiceId: string) {
  const session = await requireUser();

  if (!session.user?.id) {
    return { error: "User not found" };
  }

  await prisma.invoice.update({
    where: {
      userId: session.user.id,
      id: invoiceId,
    },
    data: {
      status: "PAID",
    },
  });

  return redirect("/dashboard/invoices");
}

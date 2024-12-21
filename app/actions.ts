"use server";

import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";
import { SubmissionResult } from "@conform-to/react";

import { requireUser } from "@/lib/session";
import { invoiceSchema, onboardingSchema } from "@/lib/zodSchemas";
import prisma from "@/lib/db";
import { sendEmail } from "@/lib/email/index";
import { formatCurrency } from "@/lib/formatCurrency";
import { Currency } from "@/types";
import { toast } from "sonner";

export async function onboardUser(
  _prevState: SubmissionResult<string[]> | null | undefined,
  formData: FormData
): Promise<SubmissionResult<string[]>> {
  const session = await requireUser();

  if (!session.user?.id) {
    return {
      status: "error",
      error: { "": ["User not found"] },
    };
  }

  const submission = parseWithZod(formData, {
    schema: onboardingSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      firstName: submission.value.firstName,
      lastName: submission.value.lastName,
      address: submission.value.address,
    },
  });

  return redirect("/dashboard");
}

export async function createInvoice(
  _prevState: SubmissionResult<string[]> | null | undefined,
  formData: FormData
): Promise<SubmissionResult<string[]>> {
  const session = await requireUser();

  if (!session.user?.id) {
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

  const data = await prisma.invoice.create({
    data: {
      ...submission.value,
      userId: session.user.id,
    },
  });

  await sendEmail({
    to: submission.value.clientEmail,
    templateName: "newInvoice",
    variables: {
      clientName: submission.value.clientName,
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
  });

  return redirect("/dashboard/invoices");
}

export async function editInvoice(
  _prevState: SubmissionResult<string[]> | null | undefined,
  formData: FormData
): Promise<SubmissionResult<string[]>> {
  const session = await requireUser();

  if (!session.user?.id) {
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

  await sendEmail({
    to: submission.value.clientEmail,
    templateName: "updatedInvoice",
    variables: {
      clientName: submission.value.clientName,
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
  });

  return redirect("/dashboard/invoices");
}

export async function DeleteInvoice(invoiceId: string) {
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

export async function MarkAsPaidAction(invoiceId: string) {
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

export async function updateProfile(
  _prevState: SubmissionResult<string[]> | null | undefined,
  formData: FormData
): Promise<
  { status: "error"; error: Record<string, string[]> } | { status: "success" }
> {
  try {
    const session = await requireUser();

    if (!session.user?.id) {
      return {
        status: "error",
        error: { "": ["User not found"] },
      };
    }

    const parsed = onboardingSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
      return {
        status: "error",
        error: parsed.error.flatten().fieldErrors,
      };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: parsed.data,
    });

    toast.success("Profile updated successfully");
    return { status: "success" };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      error: { form: ["Failed to update profile"] },
    };
  }
}

"use server";

import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";
import { SubmissionResult } from "@conform-to/react";

import { requireUser } from "@/lib/session";
import { invoiceSchema, onboardingSchema } from "@/lib/zodSchemas";
import prisma from "@/lib/db";
import { emailClient } from "@/lib/mailtrap";
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

  const sender = {
    email: "hello@demomailtrap.com",
    name: "Jan Marshal",
  };

  emailClient.send({
    from: sender,
    to: [{ email: "jan@alenix.de" }],
    template_uuid: "3c01e4ee-a9ed-4cb6-bbf7-e57c2ced6c94",
    template_variables: {
      clientName: submission.value.clientName,
      invoiceNumber: submission.value.invoiceNumber,
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
          : `https://invoice-marshal.vercel.app/api/invoice/${data.id}`,
    },
  });

  return redirect("/dashboard/invoices");
}

export async function editInvoice(
  prevState: SubmissionResult<string[]> | null | undefined,
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

  const sender = {
    email: "hello@demomailtrap.com",
    name: "Jan Marshal",
  };

  emailClient.send({
    from: sender,
    to: [{ email: "jan@alenix.de" }],
    template_uuid: "9d04aa85-6896-48a8-94e9-b54354a48880",
    template_variables: {
      clientName: submission.value.clientName,
      invoiceNumber: submission.value.invoiceNumber,
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
          : `https://invoice-marshal.vercel.app/api/invoice/${data.id}`,
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

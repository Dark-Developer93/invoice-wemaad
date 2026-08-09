"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { parseWithZod } from "@conform-to/zod";
import { SubmissionResult } from "@conform-to/react";

import { requireUser } from "@/lib/session";
import { clientFormSchema } from "@/lib/zodSchemas";
import { getPlanConfig } from "@/lib/planConfig";
import { PlanType } from "@/lib/plans";
import prisma from "@/lib/db";
import { cacheTags } from "@/lib/cache";

class ClientLimitReachedError extends Error {
  constructor(public limit: number) {
    super("Client limit reached");
  }
}

export async function createClient(
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
    schema: clientFormSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Serialize per user (Postgres advisory lock, released automatically at
      // transaction end) so the client-count check below can't race with a
      // concurrent createClient call for the same user — same pattern as the
      // invoice/email limit checks in app/actions/invoices.ts.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${session.user.id}))`;

      const user = await tx.user.findUniqueOrThrow({
        where: { id: session.user.id },
        select: { plan: true },
      });
      const planConfig = await getPlanConfig(user.plan as PlanType);

      if (planConfig.clientLimit !== null) {
        const clientCount = await tx.client.count({ where: { userId: session.user.id } });
        if (clientCount >= planConfig.clientLimit) {
          throw new ClientLimitReachedError(planConfig.clientLimit);
        }
      }

      return tx.client.create({
        data: {
          userId: session.user.id,
          name: submission.value.name,
          email: submission.value.email,
          phone: submission.value.phone,
          taxId: submission.value.taxId,
          website: submission.value.website,
          notes: submission.value.notes,
          category: submission.value.category,
          addresses: {
            create: submission.value.addresses,
          },
          contactPersons: {
            create: submission.value.contactPersons,
          },
          customFields: {
            create: submission.value.customFields,
          },
        },
      });
    });

    revalidatePath("/dashboard/clients");
    revalidateTag(cacheTags.clients(session.user.id));
    return { status: "success", error: {} };
  } catch (error) {
    if (error instanceof ClientLimitReachedError) {
      return {
        status: "error",
        error: { "": [`Client limit (${error.limit}) reached on your plan. Upgrade to add more clients.`] },
      };
    }
    console.error(error);
    return {
      status: "error",
      error: { form: ["Failed to create client"] },
    };
  }
}

export async function editClient(
  clientId: string,
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
    schema: clientFormSchema,
  });

  if (submission.status !== "success") {
    console.error("Validation errors:", submission.error);
    return {
      status: "error",
      error: { form: ["Invalid form data"] },
    };
  }

  try {
    // First check if the client exists and belongs to the user
    const existingClient = await prisma.client.findUnique({
      where: {
        id: clientId,
        userId: session.user.id,
      },
    });

    if (!existingClient) {
      return {
        status: "error",
        error: { form: ["Client not found"] },
      };
    }

    // Update the client with a transaction to handle related records
    await prisma.$transaction(async (tx) => {
      // Update addresses
      await tx.address.deleteMany({
        where: { clientId },
      });
      await tx.address.createMany({
        data: submission.value.addresses.map((addr) => ({
          ...addr,
          clientId,
        })),
      });

      // Update contact persons
      await tx.contactPerson.deleteMany({
        where: { clientId },
      });
      await tx.contactPerson.createMany({
        data: submission.value.contactPersons.map((contact) => ({
          ...contact,
          clientId,
        })),
      });

      // Update custom fields
      await tx.clientCustomField.deleteMany({
        where: { clientId },
      });
      await tx.clientCustomField.createMany({
        data: submission.value.customFields.map((field) => ({
          ...field,
          clientId,
        })),
      });

      // Update the main client record
      await tx.client.update({
        where: { id: clientId },
        data: {
          name: submission.value.name,
          email: submission.value.email,
          phone: submission.value.phone,
          taxId: submission.value.taxId,
          website: submission.value.website,
          notes: submission.value.notes,
          category: submission.value.category,
        },
      });
    });

    revalidatePath("/dashboard/clients");
    revalidatePath(`/dashboard/clients/${clientId}`);
    revalidateTag(cacheTags.clients(session.user.id));
    return { status: "success", error: {} };
  } catch (error) {
    console.error("Database error:", error);
    return {
      status: "error",
      error: { form: ["Failed to update client"] },
    };
  }
}

export async function deleteClient(clientId: string) {
  const session = await requireUser();

  if (!session?.user?.id) {
    return { error: "User not found" };
  }

  try {
    await prisma.client.delete({
      where: {
        id: clientId,
        userId: session.user.id,
      },
    });

    revalidatePath("/dashboard/clients");
    revalidateTag(cacheTags.clients(session.user.id));
    return redirect("/dashboard/clients");
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete client" };
  }
}

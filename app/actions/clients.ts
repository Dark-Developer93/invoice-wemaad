"use server";

import { redirect } from "next/navigation";
import { parseWithZod } from "@conform-to/zod";
import { SubmissionResult } from "@conform-to/react";

import { requireUser } from "@/lib/session";
import { clientFormSchema } from "@/lib/zodSchemas";
import prisma from "@/lib/db";

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
    await prisma.client.create({
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

    return { status: "success", error: {} };
  } catch (error) {
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

    return redirect("/dashboard/clients");
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete client" };
  }
}

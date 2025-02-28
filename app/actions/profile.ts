"use server";

import { SubmissionResult } from "@conform-to/react";
import { requireUser } from "@/lib/session";
import { onboardingSchema } from "@/lib/zodSchemas";
import prisma from "@/lib/db";

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
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        address: parsed.data.address,
        companyName: parsed.data.companyName,
        companyEmail: parsed.data.companyEmail,
        companyAddress: parsed.data.companyAddress,
        companyTaxId: parsed.data.companyTaxId,
        companyLogoUrl: parsed.data.companyLogoUrl,
        stampsUrl: parsed.data.stampsUrl,
        bankName: parsed.data.bankName,
        bankAccountName: parsed.data.bankAccountName,
        bankAccountNumber: parsed.data.bankAccountNumber,
        bankSwiftCode: parsed.data.bankSwiftCode,
        bankIBAN: parsed.data.bankIBAN,
        bankAddress: parsed.data.bankAddress,
      },
    });

    return { status: "success" };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      error: { form: ["Failed to update profile"] },
    };
  }
}

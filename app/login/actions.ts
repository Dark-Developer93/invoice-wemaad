"use server";

import { signIn } from "@/lib/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function loginAction(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  try {
    await signIn("nodemailer", formData);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return "Failed to send the magic link. Please try again.";
  }
}

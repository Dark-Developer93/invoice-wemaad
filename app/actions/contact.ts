"use server";

import { z } from "zod";

import { sendEmail } from "@/lib/email";

const CONTACT_EMAIL = "abdullah@wemaad.net";

const contactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters long"),
});

export async function submitContactForm(
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  const validatedFields = contactFormSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!validatedFields.success) {
    return { error: "Invalid form data" };
  }

  try {
    await sendEmail({
      to: CONTACT_EMAIL,
      templateName: "contactForm",
      variables: validatedFields.data,
    });

    return { success: true };
  } catch {
    return { error: "Failed to send message" };
  }
}

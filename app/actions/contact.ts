"use server";

import { z } from "zod";
import { render } from "@react-email/render";

import ContactFormEmail from "@/lib/email/templates/contactForm";
import { emailTransporter } from "@/lib/email";

const contactFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters long"),
});

export async function submitContactForm(
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  // Validate environment variables
  if (!process.env.EMAIL_FROM || !process.env.EMAIL_SERVER_USER) {
    throw new Error("Server configuration error");
  }

  const firstName = formData.get("firstName")?.toString();
  const lastName = formData.get("lastName")?.toString();
  const email = formData.get("email")?.toString();
  const message = formData.get("message")?.toString();

  if (!firstName || !lastName || !email || !message) {
    throw new Error("All fields are required");
  }

  const validatedFields = contactFormSchema.safeParse({
    firstName,
    lastName,
    email,
    message,
  });

  if (!validatedFields.success) {
    throw new Error("Invalid form data");
  }

  try {
    await emailTransporter.sendMail({
      from: {
        name: "InvoiceWeMaAd",
        address: process.env.EMAIL_FROM,
      },
      to: "hello@wemaad.com",
      subject: "New Contact Form Submission - InvoiceWeMaAd",
      html: await render(
        ContactFormEmail({
          firstName: validatedFields.data.firstName,
          lastName: validatedFields.data.lastName,
          email: validatedFields.data.email,
          message: validatedFields.data.message,
        })
      ),
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send contact form email:", error);
    return { error: "Failed to send message" };
  }
}

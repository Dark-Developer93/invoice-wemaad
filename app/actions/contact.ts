"use server";

import { z } from "zod";
import { parseWithZod } from "@conform-to/zod";
import { SubmissionResult } from "@conform-to/react";
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
  _prevState: SubmissionResult<string[]> | null | undefined,
  formData: FormData
): Promise<SubmissionResult<string[]>> {
  const submission = parseWithZod(formData, {
    schema: contactFormSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    await emailTransporter.sendMail({
      from: {
        name: "InvoiceWeMaAd",
        address: process.env.EMAIL_FROM!,
      },
      to: "hello@wemaad.com",
      subject: "New Contact Form Submission - InvoiceWeMaAd",
      html: await render(
        ContactFormEmail({
          firstName: submission.value.firstName,
          lastName: submission.value.lastName,
          email: submission.value.email,
          message: submission.value.message,
        })
      ),
    });

    return submission.reply();
  } catch (error) {
    console.error("Failed to send contact form email:", error);
    return submission.reply({
      formErrors: ["Failed to send message. Please try again later."],
    });
  }
}

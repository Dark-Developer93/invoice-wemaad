import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { z } from "zod";

import NewInvoiceEmail from "./templates/newInvoice";
import UpdatedInvoiceEmail from "./templates/updatedInvoice";
import ReminderInvoiceEmail from "./templates/reminderInvoice";
import ContactFormEmail from "./templates/contactForm";
import { InvoiceEmailProps, ContactFormEmailProps } from "@/types";
import { env } from "@/lib/env";

export const emailTransporter = nodemailer.createTransport({
  host: env.EMAIL_SERVER_HOST,
  port: env.EMAIL_SERVER_PORT,
  secure: env.EMAIL_SERVER_PORT === 465,
  auth: {
    user: env.EMAIL_SERVER_USER,
    pass: env.EMAIL_SERVER_PASSWORD,
  },
});

// Verify SMTP connection at runtime only — skip during `next build` (SKIP_ENV_VALIDATION=1)
// because no SMTP server is reachable inside the Docker builder stage.
if (env.NODE_ENV === "production" && !process.env.SKIP_ENV_VALIDATION) {
  emailTransporter.verify((error) => {
    if (error) {
      console.error("Email transport verification failed:", error);
    } else {
      console.log("Email transport ready");
    }
  });
}

const INVOICE_TEMPLATES = {
  newInvoice: NewInvoiceEmail,
  updatedInvoice: UpdatedInvoiceEmail,
  reminderInvoice: ReminderInvoiceEmail,
} as const;

const EMAIL_SUBJECTS: Record<keyof typeof INVOICE_TEMPLATES | "contactForm", string> = {
  newInvoice: "New Invoice - InvoiceWeMaAd",
  updatedInvoice: "Invoice Updated - InvoiceWeMaAd",
  reminderInvoice: "Invoice Payment Reminder - InvoiceWeMaAd",
  contactForm: "New Contact Form Submission - InvoiceWeMaAd",
};

type InvoiceSendEmailProps = {
  to: string;
  templateName: keyof typeof INVOICE_TEMPLATES;
  variables: InvoiceEmailProps;
};

type ContactFormSendEmailProps = {
  to: string;
  templateName: "contactForm";
  variables: ContactFormEmailProps;
};

export type SendEmailProps = InvoiceSendEmailProps | ContactFormSendEmailProps;

export async function sendEmail({ to, templateName, variables }: SendEmailProps) {
  z.string().email().parse(to);

  const emailHtml =
    templateName === "contactForm"
      ? await render(ContactFormEmail(variables))
      : await render(INVOICE_TEMPLATES[templateName](variables));

  await emailTransporter.sendMail({
    from: { name: "InvoiceWeMaAd", address: env.EMAIL_FROM },
    to,
    subject: EMAIL_SUBJECTS[templateName],
    html: emailHtml,
  });
}

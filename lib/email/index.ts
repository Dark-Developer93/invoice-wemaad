import nodemailer, { Transporter } from "nodemailer";
import { render } from "@react-email/render";
import { z } from "zod";

import NewInvoiceEmail from "./templates/newInvoice";
import UpdatedInvoiceEmail from "./templates/updatedInvoice";
import ReminderInvoiceEmail from "./templates/reminderInvoice";
import ContactFormEmail from "./templates/contactForm";
import SystemAlertEmail from "./templates/systemAlert";
import { InvoiceEmailProps, ContactFormEmailProps, SystemAlertEmailProps } from "@/types";
import { env } from "@/lib/env";

// Lazy singleton — created on first send, not at module load, so Next.js
// build-time page-data collection doesn't require email env vars or make
// live SMTP network calls.
let _transporter: Transporter | null = null;
export function getEmailTransporter(): Transporter {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: env.EMAIL_SERVER_HOST,
      port: env.EMAIL_SERVER_PORT,
      secure: true,
      auth: {
        user: env.EMAIL_SERVER_USER,
        pass: env.EMAIL_SERVER_PASSWORD,
      },
    });
  }
  return _transporter;
}

const INVOICE_TEMPLATES = {
  newInvoice: NewInvoiceEmail,
  updatedInvoice: UpdatedInvoiceEmail,
  reminderInvoice: ReminderInvoiceEmail,
} as const;

const EMAIL_SUBJECTS: Record<
  keyof typeof INVOICE_TEMPLATES | "contactForm" | "systemAlert",
  string
> = {
  newInvoice: "New Invoice - InvoiceWeMaAd",
  updatedInvoice: "Invoice Updated - InvoiceWeMaAd",
  reminderInvoice: "Invoice Payment Reminder - InvoiceWeMaAd",
  contactForm: "New Contact Form Submission - InvoiceWeMaAd",
  systemAlert: "System Alert - InvoiceWeMaAd",
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

type SystemAlertSendEmailProps = {
  to: string;
  templateName: "systemAlert";
  variables: SystemAlertEmailProps;
};

export type SendEmailProps =
  | InvoiceSendEmailProps
  | ContactFormSendEmailProps
  | SystemAlertSendEmailProps;

export async function sendEmail({ to, templateName, variables }: SendEmailProps) {
  z.string().email().parse(to);

  const emailHtml =
    templateName === "contactForm"
      ? await render(ContactFormEmail(variables))
      : templateName === "systemAlert"
      ? await render(SystemAlertEmail(variables))
      : await render(INVOICE_TEMPLATES[templateName](variables));

  await getEmailTransporter().sendMail({
    from: { name: "InvoiceWeMaAd", address: env.EMAIL_FROM },
    to,
    subject: EMAIL_SUBJECTS[templateName],
    html: emailHtml,
  });
}

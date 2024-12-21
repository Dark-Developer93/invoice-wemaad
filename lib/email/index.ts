import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import NewInvoiceEmail from "./templates/newInvoice";
import UpdatedInvoiceEmail from "./templates/updatedInvoice";
import ReminderInvoiceEmail from "./templates/reminderInvoice";
import ContactFormEmail from "./templates/contactForm";
import {
  NewInvoiceEmailProps,
  UpdatedInvoiceEmailProps,
  ReminderInvoiceEmailProps,
  ContactFormEmailProps,
} from "@/types";

export const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

interface SendEmailProps {
  to: string;
  templateName:
    | "newInvoice"
    | "updatedInvoice"
    | "reminderInvoice"
    | "contactForm";
  variables:
    | NewInvoiceEmailProps
    | UpdatedInvoiceEmailProps
    | ReminderInvoiceEmailProps
    | ContactFormEmailProps;
}

export async function sendEmail({
  to,
  templateName,
  variables,
}: SendEmailProps) {
  try {
    let emailHtml: string;

    switch (templateName) {
      case "newInvoice":
        emailHtml = await render(
          NewInvoiceEmail(variables as NewInvoiceEmailProps)
        );
        break;
      case "updatedInvoice":
        emailHtml = await render(
          UpdatedInvoiceEmail(variables as UpdatedInvoiceEmailProps)
        );
        break;
      case "reminderInvoice":
        emailHtml = await render(
          ReminderInvoiceEmail(variables as ReminderInvoiceEmailProps)
        );
        break;
      case "contactForm":
        emailHtml = await render(
          ContactFormEmail(variables as ContactFormEmailProps)
        );
        break;
      default:
        throw new Error("Invalid template name");
    }

    await emailTransporter.sendMail({
      from: {
        name: "InvoiceWeMaAd",
        address: process.env.EMAIL_FROM!,
      },
      to,
      subject: getEmailSubject(templateName),
      html: emailHtml,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("Failed to send email");
  }
}
function getEmailSubject(templateName: string): string {
  switch (templateName) {
    case "newInvoice":
      return "New Invoice - InvoiceWeMaAd";
    case "updatedInvoice":
      return "Invoice Updated - InvoiceWeMaAd";
    case "reminderInvoice":
      return "Invoice Payment Reminder - InvoiceWeMaAd";
    case "contactForm":
      return "New Contact Form Submission - InvoiceWeMaAd";
    default:
      return "InvoiceWeMaAd Notification";
  }
}

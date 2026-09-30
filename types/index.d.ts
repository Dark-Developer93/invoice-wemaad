export type Currency = "USD" | "EUR" | "EGP";

export interface InvoiceEmailProps {
  clientName: string;
  invoiceNumber: string;
  invoiceDueDate: string;
  invoiceAmount: string;
  invoiceLink: string;
  // Three tiers, from PlanConfig.brandingLevel: SHOWN (Free/Starter) shows a
  // full "Sent via InvoiceWeMaAd" footer with a link back to the homepage;
  // MINIMAL (Pro) shows a small unlinked credit only; HIDDEN (Business)
  // removes it entirely for a fully white-labeled email.
  brandingLevel: "SHOWN" | "MINIMAL" | "HIDDEN";
}

export interface ContactFormEmailProps {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

export interface SystemAlertEmailProps {
  title: string;
  message: string;
  href?: string;
}

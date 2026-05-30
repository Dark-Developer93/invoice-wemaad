import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from "@react-email/components";

import { ReminderInvoiceEmailProps } from "@/types";
import { EmailFooter } from "../components/EmailFooter";
import { EmailHeader } from "../components/EmailHeader";
import {
  button,
  buttonContainer,
  container,
  content,
  details,
  h3,
  main,
  text,
} from "../components/emailStyles";

export default function ReminderInvoiceEmail({
  clientName,
  invoiceNumber,
  invoiceDueDate,
  invoiceAmount,
  invoiceLink,
}: ReminderInvoiceEmailProps) {
  return (
    <Html>
      <Head>
        <title>Invoice Reminder - InvoiceWeMaAd</title>
      </Head>
      <Preview>Payment Reminder for Invoice #{invoiceNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader
            badgeLabel="Payment Reminder"
            badgeBackground="#ffe4e6"
            badgeColor="#be123c"
          />

          <div style={content}>
            <Heading as="h2">Invoice Payment Reminder</Heading>

            <Text style={text}>Hello {clientName},</Text>

            <div style={urgentNotice}>
              <Text style={text}>
                This is a friendly reminder that payment for invoice #
                {invoiceNumber} is due soon.
              </Text>
            </div>

            <div style={details}>
              <Heading as="h3" style={h3}>
                Invoice Information
              </Heading>
              <Text style={text}>
                <strong>Invoice Number:</strong> #{invoiceNumber}
              </Text>
              <Text style={text}>
                <strong>Due Date:</strong> {invoiceDueDate}
              </Text>
              <Text style={text}>
                <strong>Total Amount:</strong> {invoiceAmount}
              </Text>
            </div>

            <Text style={text}>
              Please ensure timely payment to avoid any late fees. You can view
              and pay your invoice by clicking the button below:
            </Text>

            <div style={buttonContainer}>
              <Link href={invoiceLink} style={button}>
                View Invoice
              </Link>
            </div>

            <EmailFooter />
          </div>
        </Container>
      </Body>
    </Html>
  );
}

const urgentNotice = {
  backgroundColor: "#ffe4e6",
  borderLeft: "4px solid #be123c",
  padding: "16px",
  margin: "24px 0",
  borderRadius: "0 8px 8px 0",
};

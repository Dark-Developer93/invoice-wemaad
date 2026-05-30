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

import { NewInvoiceEmailProps } from "@/types";
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

export default function NewInvoiceEmail({
  clientName,
  invoiceNumber,
  invoiceDueDate,
  invoiceAmount,
  invoiceLink,
}: NewInvoiceEmailProps) {
  return (
    <Html>
      <Head>
        <title>New Invoice - InvoiceWeMaAd</title>
      </Head>
      <Preview>
        New Invoice #{invoiceNumber} for {clientName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader
            badgeLabel="New Invoice"
            badgeBackground="#dbeafe"
            badgeColor="#1d4ed8"
          />

          <div style={content}>
            <Heading as="h2">New Invoice</Heading>

            <Text style={text}>Hello {clientName},</Text>

            <div style={notice}>
              <Text style={text}>
                A new invoice has been generated for your recent services.
                Please find the details below.
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
              You can view and download your invoice by clicking the button
              below:
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

const notice = {
  backgroundColor: "#eff6ff",
  borderLeft: "4px solid #3b82f6",
  padding: "16px",
  margin: "24px 0",
  borderRadius: "0 8px 8px 0",
};

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from "@react-email/components";

import { ContactFormEmailProps } from "@/types";

export default function ContactFormEmail({
  firstName,
  lastName,
  email,
  message,
}: ContactFormEmailProps) {
  return (
    <Html>
      <Head>
        <title>Contact Form Submission - InvoiceWeMaAd</title>
      </Head>
      <Preview>
        New Contact Form Submission from {firstName} {lastName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <div style={header}>
            <div style={brand}>
              Invoice<span style={brandSpan}>WeMaAd</span>
            </div>
            <div style={badge}>Contact Form</div>
          </div>

          <div style={content}>
            <Heading as="h2">New Contact Form Submission</Heading>

            <div style={notice}>
              <Text style={text}>
                You have received a new contact form submission. Details are
                below:
              </Text>
            </div>

            <div style={details}>
              <Heading as="h3" style={h3}>
                Contact Information
              </Heading>
              <Hr style={hr} />
              <Text style={text}>
                <strong>Name:</strong> {firstName} {lastName}
              </Text>
              <Text style={text}>
                <strong>Email:</strong> {email}
              </Text>
              <Text style={text}>
                <strong>Message:</strong>
                <br />
                {message}
              </Text>
            </div>

            <div style={footer}>
              <Text style={{ ...text, color: "#71717a", fontSize: "14px" }}>
                © 2024 InvoiceWeMaAd. All rights reserved.
              </Text>
              <Text style={{ ...text, color: "#71717a", fontSize: "14px" }}>
                Making invoicing super easy!
              </Text>
            </div>
          </div>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  fontFamily: '"Geist", Arial, sans-serif',
  lineHeight: 1.6,
  color: "#09090b",
  backgroundColor: "#fafafa",
};

const container = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "32px 24px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
};

const header = {
  textAlign: "left" as const,
  marginBottom: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const brand = {
  fontSize: "24px",
  fontWeight: 600,
  color: "#18181b",
};

const brandSpan = {
  color: "#3b82f6",
};

const badge = {
  display: "inline-block",
  padding: "6px 12px",
  backgroundColor: "#dbeafe",
  color: "#1d4ed8",
  borderRadius: "9999px",
  fontSize: "14px",
  fontWeight: 500,
};

const content = {
  padding: "0 16px",
};

const details = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
};

const h3 = {
  margin: "0 0 12px 0",
  color: "#18181b",
  fontSize: "16px",
};

const text = {
  margin: "16px 0",
  color: "#09090b",
  fontSize: "16px",
};

const notice = {
  backgroundColor: "#eff6ff",
  borderLeft: "4px solid #3b82f6",
  padding: "16px",
  margin: "24px 0",
  borderRadius: "0 8px 8px 0",
};

const hr = {
  margin: "20px 0",
  borderColor: "#e4e4e7",
};

const footer = {
  marginTop: "48px",
  textAlign: "center" as const,
};

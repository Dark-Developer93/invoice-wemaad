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
import { EmailFooter } from "../components/EmailFooter";
import { EmailHeader } from "../components/EmailHeader";
import {
  container,
  content,
  details,
  h3,
  main,
  text,
} from "../components/emailStyles";

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
          <EmailHeader
            badgeLabel="Contact Form"
            badgeBackground="#dbeafe"
            badgeColor="#1d4ed8"
          />

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

const hr = {
  margin: "20px 0",
  borderColor: "#e4e4e7",
};

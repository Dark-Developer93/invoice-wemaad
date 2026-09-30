import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";

import { PlainEmailFooter } from "../components/EmailFooter";
import { EmailHeader } from "../components/EmailHeader";
import { container, content, main } from "../components/emailStyles";

interface WelcomeEmailProps {
  url: string;
}

export default function WelcomeEmail({ url }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to InvoiceWeMaAd - Your Magic Link is Here!</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader
            badgeLabel="Magic Link"
            badgeBackground="#ECFDF5"
            badgeColor="#059669"
          />

          <Section style={content}>
            <Heading style={heroText}>Welcome to InvoiceWeMaAd!</Heading>

            <Text>Hello there,</Text>

            <Text>
              Thank you for choosing InvoiceWeMaAd. To access your account,
              simply click the secure login button below:
            </Text>

            <Section style={magicLinkBox}>
              <Text>Your secure login link is ready</Text>
              <Button style={button} href={url}>
                Sign in to InvoiceWeMaAd
              </Button>
              <Text style={{ fontSize: "14px", color: "#64748B" }}>
                This link will expire in 24 hours
              </Text>
            </Section>

            <div style={notice}>
              <Text style={{ margin: 0 }}>
                <strong>Security Notice:</strong> If you didn&apos;t request
                this email, please ignore it. Your account security is important
                to us.
              </Text>
            </div>

            <div style={features}>
              <div style={feature}>
                <div style={featureTitle}>📊 Dashboard Analytics</div>
                <Text style={{ margin: 0 }}>
                  Track your invoices and payments in real-time
                </Text>
              </div>
              <div style={feature}>
                <div style={featureTitle}>💰 Invoice Management</div>
                <Text style={{ margin: 0 }}>
                  Create and manage professional invoices easily
                </Text>
              </div>
            </div>

            <PlainEmailFooter />
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const heroText = {
  fontSize: "32px",
  fontWeight: 600,
  margin: "24px 0",
  background: "linear-gradient(to right, #3B82F6, #14B8A6, #22C55E)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const magicLinkBox = {
  backgroundColor: "#F8FAFC",
  border: "1px solid #E2E8F0",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const button = {
  display: "inline-block",
  padding: "12px 32px",
  background: "linear-gradient(to right, #3B82F6, #14B8A6, #22C55E)",
  color: "#FFFFFF",
  textDecoration: "none",
  borderRadius: "6px",
  fontWeight: 500,
  margin: "16px 0",
  textAlign: "center" as const,
};

const notice = {
  backgroundColor: "#FEF3C7",
  borderLeft: "4px solid #D97706",
  padding: "16px",
  margin: "24px 0",
  borderRadius: "0 8px 8px 0",
  fontSize: "14px",
};

const features = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: "16px",
  margin: "32px 0",
};

const feature = {
  padding: "16px",
  backgroundColor: "#F8FAFC",
  borderRadius: "8px",
};

const featureTitle = {
  fontWeight: 600,
  marginBottom: "8px",
  color: "#18181B",
};

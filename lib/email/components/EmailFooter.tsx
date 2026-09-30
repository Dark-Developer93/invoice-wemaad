import { Link, Text } from "@react-email/components";
import { getBaseUrl } from "@/lib/urls";

const footer = {
  marginTop: "48px",
  textAlign: "center" as const,
  borderTop: "1px solid #e4e4e7",
  paddingTop: "24px",
};

const footerText = {
  margin: "4px 0",
  color: "#71717a",
  fontSize: "14px",
};

const footerLink = {
  color: "#2563eb",
  textDecoration: "underline",
};

// Three tiers, from PlanConfig.brandingLevel. SHOWN (Free/Starter) is the
// growth loop: every invoice a free user sends is a small ad shown to their
// client, who is the actual target market. MINIMAL (Pro) keeps a small
// unlinked credit — no CTA, no link out. HIDDEN (Business) is a paid
// white-label feature, removed entirely.
//
// Only for client-facing invoice emails (new/updated/reminder) — the
// recipient here is a prospective customer's client, which is exactly who
// this CTA targets.
export function EmailFooter({
  brandingLevel,
}: {
  brandingLevel: "SHOWN" | "MINIMAL" | "HIDDEN";
}) {
  if (brandingLevel === "HIDDEN") return null;

  if (brandingLevel === "MINIMAL") {
    return (
      <div style={footer}>
        <Text style={footerText}>Powered by InvoiceWeMaAd</Text>
      </div>
    );
  }

  return (
    <div style={footer}>
      <Text style={footerText}>
        Sent with{" "}
        <Link href={getBaseUrl()} style={footerLink}>
          InvoiceWeMaAd
        </Link>{" "}
        — create your own free invoices at{" "}
        <Link href={getBaseUrl()} style={footerLink}>
          {getBaseUrl().replace(/^https?:\/\//, "")}
        </Link>
      </Text>
    </div>
  );
}

// For account/internal emails (welcome, system alerts, contact form
// notifications) — the recipient is already a user or the site admin, not
// a prospective customer, so the growth-loop CTA doesn't apply. Always
// shown, not gated by plan.
export function PlainEmailFooter() {
  return (
    <div style={footer}>
      <Text style={footerText}>
        © {new Date().getFullYear()} InvoiceWeMaAd. All rights reserved.
      </Text>
    </div>
  );
}

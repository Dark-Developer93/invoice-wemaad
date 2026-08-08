import type { Metadata } from "next";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { auth } from "@/lib/auth";
import { getBaseUrl } from "@/lib/urls";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of WeMaAd Invoice.",
  alternates: { canonical: "/terms" },
};

const LAST_UPDATED = "August 8, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-foreground mb-3">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

export default async function TermsOfServicePage() {
  const session = await auth();
  const isAuthenticated = !!session;
  const baseUrl = getBaseUrl();

  return (
    <div className="min-h-screen">
      <main className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <Navbar />
        <div className="max-w-3xl mx-auto py-10 md:py-16">
          <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: {LAST_UPDATED}</p>

          <Section title="1. Acceptance of Terms">
            <p>
              These Terms of Service (&quot;Terms&quot;) govern your access to and use of
              WeMaAd Invoice at {baseUrl.replace(/^https?:\/\//, "")} (the &quot;Service&quot;),
              operated by WeMaAd (&quot;we&quot;, &quot;us&quot;). By creating an account or
              using the Service, you agree to be bound by these Terms. If you do not agree, do
              not use the Service.
            </p>
          </Section>

          <Section title="2. Description of the Service">
            <p>
              WeMaAd Invoice is invoicing and billing software that lets you create and manage
              clients, generate and send invoices, automate recurring billing, and view basic
              financial reports. Features available to your account depend on your plan (Free,
              Starter, Pro, or Business).
            </p>
          </Section>

          <Section title="3. Account Registration &amp; Eligibility">
            <p>
              You must provide an accurate email address to create an account and be legally
              able to enter into a binding contract to use the Service. You are responsible for
              all activity that occurs under your account and for keeping access to your email
              inbox secure, since sign-in is passwordless (magic link).
            </p>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use the Service for any unlawful purpose, or to send fraudulent invoices.</li>
              <li>Attempt to gain unauthorized access to another user&apos;s account or data.</li>
              <li>Interfere with, disrupt, or place undue load on the Service&apos;s infrastructure (including circumventing rate limits).</li>
              <li>Use the Service to send spam or unsolicited bulk communications.</li>
              <li>Reverse-engineer or resell the Service without our written permission.</li>
            </ul>
          </Section>

          <Section title="5. Your Content &amp; Data">
            <p>
              You retain ownership of the client and invoice data you create in the Service
              (&quot;Your Content&quot;). You grant us a limited license to host, store, and
              transmit Your Content solely to operate the Service on your behalf (for example,
              emailing an invoice to your client at your request). You are solely responsible
              for the accuracy of Your Content and for having the right to collect and store
              any personal information about your clients that you enter.
            </p>
          </Section>

          <Section title="6. Subscription Plans &amp; Billing">
            <p>
              The Service offers a Free plan and paid plans (Starter, Pro, Business) with
              higher usage limits. Plan upgrade and downgrade requests are currently reviewed
              and applied manually by an administrator; the Service does not yet process
              payment cards directly. Where paid billing is introduced, separate payment terms
              will apply and these Terms will be updated accordingly. We may change plan
              features, limits, or pricing on reasonable notice.
            </p>
          </Section>

          <Section title="7. Invoices Are Not Professional Advice">
            <p>
              WeMaAd Invoice is a tool to help you create and send invoices — it does not
              process payments on your behalf, is not a substitute for professional
              accounting, tax, or legal advice, and does not verify or guarantee the accuracy
              of invoice amounts, tax calculations, or currency conversions you enter. You are
              responsible for the accuracy and legal compliance of every invoice you send.
            </p>
          </Section>

          <Section title="8. Intellectual Property">
            <p>
              The Service, including its software, design, and branding, is owned by WeMaAd
              and protected by intellectual property laws. These Terms do not grant you any
              rights to our trademarks or branding beyond what&apos;s necessary to use the
              Service as intended.
            </p>
          </Section>

          <Section title="9. Termination">
            <p>
              You may stop using the Service and request account deletion at any time by
              contacting us. We may suspend or terminate your access if you violate these
              Terms, engage in fraudulent activity, or if required by law. Upon termination,
              your right to use the Service ends, though certain data may be retained as
              described in our Privacy Policy.
            </p>
          </Section>

          <Section title="10. Disclaimers">
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
              WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT
              WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
            </p>
          </Section>

          <Section title="11. Limitation of Liability">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WEMAAD SHALL NOT BE LIABLE FOR ANY
              INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF
              PROFITS, REVENUE, DATA, OR BUSINESS ARISING FROM YOUR USE OF THE SERVICE, EVEN IF
              ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY FOR ANY CLAIM
              ARISING FROM THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID US,
              IF ANY, IN THE 12 MONTHS PRECEDING THE CLAIM.
            </p>
          </Section>

          <Section title="12. Indemnification">
            <p>
              You agree to indemnify and hold WeMaAd harmless from any claims, damages, or
              expenses arising from your use of the Service, Your Content, or your violation of
              these Terms.
            </p>
          </Section>

          <Section title="13. Governing Law">
            <p>
              These Terms are governed by the laws of the Arab Republic of Egypt, without
              regard to its conflict-of-law principles, unless otherwise required by the
              mandatory consumer-protection laws of your country of residence.
            </p>
          </Section>

          <Section title="14. Changes to These Terms">
            <p>
              We may update these Terms from time to time. If we make material changes, we
              will update the &quot;Last updated&quot; date above and, where appropriate,
              notify you through the Service. Continued use of the Service after changes take
              effect constitutes acceptance of the revised Terms.
            </p>
          </Section>

          <Section title="15. Contact Us">
            <p>
              Questions about these Terms can be sent to{" "}
              <a href="mailto:hello@wemaad.net" className="text-primary hover:underline">
                hello@wemaad.net
              </a>
              , or by mail to 3, Makram Ebeid, Nasr City, Cairo Governorate, Egypt.
            </p>
          </Section>
        </div>
      </main>
      <Footer isAuthenticated={isAuthenticated} />
    </div>
  );
}

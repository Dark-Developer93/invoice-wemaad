import type { Metadata } from "next";
import Features from "@/components/features/Features";
import Hero from "@/components/hero/Hero";
import Navbar from "@/components/navbar/Navbar";
import PricingSection from "@/components/pricing/PricingSection";
import ContactSection from "@/components/contact/ContactSection";
import Footer from "@/components/footer/Footer";
import { auth } from "@/lib/auth";

const SITE_URL = "https://invoice-wemaad.vercel.app";

export const metadata: Metadata = {
  title: "WeMaAd Invoice – Professional Invoicing & Billing Software",
  description:
    "Create, send, and track professional invoices in minutes. WeMaAd Invoice helps freelancers and small businesses manage clients, automate recurring billing, and get paid faster.",
  alternates: {
    canonical: "/",
  },
  other: {
    "og:updated_time": new Date().toISOString(),
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "WeMaAd Invoice",
      description:
        "Professional invoicing and billing software for freelancers and small businesses.",
      inLanguage: "en-US",
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/dashboard/invoices?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: "WeMaAd Invoice",
      url: SITE_URL,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "Create, send, and track professional invoices. Manage clients, automate recurring billing, and get paid faster.",
      featureList: [
        "Invoice creation and management",
        "Client management",
        "Recurring invoices",
        "Financial reports and analytics",
        "Email invoice delivery",
        "PDF export",
      ],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free plan available",
      },
      screenshot: `${SITE_URL}/hero.png`,
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "WeMaAd",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
        width: 512,
        height: 512,
      },
    },
  ],
};

const Home = async () => {
  const session = await auth();
  const isAuthenticated = !!session;

  return (
    <div className="min-h-screen relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="absolute inset-0 -z-10 h-full w-full bg-background dark:bg-background bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_50%_400px,#C9EBFF,transparent)] dark:bg-[radial-gradient(circle_800px_at_50%_400px,#1a3c4d,transparent)]"></div>
      </div>

      <main className="relative w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <Navbar />
        <div className="max-w-full overflow-x-hidden">
          <section id="hero"><Hero /></section>
          <section id="features"><Features /></section>
          <section id="pricing"><PricingSection isAuthenticated={isAuthenticated} /></section>
          <section id="contact"><ContactSection /></section>
        </div>
      </main>

      <Footer isAuthenticated={isAuthenticated} />
    </div>
  );
};

export default Home;

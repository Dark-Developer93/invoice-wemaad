import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { getBaseUrl } from "@/lib/urls";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: "WeMaAd Invoice – Professional Invoicing & Billing Software",
    template: "%s | WeMaAd Invoice",
  },
  description:
    "Create, send, and track professional invoices in minutes. WeMaAd Invoice helps freelancers and small businesses manage clients, automate recurring billing, and get paid faster.",
  keywords: [
    "invoice software",
    "online invoicing",
    "billing software",
    "invoice generator",
    "recurring invoices",
    "freelance invoicing",
    "small business billing",
    "client management",
    "WeMaAd Invoice",
  ],
  authors: [{ name: "WeMaAd" }],
  creator: "WeMaAd",
  publisher: "WeMaAd",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: getBaseUrl(),
    siteName: "WeMaAd Invoice",
    title: "WeMaAd Invoice – Professional Invoicing & Billing Software",
    description:
      "Create, send, and track professional invoices in minutes. Manage clients, automate recurring billing, and get paid faster.",
    images: [
      {
        url: "/hero.png",
        width: 1200,
        height: 630,
        alt: "WeMaAd Invoice – Professional Invoicing Software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WeMaAd Invoice – Professional Invoicing & Billing Software",
    description:
      "Create, send, and track professional invoices in minutes. Manage clients, automate recurring billing, and get paid faster.",
    images: ["/hero.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: "/logo.png",
  },
  manifest: "/manifest.webmanifest",
  other: {
    "llms-txt": `${getBaseUrl()}/llms.txt`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader showSpinner={false} />
          {children}
          <Toaster richColors closeButton theme="system" />
        </ThemeProvider>
      </body>
    </html>
  );
}

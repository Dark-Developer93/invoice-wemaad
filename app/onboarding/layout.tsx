import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started",
  description: "Set up your WeMaAd Invoice account to start creating professional invoices.",
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

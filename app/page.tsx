import Features from "@/components/features/Features";
import Hero from "@/components/hero/Hero";
import Navbar from "@/components/navbar/Navbar";
import PricingSection from "@/components/pricing/PricingSection";
import ContactSection from "@/components/contact/ContactSection";
import { auth } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

const Home = async () => {
  const session = await auth();
  const isAuthenticated = !!session;

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background dark:bg-background bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_50%_400px,#C9EBFF,transparent)] dark:bg-[radial-gradient(circle_800px_at_50%_400px,#1a3c4d,transparent)]"></div>
      </div>

      <main className="relative w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <Navbar />
        <div className="max-w-full overflow-x-hidden">
          <Hero />
          <Features />
          <PricingSection isAuthenticated={isAuthenticated} />
          <ContactSection />
        </div>
        <Toaster
          richColors
          closeButton
          theme="system"
          position="bottom-right"
        />
      </main>
    </div>
  );
};

export default Home;

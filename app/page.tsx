import Hero from "@/components/hero/Hero";
import Navbar from "@/components/navbar/Navbar";
import PricingSection from "@/components/pricing/PricingSection";

const Home = () => {
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background dark:bg-background bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_50%_400px,#C9EBFF,transparent)] dark:bg-[radial-gradient(circle_800px_at_50%_400px,#1a3c4d,transparent)]"></div>
      </div>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Navbar />
        <Hero />
        <PricingSection />
      </main>
    </div>
  );
};

export default Home;

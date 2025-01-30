import ColoredButton from "@/components/ui/ColoredButton";
import Image from "next/image";
import Link from "next/link";
import HeroImage from "@/public/hero.png";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative flex flex-col items-center justify-center py-8 px-4 md:py-12 lg:py-20">
      <div className="text-center w-full max-w-[90vw] md:max-w-none">
        <span className="inline-block text-sm text-primary font-medium tracking-tight bg-primary/10 px-4 py-2 rounded-full">
          Streamline Your Invoicing Process
        </span>
        <h1 className="mt-6 md:mt-8 text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tighter text-foreground">
          Professional Invoicing{" "}
          <span className="block mt-1 md:-mt-2 bg-gradient-to-l from-blue-500 via-teal-500 to-green-500 text-transparent bg-clip-text">
            made simple
          </span>
        </h1>

        <p className="max-w-[90vw] sm:max-w-xl mx-auto mt-4 text-base lg:text-lg text-muted-foreground px-4 md:px-0">
          Create, send, and track invoices with ease. Automated email reminders
          ensure you get paid on time, every time.
        </p>

        <div className="mt-7 mb-8 md:mb-12 flex items-center justify-center gap-4">
          <Link href="/login">
            <ColoredButton>Start Free Trial</ColoredButton>
          </Link>
          <Link href="#pricing">
            <Button variant="outline" className="h-[44px] w-[171px] rounded-xl">
              View Pricing
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative w-full px-4 md:px-8 lg:px-12 py-8 md:py-12">
        <svg
          className="absolute inset-0 -mt-12 md:-mt-24 blur-3xl"
          style={{ zIndex: -1 }}
          fill="none"
          viewBox="0 0 400 400"
          height="100%"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_10_20)">
            <g filter="url(#filter0_f_10_20)">
              <path
                d="M128.6 0H0V322.2L106.2 134.75L128.6 0Z"
                fill="#03FFE0"
              ></path>
              <path
                d="M0 322.2V400H240H320L106.2 134.75L0 322.2Z"
                fill="#7C87F8"
              ></path>
              <path
                d="M320 400H400V78.75L106.2 134.75L320 400Z"
                fill="#4C65E4"
              ></path>
              <path
                d="M400 0H128.6L106.2 134.75L400 78.75V0Z"
                fill="#043AFF"
              ></path>
            </g>
          </g>
          <defs>
            <filter
              colorInterpolationFilters="sRGB"
              filterUnits="userSpaceOnUse"
              height="720.666"
              id="filter0_f_10_20"
              width="720.666"
              x="-160.333"
              y="-160.333"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
              <feBlend
                in="SourceGraphic"
                in2="BackgroundImageFix"
                mode="normal"
                result="shape"
              ></feBlend>
              <feGaussianBlur
                result="effect1_foregroundBlur_10_20"
                stdDeviation="80.1666"
              ></feGaussianBlur>
            </filter>
          </defs>
        </svg>
        <div className="max-w-[95vw] mx-auto">
          <Image
            src={HeroImage}
            alt="Hero image"
            className="relative object-contain w-full border rounded-lg lg:rounded-2xl shadow-2xl dark:border-border"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;

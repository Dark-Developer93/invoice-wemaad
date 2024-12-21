import Image from "next/image";
import Link from "next/link";

import Logo from "@/public/logo.png";
import ColoredButton from "@/components/ui/ColoredButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const Navbar = () => {
  return (
    <div className="flex items-center justify-between py-4 px-4 md:py-5 md:px-0">
      <Link href="/" className="flex items-center gap-2">
        <Image src={Logo} alt="Logo" className="size-8 md:size-10" />
        <h3 className="hidden md:block text-2xl md:text-3xl font-semibold text-foreground">
          Invoice
          <span className="text-blue-500 dark:text-blue-400">WeMaAd</span>
        </h3>
      </Link>
      <div className="flex items-center gap-2 md:gap-4">
        <ThemeToggle />
        <Link href="/login">
          <ColoredButton>
            <span className="hidden sm:inline">Try for Free</span>
            <span className="sm:hidden">Start</span>
          </ColoredButton>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;

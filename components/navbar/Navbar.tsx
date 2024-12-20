import Image from "next/image";
import Link from "next/link";

import Logo from "@/public/logo.png";
import ColoredButton from "@/components/ui/ColoredButton";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const Navbar = () => {
  return (
    <div className="flex items-center justify-between py-5">
      <Link href="/" className="flex items-center gap-2">
        <Image src={Logo} alt="Logo" className="size-10" />
        <h3 className="text-3xl font-semibold text-foreground">
          Invoice
          <span className="text-blue-500 dark:text-blue-400">WeMaAd</span>
        </h3>
      </Link>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Link href="/login">
          <ColoredButton>Get Started</ColoredButton>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;

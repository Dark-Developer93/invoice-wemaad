import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/logo.png";

const Footer = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border mt-16 py-12 px-4 md:px-0">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <Image src={Logo} alt="WeMaAd Invoice Logo" className="size-8" />
              <span className="text-xl font-semibold text-foreground">
                Invoice<span className="text-blue-500 dark:text-blue-400">WeMaAd</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Professional invoicing and billing software for freelancers and small businesses.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/#features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="/#pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="/#contact" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {!isAuthenticated && (
                <>
                  <li><Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link></li>
                  <li><Link href="/login" className="hover:text-foreground transition-colors">Get Started Free</Link></li>
                </>
              )}
              {isAuthenticated && (
                <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              )}
            </ul>
          </div>

          {isAuthenticated && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Manage</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/dashboard/invoices" className="hover:text-foreground transition-colors">Invoices</Link></li>
                <li><Link href="/dashboard/clients" className="hover:text-foreground transition-colors">Clients</Link></li>
                <li><Link href="/dashboard/recurring-invoices" className="hover:text-foreground transition-colors">Recurring Invoices</Link></li>
              </ul>
            </div>
          )}
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>&copy; {currentYear} WeMaAd Invoice. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="/#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

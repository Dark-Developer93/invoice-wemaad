import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, LayoutDashboard, Shield } from "lucide-react";
import { signOut } from "@/lib/auth";
import { requireAdmin } from "@/lib/session";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import Logo from "@/public/logo.png";

const adminLinks = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <>
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex flex-col max-h-screen h-full gap-2">
            <div className="h-14 flex items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/admin" className="flex items-center gap-2">
                <Image src={Logo} alt="Logo" className="size-7" />
                <p className="text-2xl font-bold">
                  <span className="text-blue-600">Admin</span> Panel
                </p>
              </Link>
            </div>

            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1 mt-2">
                {adminLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10"
                  >
                    <link.icon className="size-4" />
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="px-4 py-4 border-t">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                ← Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-blue-600" />
              <span className="font-semibold text-sm">Admin Panel</span>
            </div>
            <div className="flex items-center ml-auto gap-2">
              <ThemeToggle />
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <Button variant="outline" size="sm">
                  Log out
                </Button>
              </form>
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
        </div>
      </div>
      <Toaster richColors closeButton theme="system" />
    </>
  );
}

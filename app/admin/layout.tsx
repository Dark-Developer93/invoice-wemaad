import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Shield } from "lucide-react";

import { signOut } from "@/lib/auth";
import { requireAdmin } from "@/lib/session";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Logo from "@/public/logo.png";
import { DashboardLinks } from "@/components/dashboard-links/DashboardLinks";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();

  const sidebar = (
    <div className="flex flex-col h-full gap-2">
      <div className="h-14 flex items-center border-b px-4 lg:h-[60px] lg:px-6 shrink-0">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src={Logo} alt="Logo" className="size-7" />
          <p className="text-xl font-bold">
            <span className="text-blue-600">Admin</span> Panel
          </p>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 mt-2">
          <DashboardLinks isAdmin={true} />
        </nav>
      </div>
    </div>
  );

  return (
    <>
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        {/* Desktop sidebar */}
        <div className="hidden border-r bg-muted/40 lg:block">
          {sidebar}
        </div>

        <div className="flex flex-col min-h-screen">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 shrink-0">
            {/* Mobile hamburger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden shrink-0">
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle navigation</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                {sidebar}
              </SheetContent>
            </Sheet>

            <div className="hidden sm:flex items-center gap-2">
              <Shield className="size-5 text-blue-600" />
              <span className="font-semibold text-sm">Admin Panel</span>
            </div>

            <div className="flex items-center ml-auto gap-2">
              <ThemeToggle />
              <NotificationBell userId={session.user!.id!} />
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

          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
      <Toaster richColors closeButton theme="system" />
    </>
  );
}

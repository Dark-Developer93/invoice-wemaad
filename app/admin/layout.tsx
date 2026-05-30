import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Shield } from "lucide-react";

import { signOut } from "@/lib/auth";
import { requireAdmin } from "@/lib/session";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { NavSheet } from "@/components/nav-sheet/NavSheet";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import Logo from "@/public/logo.png";
import { DashboardLinks } from "@/components/dashboard-links/DashboardLinks";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <>
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        {/* Desktop sidebar */}
        <div className="hidden border-r bg-muted/40 lg:block">
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
              <nav className="grid items-start px-2 font-medium lg:px-4 mt-2">
                <DashboardLinks isAdmin={true} />
              </nav>
            </div>
          </div>
        </div>

        <div className="flex flex-col min-h-screen">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 shrink-0">
            <NavSheet isAdmin={true} className="lg:hidden shrink-0" />

            <div className="hidden sm:flex items-center gap-2">
              <Shield className="size-5 text-blue-600" />
              <span className="font-semibold text-sm">Admin Panel</span>
            </div>

            <div className="flex items-center ml-auto gap-2">
              <ThemeToggle />
              <NotificationBell />
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
    </>
  );
}

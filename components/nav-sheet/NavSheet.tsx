"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { DashboardLinks } from "@/components/dashboard-links/DashboardLinks";
import Logo from "@/public/logo.png";

export function NavSheet({
  isAdmin,
  className,
}: {
  isAdmin?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className={className}
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" />
        <span className="sr-only">Toggle navigation</span>
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <div className="flex flex-col h-full">
            <div className="h-14 flex items-center border-b px-4 shrink-0">
              <Image src={Logo} alt="Logo" className="size-7 shrink-0" />
              <SheetTitle className="ml-2 font-bold text-lg leading-none">
                {isAdmin ? (
                  <><span className="text-blue-600">Admin</span> Panel</>
                ) : (
                  <>Invoice<span className="text-blue-600">WeMaAd</span></>
                )}
              </SheetTitle>
            </div>
            <nav className="grid items-start px-2 text-sm font-medium py-4">
              <DashboardLinks isAdmin={isAdmin} />
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

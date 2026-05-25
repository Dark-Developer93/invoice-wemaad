"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { DashboardLinks } from "@/components/dashboard-links/DashboardLinks";

export function MobileNav({
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
              <span className="font-semibold text-sm">Navigation</span>
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

"use client";

import type { ElementType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { dashboardLinks } from "@/components/dashboard-links/DashboardLinks";

const adminLinks = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Users", href: "/admin/users", icon: Users, exact: false },
];

function NavLink({
  href,
  icon: Icon,
  name,
  exact,
}: {
  href: string;
  icon: ElementType;
  name: string;
  exact: boolean;
}) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
        isActive
          ? "text-primary bg-primary/10 font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {name}
    </Link>
  );
}

export function AdminNavLinks() {
  return (
    <div className="space-y-0.5">
      <p className="px-3 pt-1 pb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Admin
      </p>
      {adminLinks.map((link) => (
        <NavLink key={link.href} {...link} />
      ))}

      <p className="px-3 pt-4 pb-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-t mt-3">
        Dashboard
      </p>
      {dashboardLinks.map((link) => (
        <NavLink key={link.href} href={link.href} icon={link.icon} name={link.name} exact />
      ))}
    </div>
  );
}

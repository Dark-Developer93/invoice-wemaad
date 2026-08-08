"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  FileText,
  Users2,
  CreditCard,
  RefreshCw,
  BarChart2,
  Shield,
  Activity,
  LineChart,
  Tag,
} from "lucide-react";

import { cn } from "@/lib/utils";

export const dashboardLinks = [
  {
    id: 0,
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    id: 1,
    name: "Invoices",
    href: "/dashboard/invoices",
    icon: FileText,
  },
  {
    id: 2,
    name: "Clients",
    href: "/dashboard/clients",
    icon: Users2,
  },
  {
    id: 3,
    name: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    id: 4,
    name: "Recurring",
    href: "/dashboard/recurring-invoices",
    icon: RefreshCw,
  },
  {
    id: 5,
    name: "Reports",
    href: "/dashboard/reports",
    icon: BarChart2,
  },
];

const adminLinks = [
  { id: 0, name: "Users", href: "/admin/users", icon: Shield },
  { id: 1, name: "Insights", href: "/admin/insights", icon: LineChart },
  { id: 2, name: "Plans", href: "/admin/plans", icon: Tag },
  { id: 3, name: "Monitoring", href: "/admin/monitoring", icon: Activity },
];

export function DashboardLinks({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  return (
    <>
      {dashboardLinks.map((link) => (
        <Link
          className={cn(
            pathname === link.href
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground",
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary"
          )}
          href={link.href}
          key={link.id}
        >
          <link.icon className="size-4" />
          {link.name}
        </Link>
      ))}
      {isAdmin && (
        <>
          {adminLinks.map((link, index) => (
            <Link
              className={cn(
                pathname.startsWith(link.href)
                  ? "text-blue-600 bg-blue-600/10"
                  : "text-muted-foreground hover:text-foreground",
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-blue-600",
                index === 0 && "mt-2 border-t pt-4"
              )}
              href={link.href}
              key={link.id}
            >
              <link.icon className="size-4" />
              {link.name}
            </Link>
          ))}
        </>
      )}
    </>
  );
}

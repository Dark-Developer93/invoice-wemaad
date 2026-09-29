"use client";

import Link from "next/link";
import { useIsAuthenticated } from "@/lib/hooks/useIsAuthenticated";

// The only auth-dependent part of the footer, split out so the footer (and
// the static marketing pages it sits on) stays server-rendered at build time.
export function FooterAccountLinks() {
  const isAuthenticated = useIsAuthenticated();

  return (
    <>
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
    </>
  );
}

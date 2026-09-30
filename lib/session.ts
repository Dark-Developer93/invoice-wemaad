import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import prisma from "./db";

export async function requireUser() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.isActive) {
    redirect("/login?error=AccountDeactivated");
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireUser();

  if (!session.user.isAdmin) {
    redirect("/dashboard");
  }

  return session;
}

export async function getRequiredUserId(): Promise<string> {
  const session = await requireUser();
  return session.user.id as string;
}

// The signed-in user's own row, fetched at most once per request. The
// dashboard layout and the page under it (and anything else in the same
// render) all need some slice of it — before this, a single dashboard load
// selected the same User row two or three times, and /dashboard/reports ran
// two monthly usage counts just to learn the plan. React's cache() dedupes
// it within one request only; it is never shared across requests, so it
// can't go stale after a profile or plan change.
export const getCurrentUser = cache(async () => {
  const session = await requireUser();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      address: true,
      companyName: true,
      companyEmail: true,
      companyAddress: true,
      isAdmin: true,
      plan: true,
      planUpdatedAt: true,
    },
  });
  // Session row outlived its user (deleted mid-session).
  if (!user) redirect("/login");
  return user;
});

export async function requireInvoiceOwnership(invoiceId: string, userId: string): Promise<void> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId, userId },
    select: { id: true },
  });
  if (!invoice) redirect("/dashboard/invoices");
}

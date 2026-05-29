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

export async function requireInvoiceOwnership(invoiceId: string, userId: string): Promise<void> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId, userId },
    select: { id: true },
  });
  if (!invoice) redirect("/dashboard/invoices");
}

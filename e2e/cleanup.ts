import { PrismaClient } from "@prisma/client";

// Deletes an E2E test user and everything it owns, in FK dependency order.
// Invoice/Client/RecurringInvoice don't cascade from User (unlike
// Session/Notification/EmailLog/PlanUpgradeRequest, which do), so those
// have to go first or the final user delete hits a foreign-key violation.
export async function cleanupE2EUser(prisma: PrismaClient, email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;

  await prisma.invoice.deleteMany({ where: { userId: user.id } });
  await prisma.recurringInvoice.deleteMany({ where: { userId: user.id } });
  await prisma.client.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
}

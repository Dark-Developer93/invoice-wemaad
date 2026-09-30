// Removes everything loadtest/seed.mjs created (users are identified by the
// reserved email domain), in FK dependency order — Invoice/Client/
// RecurringInvoice don't cascade from User, so they go first (same reason as
// e2e/cleanup.ts).
//
// Usage: DATABASE_URL=... node loadtest/cleanup.mjs

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { endsWith: "@loadtest.example.test" } },
    select: { id: true },
  });
  const userIds = users.map((u) => u.id);
  if (userIds.length === 0) {
    console.log("Nothing to clean up.");
    return;
  }

  const where = { userId: { in: userIds } };
  const invoices = await prisma.invoice.deleteMany({ where });
  await prisma.recurringInvoice.deleteMany({ where });
  const clients = await prisma.client.deleteMany({ where });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  console.log(`Deleted ${userIds.length} users, ${clients.count} clients, ${invoices.count} invoices.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

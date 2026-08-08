import { PrismaClient } from "@prisma/client";
import { cleanupE2EUser } from "./cleanup";
import { E2E_USER_EMAIL, E2E_ADMIN_EMAIL } from "./global-setup";

export default async function globalTeardown() {
  const prisma = new PrismaClient();
  try {
    await cleanupE2EUser(prisma, E2E_USER_EMAIL);
    await cleanupE2EUser(prisma, E2E_ADMIN_EMAIL);
  } finally {
    await prisma.$disconnect();
  }
}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    console.log("ADMIN_EMAIL not set — skipping admin seeding.");
    return;
  }

  const firstName = process.env.ADMIN_FIRST_NAME ?? "Admin";
  const lastName = process.env.ADMIN_LAST_NAME ?? "User";

  // Upsert: create the admin account if it doesn't exist, or promote if it does.
  // Setting emailVerified ensures the NextAuth Prisma adapter treats the account
  // as verified so magic-link sign-in works on the very first request.
  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      firstName,
      lastName,
      emailVerified: new Date(),
      isAdmin: true,
      isActive: true,
    },
    update: { isAdmin: true },
  });

  console.log(`✓ Admin account ready: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

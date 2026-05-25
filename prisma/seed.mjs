import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    throw new Error(
      "ADMIN_EMAIL environment variable is required to seed the admin account.\n" +
      "Example: ADMIN_EMAIL=you@example.com npx prisma db seed"
    );
  }

  const result = await prisma.user.updateMany({
    where: { email: adminEmail },
    data: { isAdmin: true },
  });

  if (result.count === 0) {
    throw new Error(
      `No user found with email "${adminEmail}". The user must sign up before the seed can run.`
    );
  }

  console.log(`Admin privileges granted to: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

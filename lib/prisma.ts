import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"],
    // Add connection pooling
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Enable query caching
prisma.$use(async (params, next) => {
  const before = Date.now();
  const result = await next(params);
  const after = Date.now();

  // Log slow queries for debugging
  if (after - before > 100) {
    console.log(`Slow query detected (${after - before}ms):`, params);
  }

  return result;
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

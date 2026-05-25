import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const client = new PrismaClient({
    log: [
      { level: "query", emit: "event" },
      { level: "error", emit: "stdout" },
    ],
  });

  const slowQueryThresholdMs = process.env.NODE_ENV === "production" ? 500 : 100;
  client.$on("query", (e) => {
    if (e.duration > slowQueryThresholdMs) {
      console.warn(`Slow query (${e.duration}ms): ${e.query}`);
    }
  });

  return client;
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

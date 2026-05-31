# Skill: query-db

## Import
```ts
import prisma from "@/lib/db"; // always the singleton
```
Never `new PrismaClient()` anywhere.

## Always scope to userId
```ts
// Ownership check in one query — user cannot access other users' data
await prisma.invoice.findMany({ where: { userId } });
await prisma.invoice.findUnique({ where: { id, userId } });
await prisma.invoice.delete({ where: { id, userId } });
```

## select over include
```ts
// Prefer — only loads needed fields
prisma.user.findUnique({ where: { id }, select: { plan: true, isAdmin: true } });
// Avoid — loads all relations
prisma.user.findUnique({ where: { id }, include: { invoices: true } });
```

## Nested relations
```ts
prisma.client.findMany({
  where: { userId },
  include: {
    addresses: { where: { isDefault: true }, take: 1 },
    contactPersons: { where: { isPrimary: true }, take: 1 },
  },
});
```

## Transactions

Interactive (result of one step needed in the next):
```ts
await prisma.$transaction(async (tx) => {
  const created = await tx.myModel.create({ data: { ... } });
  await tx.otherModel.update({ where: { id: created.relatedId }, data: { ... } });
});
```

Array form (independent operations):
```ts
await prisma.$transaction([op1, op2, op3]);
```

## Delete + recreate nested relations (Client update pattern)
```ts
await prisma.$transaction(async (tx) => {
  await tx.address.deleteMany({ where: { clientId } });
  await tx.address.createMany({ data: newAddresses.map((a) => ({ ...a, clientId })) });
  await tx.client.update({ where: { id: clientId, userId }, data: { name, email } });
});
```

## Monthly counting (usage / rate limiting)
```ts
import { startOfMonth, endOfMonth } from "date-fns";
const count = await prisma.invoice.count({
  where: { userId, createdAt: { gte: startOfMonth(new Date()), lte: endOfMonth(new Date()) } },
});
```
Prefer `getUserUsage()` from `@/lib/usage` — it batches user + invoice + email counts in one `Promise.all`.

## Caching expensive reads
```ts
import { unstable_cache } from "next/cache";
const getCachedCount = unstable_cache(
  async (userId: string) => prisma.invoice.count({ where: { userId } }),
  ["invoice-count"],
  { revalidate: 60 }
);
```

## Avoid N+1 — batch by userId
```ts
// Bad — N queries in a loop
for (const item of items) { await getUserUsage(item.userId); }

// Good — batch
const ids = [...new Set(items.map((i) => i.userId))];
const usageMap = Object.fromEntries(
  await Promise.all(ids.map(async (uid) => [uid, await getUserUsage(uid)]))
);
```

## Slow query warning
Built into `@/lib/db`: queries >100ms (dev) or >500ms (prod) log automatically. No extra code needed.

## findUniqueOrThrow
Use when the record must exist (throws `PrismaClientKnownRequestError` P2025 if not found):
```ts
const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id, userId } });
```

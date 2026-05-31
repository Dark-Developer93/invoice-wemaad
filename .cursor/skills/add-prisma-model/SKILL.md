---
name: add-prisma-model
description: Add Prisma models, relations, indexes, and migrations. Use for schema changes, new tables, or prisma/schema.prisma edits.
---


## 1. Edit `prisma/schema.prisma`

Standard user-scoped model template:
```prisma
model MyModel {
  id        String   @id @default(cuid())
  userId    String
  name      String   @db.VarChar(200)
  // ... fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```
- `cuid()` for internal IDs · `uuid()` for publicly-shared IDs (Invoice uses uuid)
- `onDelete: Cascade` — required on all user-scoped relations (account deletion cleanup)
- `@@index([userId])` — required. Add `@@index` on any field used in `where` filters.

## 2. Add reverse relation on User
```prisma
model User {
  // existing fields...
  myModels MyModel[]
}
```

## 3. Enums — define at bottom of schema.prisma alongside existing enums
```prisma
enum MyStatus {
  ACTIVE
  ARCHIVED
}
```

## 4. Run migration
```bash
pnpm prisma migrate dev --name add-my-model
# Prisma client is regenerated automatically
```

## 5. Next steps
- Add Zod schema → see `add-zod-schema` skill
- Add Server Action → see `add-server-action` skill
- Add Vitest test → `app/actions/__tests__/<domain>.test.ts`

## Existing models quick reference
| Model | PK | Notes |
|---|---|---|
| `User` | cuid | company info, bank details, plan, isAdmin, isActive |
| `Invoice` | uuid | InvoiceStatus (PAID/PENDING), one item per invoice |
| `Client` | cuid | has nested Address[], ContactPerson[], ClientCustomField[] |
| `RecurringInvoice` | cuid | RecurrenceInterval (MONTHLY/QUARTERLY/YEARLY); @@index([isActive, nextRunAt]) |
| `EmailLog` | cuid | append-only; queried monthly for rate limiting |
| `Notification` | cuid | @@index([userId, createdAt]) |
| `PlanUpgradeRequest` | cuid | UpgradeRequestStatus (PENDING/APPROVED/REJECTED) |

## Seeding
Update `prisma/seed.mjs` if test data is needed for the new model.

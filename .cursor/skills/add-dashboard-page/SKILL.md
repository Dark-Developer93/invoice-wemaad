---
name: add-dashboard-page
description: Add dashboard pages with metadata, Suspense, loading.tsx, and error.tsx. Use for new app/dashboard routes or page scaffolding.
---


## File structure
```
app/dashboard/<page-name>/
  page.tsx      ← Server Component (auth + data fetch)
  loading.tsx   ← Skeleton (Suspense fallback)
  error.tsx     ← Error boundary
```

## page.tsx template
```tsx
import { Suspense } from "react";
import { Metadata } from "next";
import { requireUser } from "@/lib/session";
import prisma from "@/lib/db";

export const metadata: Metadata = {
  title: "Page Title | WeMaAd Invoice",
  description: "Short description",
};

async function MyData({ userId }: { userId: string }) {
  const data = await prisma.someModel.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  return <MyFeatureContent data={data} />;
}

export default async function MyPage() {
  const session = await requireUser(); // redirects to /login if unauthenticated or inactive
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Page Title</h1>
        <p className="text-sm text-muted-foreground">Description</p>
      </div>
      <Suspense fallback={<MySkeleton />}>
        <MyData userId={session.user.id!} />
      </Suspense>
    </div>
  );
}
```

## loading.tsx template
```tsx
import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() {
  return <div className="flex flex-col gap-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
}
```

## error.tsx template
```tsx
"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 p-8 text-center">
      <p className="text-destructive">{error.message}</p>
      <button onClick={reset} className="underline text-sm">Try again</button>
    </div>
  );
}
```

## Plan-gating a page
```tsx
import { getUserUsage } from "@/lib/usage";
import { PLAN_FEATURES } from "@/lib/plans";
import { UpgradePrompt } from "@/components/upgrade-prompt/UpgradePrompt";

const usage = await getUserUsage(session.user.id!);
if (!PLAN_FEATURES[usage.plan].analytics) {
  return <UpgradePrompt title="Analytics" message="Available on Starter plan and above." />;
}
```

## Add to sidebar
Edit `components/dashboard-links/DashboardLinks.tsx` — add entry to the nav links array.
Match the icon style of existing links (Lucide icons).

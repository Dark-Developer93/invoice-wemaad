---
name: add-component
description: Create React components and React Hook Form flows with toFormData and server actions. Use when building UI, forms, dialogs, or components folders.
---


## File structure
- Folder: `components/<feature-name>/` (kebab-case)
- File: `PascalCase.tsx` inside the folder
- Sub-parts (sections, tabs, context): separate PascalCase files in the same folder

## "use client" form component template
```tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { mySchema } from "@/lib/zodSchemas";
import { myAction } from "@/app/actions/myDomain";
import { toFormData } from "@/lib/toFormData";

type FormValues = z.infer<typeof mySchema>;

export function MyForm({ defaultValues }: { defaultValues?: Partial<FormValues> }) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(mySchema),
    defaultValues: defaultValues ?? {},
  });

  async function onSubmit(data: FormValues) {
    const fd = toFormData(data as Record<string, unknown>);
    const result = await myAction(null, fd);
    if (result.status === "error") {
      toast.error(Object.values(result.error ?? {}).flat()[0] ?? "Something went wrong");
      return;
    }
    toast.success("Saved");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* FormField components */}
      </form>
    </Form>
  );
}
```

## Server Component (data-fetching)
```tsx
import prisma from "@/lib/db";
export async function MyList({ userId }: { userId: string }) {
  const data = await prisma.someModel.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  return <div>{/* render */}</div>;
}
```

## Context pattern (complex multi-tab forms)
See `components/invoice-form/InvoiceFormContext.tsx` and `components/client-form/ClientFormContext.tsx`.
Create a typed context with `createContext`, a `Provider`, and a `useMyContext()` hook that throws if used outside provider.

## Shared UI components — reuse, don't duplicate
- `SubmitButton` from `@/components/submit-button/SubmitButton` — props: `text`, `isLoading`, optional `form` id
- `UpgradePrompt` from `@/components/upgrade-prompt/UpgradePrompt` — for plan-gated features
- `EmptyState` from `@/components/empty-state/EmptyState`
- All base UI (`Button`, `Input`, `Dialog`, etc.) from `@/components/ui/`

## User profile data in dashboard components
```ts
import { useUser } from "@/components/providers/UserProvider";
const { firstName, lastName, companyName, companyEmail, companyAddress } = useUser();
```
Provider is mounted in `app/dashboard/layout.tsx`. Only available in "use client" components under /dashboard.

## Styling rules
- `cn()` from `@/lib/utils` for all className composition — never string concatenation
- Tailwind utility classes only — no inline styles
- Mobile-first: `sm:` / `md:` breakpoints

"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function RecurringInvoicesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground text-sm max-w-sm text-center">
        An unexpected error occurred loading your recurring invoices. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}

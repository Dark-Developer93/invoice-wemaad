"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ClientError({
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
        An unexpected error occurred loading this client. Please try again.
      </p>
      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href="/dashboard/clients">Back to clients</Link>
        </Button>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}

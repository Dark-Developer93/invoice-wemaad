import { Skeleton } from "@/components/ui/skeleton";

// Shared by the route's loading.tsx and the client-fetched list, so both
// show exactly the same placeholder.
export function InvoiceListSkeleton() {
  return (
    <>
      {/* Mobile skeleton */}
      <div className="md:hidden space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop skeleton */}
      <div className="hidden md:block rounded-md border">
        <div className="border-b">
          <div className="grid grid-cols-6 p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24 ml-auto" />
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-b">
            <div className="grid grid-cols-6 p-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-20 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

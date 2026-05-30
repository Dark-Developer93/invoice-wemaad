import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground">
            Manage your client directory and their information.
          </p>
        </div>
        <Skeleton className="h-9 w-full sm:w-36" />
      </div>

      <div className="rounded-md border">
        {/* Toolbar: search + filter */}
        <div className="border-b p-4 flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-9 w-full sm:w-56" />
          <Skeleton className="h-9 w-full sm:w-40" />
        </div>

        {/* Table header row */}
        <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_auto_auto_auto] border-b px-4 py-3 gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-8" />
        </div>

        {/* Table rows */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-4 py-3 border-b last:border-0">
            {/* Mobile: name + actions only */}
            <div className="flex items-center justify-between sm:hidden">
              <div className="space-y-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-8 w-8 shrink-0" />
            </div>

            {/* Desktop: all columns */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_auto_auto_auto] items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

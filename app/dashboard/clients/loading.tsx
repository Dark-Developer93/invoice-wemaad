import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-9 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-[140px]" />
      </div>

      <div className="rounded-md border">
        {/* Table Header */}
        <div className="border-b p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-[200px]" />
            <Skeleton className="h-8 w-[150px]" />
          </div>
        </div>

        {/* Table Body */}
        <div className="relative w-full overflow-auto">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-4 items-center">
                  <Skeleton className="h-4 w-[200px]" /> {/* Name */}
                  <Skeleton className="h-4 w-[180px]" /> {/* Email */}
                  <Skeleton className="h-4 w-[120px]" /> {/* Phone */}
                  <Skeleton className="h-4 w-[150px]" /> {/* Category */}
                </div>
                <Skeleton className="h-8 w-8" /> {/* Actions button */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

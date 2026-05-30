import { RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <RefreshCw className="size-5" /> Recurring Invoices
            </CardTitle>
            <CardDescription>
              Invoice templates that generate automatically on a schedule.
            </CardDescription>
          </div>
          <Skeleton className="h-9 w-full sm:w-48 shrink-0" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="md:hidden space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-lg border bg-card p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-7 border-b px-4 py-3 gap-4">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-10" />
            </div>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-7 items-center px-4 py-3 border-b last:border-0 gap-4"
              >
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-14 rounded-full" />
                <Skeleton className="h-8 w-8 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

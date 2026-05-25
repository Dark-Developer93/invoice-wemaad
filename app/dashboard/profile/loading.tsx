import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function FieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function ProfileLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-56 mt-1" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tab triggers */}
        <div className="flex gap-1 border-b pb-2">
          <Skeleton className="h-8 w-20 rounded-sm" />
          <Skeleton className="h-8 w-20 rounded-sm" />
          <Skeleton className="h-8 w-20 rounded-sm" />
        </div>

        {/* Personal tab fields: first name, last name, email, address */}
        <div className="grid gap-4 md:grid-cols-2">
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
        <FieldSkeleton />
        <FieldSkeleton />

        <Skeleton className="h-10 w-32" />
      </CardContent>
    </Card>
  );
}

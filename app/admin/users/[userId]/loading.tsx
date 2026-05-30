import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminUserDetailSkeleton } from "./_skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <div>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href="/admin/users">
            <ArrowLeft className="size-4 mr-1" />
            Back
          </Link>
        </Button>
      </div>
      <AdminUserDetailSkeleton />
    </div>
  );
}

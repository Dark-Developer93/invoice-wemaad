import { AdminUsersContentSkeleton } from "./page";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage all users, their plans, and account status.
        </p>
      </div>
      <AdminUsersContentSkeleton />
    </div>
  );
}

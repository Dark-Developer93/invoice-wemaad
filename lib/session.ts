import { redirect } from "next/navigation";
import { auth } from "./auth";

export async function requireUser() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.isActive) {
    redirect("/login?error=AccountDeactivated");
  }

  return session;
}

export async function requireAdmin() {
  const session = await requireUser();

  if (!session.user.isAdmin) {
    redirect("/dashboard");
  }

  return session;
}

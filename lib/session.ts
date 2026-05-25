import { redirect } from "next/navigation";
import { auth } from "./auth";
import prisma from "./db";

export async function requireUser() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: { isActive: true },
  });

  if (!user?.isActive) {
    redirect("/login?error=AccountDeactivated");
  }

  return session;
}

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.isAdmin) {
    redirect("/dashboard");
  }

  return session;
}

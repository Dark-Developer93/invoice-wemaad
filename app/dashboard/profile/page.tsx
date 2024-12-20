import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/profile-form/ProfileForm";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/session";

async function getUserData(userId: string) {
  const data = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      firstName: true,
      lastName: true,
      address: true,
      email: true,
    },
  });

  if (!data) {
    return redirect("/login");
  }

  return data;
}

export default async function Profile() {
  const session = await requireUser();
  const data = await getUserData(session.user?.id as string);

  return (
    <div className="flex flex-1 justify-center items-center">
      <ProfileForm
        firstName={data.firstName as string}
        lastName={data.lastName as string}
        address={data.address as string}
        email={data.email as string}
      />
    </div>
  );
}

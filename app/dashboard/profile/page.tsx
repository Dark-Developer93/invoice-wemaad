import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/profile-form/ProfileForm";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/session";

export const metadata = {
  title: "Profile | WeMaAd Invoice",
  description: "View your invoice profile",
};

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
      companyName: true,
      companyEmail: true,
      companyAddress: true,
      companyTaxId: true,
      companyLogoUrl: true,
      stampsUrl: true,
      bankName: true,
      bankAccountName: true,
      bankAccountNumber: true,
      bankSwiftCode: true,
      bankIBAN: true,
      bankAddress: true,
    },
  });

  if (!data?.firstName || !data.lastName || !data.address) {
    redirect("/onboarding");
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
        companyName={data.companyName || ""}
        companyEmail={data.companyEmail || ""}
        companyAddress={data.companyAddress || ""}
        companyTaxId={data.companyTaxId || ""}
        companyLogoUrl={data.companyLogoUrl || ""}
        stampsUrl={data.stampsUrl || ""}
        bankName={data.bankName || ""}
        bankAccountName={data.bankAccountName || ""}
        bankAccountNumber={data.bankAccountNumber || ""}
        bankSwiftCode={data.bankSwiftCode || ""}
        bankIBAN={data.bankIBAN || ""}
        bankAddress={data.bankAddress || ""}
      />
    </div>
  );
}

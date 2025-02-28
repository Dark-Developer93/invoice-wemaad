import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WarningGif from "@/public/warning-gif.gif";
import { buttonVariants } from "@/components/ui/button";
import SubmitButton from "@/components/submit-button/SubmitButton";
import { deleteClient } from "@/app/actions/clients";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/session";

export const metadata = {
  title: "Delete Client | WeMaAd Invoice",
  description: "Delete a client from your account",
};

async function Authorize(clientId: string, userId: string) {
  const data = await prisma.client.findUnique({
    where: {
      id: clientId,
      userId: userId,
    },
  });

  if (!data) {
    return redirect("/dashboard/clients");
  }
}
type Params = Promise<{ clientId: string }>;

export default async function DeleteClientRoute({
  params,
}: {
  params: Params;
}) {
  const session = await requireUser();
  const { clientId } = await params;
  await Authorize(clientId, session.user?.id as string);
  return (
    <div className="flex flex-1 justify-center items-center">
      <Card className="max-w-[500px]">
        <CardHeader>
          <CardTitle>Delete Client</CardTitle>
          <CardDescription>
            Are you sure that you want to delete this client?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Image src={WarningGif} alt="Warning Gif" className="rounded-lg" />
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <Link
            className={buttonVariants({ variant: "outline" })}
            href="/dashboard/clients"
          >
            Cancel
          </Link>
          <form
            action={async () => {
              "use server";
              await deleteClient(clientId);
            }}
          >
            <SubmitButton text="Delete Client" variant={"destructive"} />
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

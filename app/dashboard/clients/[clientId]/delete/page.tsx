import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import SubmitButton from "@/components/submit-button/SubmitButton";
import { deleteClient } from "@/app/actions/clients";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/session";

export const metadata = {
  title: "Delete Client",
  description: "Permanently remove a client and their associated data from your account.",
  robots: { index: false, follow: false },
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
          <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <AlertTriangle className="size-5 text-destructive shrink-0" />
            <p className="text-sm font-medium text-destructive">
              This action cannot be undone.
            </p>
          </div>
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

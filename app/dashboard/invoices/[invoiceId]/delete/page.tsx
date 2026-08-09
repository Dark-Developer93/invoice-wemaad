import Link from "next/link";
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
import { deleteInvoice } from "@/app/actions/invoices";
import { getRequiredUserId, requireInvoiceOwnership } from "@/lib/session";

export const metadata = {
  title: "Delete Invoice",
  description: "Permanently delete an invoice from your WeMaAd Invoice account.",
  robots: { index: false, follow: false },
};

type Params = Promise<{ invoiceId: string }>;

export default async function DeleteInvoiceRoute({
  params,
}: {
  params: Params;
}) {
  const [{ invoiceId }, userId] = await Promise.all([params, getRequiredUserId()]);
  await requireInvoiceOwnership(invoiceId, userId);
  return (
    <div className="flex flex-1 justify-center items-center">
      <Card className="max-w-[500px]">
        <CardHeader>
          <CardTitle>Delete Invoice</CardTitle>
          <CardDescription>
            Are you sure that you want to delete this invoice?
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
            href="/dashboard/invoices"
          >
            Cancel
          </Link>
          <form
            action={async () => {
              "use server";
              await deleteInvoice(invoiceId);
            }}
          >
            <SubmitButton text="Delete Invoice" variant={"destructive"} />
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

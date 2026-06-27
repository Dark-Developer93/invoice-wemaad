import Link from "next/link";
import Image from "next/image";

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
          <Image src={WarningGif} alt="Warning Gif" className="rounded-lg" />
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

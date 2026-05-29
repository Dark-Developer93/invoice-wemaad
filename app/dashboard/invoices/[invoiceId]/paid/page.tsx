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
import PaidGif from "@/public/paid-gif.gif";
import { buttonVariants } from "@/components/ui/button";
import SubmitButton from "@/components/submit-button/SubmitButton";
import { markAsPaid } from "@/app/actions/invoices";
import { getRequiredUserId, requireInvoiceOwnership } from "@/lib/session";

export const metadata = {
  title: "Mark as Paid | WeMaAd Invoice",
  description: "Mark an invoice as paid",
};

type Params = Promise<{ invoiceId: string }>;

export default async function MarkAsPaid({ params }: { params: Params }) {
  const [{ invoiceId }, userId] = await Promise.all([params, getRequiredUserId()]);
  await requireInvoiceOwnership(invoiceId, userId);
  return (
    <div className="flex flex-1 justify-center items-center">
      <Card className="max-w-[500px]">
        <CardHeader>
          <CardTitle>Mark as Paid?</CardTitle>
          <CardDescription>
            Are you sure you want to mark this invoice as paid?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Image src={PaidGif} alt="Paid Gif" className="rounded-lg" />
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
              await markAsPaid(invoiceId);
            }}
          >
            <SubmitButton text="Mark as Paid!" />
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

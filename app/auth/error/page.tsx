import { AlertCircle } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AuthError({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams?.error;

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#FFF0F0,transparent)]"></div>
      </div>
      <Card className="w-[380px] px-5">
        <CardHeader className="text-center">
          <div className="mb-4 mx-auto flex size-20 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="size-12 text-red-500" />
          </div>

          <CardTitle className="text-2xl font-bold">
            Authentication Error
          </CardTitle>
          <CardDescription>
            {error === "Verification"
              ? "The sign in link is no longer valid. It may have been used already or it may have expired."
              : "Something went wrong while trying to authenticate you."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-4 rounded-md bg-red-50 border-red-300 p-4">
            <div className="flex items-center">
              <AlertCircle className="size-5 text-red-400" />
              <p className="text-sm font-medium text-red-700 ml-3">
                Please try signing in again
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link
            href="/login"
            className={buttonVariants({
              className: "w-full",
            })}
          >
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

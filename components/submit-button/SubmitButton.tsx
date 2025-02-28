"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface iAppProps {
  text: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null
    | undefined;
  isLoading?: boolean;
  form?: string;
}

const SubmitButton = ({
  text,
  variant,
  isLoading = false,
  form,
}: iAppProps) => {
  return (
    <>
      {isLoading ? (
        <Button disabled className="w-full" variant={variant}>
          <Loader2 className="size-4 mr-2 animate-spin" /> Please wait...
        </Button>
      ) : (
        <Button type="submit" className="w-full" variant={variant} form={form}>
          {text}
        </Button>
      )}
    </>
  );
};

export default SubmitButton;

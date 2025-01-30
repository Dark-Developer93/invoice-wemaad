"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function ContactFormSubmit() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending..." : "Send Message"}
      {pending && <Loader2 className="w-4 h-4 animate-spin-fast" />}
    </Button>
  );
}

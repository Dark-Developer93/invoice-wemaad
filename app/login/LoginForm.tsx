"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SubmitButton from "@/components/submit-button/SubmitButton";

export function LoginForm() {
  const [error, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-y-4">
      <div className="flex flex-col gap-y-2">
        <Label>Email</Label>
        <Input
          name="email"
          type="email"
          required
          placeholder="hello@hello.com"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <SubmitButton text="Login" isLoading={isPending} />
    </form>
  );
}

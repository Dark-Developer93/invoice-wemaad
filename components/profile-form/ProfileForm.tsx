"use client";

import { useActionState, useState, startTransition } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SubmitButton from "@/components/submit-button/SubmitButton";
import { updateProfile } from "@/app/actions";
import { onboardingSchema } from "@/lib/zodSchemas";

interface ProfileFormProps {
  firstName: string;
  lastName: string;
  address: string;
  email: string;
}

export function ProfileForm({
  firstName: initialFirstName,
  lastName: initialLastName,
  address: initialAddress,
  email,
}: ProfileFormProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [address, setAddress] = useState(initialAddress);

  const [lastResult, action] = useActionState(updateProfile, null);

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: onboardingSchema,
      });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onSubmit(event) {
      event.preventDefault();
      startTransition(() => {
        action(new FormData(event.currentTarget));
        router.refresh();
      });
    },
  });

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Update your personal information here</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          action={action}
          id={form.id}
          onSubmit={form.onSubmit}
          noValidate
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>First Name</Label>
              <Input
                name={fields.firstName.name}
                key={fields.firstName.key}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
              />
              <p className="text-red-500 text-sm">{fields.firstName.errors}</p>
            </div>
            <div className="grid gap-2">
              <Label>Last Name</Label>
              <Input
                name={fields.lastName.name}
                key={fields.lastName.key}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
              />
              <p className="text-red-500 text-sm">{fields.lastName.errors}</p>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Email</Label>
            <Input value={email} disabled className="bg-muted" />
          </div>

          <div className="grid gap-2">
            <Label>Address</Label>
            <Input
              name={fields.address.name}
              key={fields.address.key}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Street Name"
            />
            <p className="text-red-500 text-sm">{fields.address.errors}</p>
          </div>

          <div className="flex justify-end mt-4">
            <SubmitButton text="Update Profile" />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

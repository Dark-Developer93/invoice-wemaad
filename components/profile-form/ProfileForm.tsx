"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";
import * as z from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubmitButton from "@/components/submit-button/SubmitButton";
import { updateProfile } from "@/app/actions/profile";
import { toFormData } from "@/lib/toFormData";
import { onboardingSchema } from "@/lib/zodSchemas";
import { PersonalTab } from "./PersonalTab";
import { CompanyTab } from "./CompanyTab";
import { BankTab } from "./BankTab";

type ProfileFormValues = z.infer<typeof onboardingSchema>;

interface ProfileFormProps {
  firstName: string;
  lastName: string;
  address: string;
  email: string;
  companyName?: string;
  companyEmail?: string;
  companyAddress?: string;
  companyTaxId?: string;
  companyLogoUrl?: string;
  stampsUrl?: string;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankSwiftCode?: string;
  bankIBAN?: string;
  bankAddress?: string;
}

export function ProfileForm({
  firstName,
  lastName,
  address,
  email,
  companyName = "",
  companyEmail = "",
  companyAddress = "",
  companyTaxId = "",
  companyLogoUrl = "",
  stampsUrl = "",
  bankName = "",
  bankAccountName = "",
  bankAccountNumber = "",
  bankSwiftCode = "",
  bankIBAN = "",
  bankAddress = "",
}: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      firstName,
      lastName,
      address,
      companyName,
      companyEmail,
      companyAddress,
      companyTaxId,
      companyLogoUrl,
      stampsUrl,
      bankName,
      bankAccountName,
      bankAccountNumber,
      bankSwiftCode,
      bankIBAN,
      bankAddress,
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    try {
      setIsLoading(true);
      const formData = toFormData(data as Record<string, unknown>);
      const result = await updateProfile(null, formData);

      if (result.status === "success") {
        toast.success("Profile updated successfully");
      } else if (result.status === "error" && result.error) {
        toast.error(Object.values(result.error).flat().join(", "));
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while updating the profile");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl min-h-[760px]">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Update your personal information here</CardDescription>
        </div>
        <div className="flex-shrink-0 w-fit">
          <SubmitButton text="Update Profile" isLoading={isLoading} form="profile-form" />
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            id="profile-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto gap-1">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="company">Company Details</TabsTrigger>
                <TabsTrigger value="bank">Bank Details</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <PersonalTab form={form} email={email} />
              </TabsContent>

              <TabsContent value="company" className="space-y-4">
                <CompanyTab form={form} />
              </TabsContent>

              <TabsContent value="bank" className="space-y-4">
                <BankTab form={form} />
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

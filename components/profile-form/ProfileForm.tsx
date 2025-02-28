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
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubmitButton from "@/components/submit-button/SubmitButton";
import { updateProfile } from "@/app/actions/profile";
import { onboardingSchema } from "@/lib/zodSchemas";

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
      const formData = new FormData();

      // Add all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

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
          <CardDescription>
            Update your personal information here
          </CardDescription>
        </div>
        <div className="flex-shrink-0 w-fit">
          <SubmitButton
            text="Update Profile"
            isLoading={isLoading}
            form="profile-form"
          />
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="company">Company Details</TabsTrigger>
                <TabsTrigger value="bank">Bank Details</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 mt-4">
                      <div className="grid gap-2">
                        <FormLabel>Email</FormLabel>
                        <Input value={email} disabled className="bg-muted" />
                      </div>

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Street Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="company" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid gap-4">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your Company Name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="companyEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Email</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="company@example.com"
                                type="email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="companyAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Company Address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="companyTaxId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Tax ID</FormLabel>
                            <FormControl>
                              <Input placeholder="Tax ID Number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="companyLogoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Logo URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://example.com/logo.png"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="stampsUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stamps URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://example.com/stamps.png"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bank" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid gap-4">
                      <FormField
                        control={form.control}
                        name="bankName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Bank Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bankAccountName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Account Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bankAccountNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Account Number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bankSwiftCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Swift Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Swift Code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bankIBAN"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>IBAN</FormLabel>
                            <FormControl>
                              <Input placeholder="IBAN" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bankAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Bank Address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

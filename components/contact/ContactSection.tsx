"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { useActionState } from "react";
import { useForm } from "@conform-to/react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SubmitButton from "@/components/submit-button/SubmitButton";
import { submitContactForm } from "@/app/actions/contact";

const ContactSection = () => {
  const [lastResult, action] = useActionState(submitContactForm, null);
  const [form, fields] = useForm({
    lastResult,
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <section className="py-20">
      <div className="text-center mb-12">
        <span className="inline-block text-sm text-primary font-medium tracking-tight bg-primary/10 px-4 py-2 rounded-full">
          Get in Touch
        </span>
        <h2 className="mt-6 text-3xl font-bold tracking-tight">Contact Us</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Have questions? We&apos;re here to help you
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <form
              className="space-y-6"
              id={form.id}
              action={action}
              onSubmit={form.onSubmit}
              noValidate
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input
                    name={fields.firstName.name}
                    key={fields.firstName.key}
                    defaultValue={fields.firstName.initialValue as string}
                    placeholder="John"
                  />
                  <p className="text-red-500 text-sm">
                    {fields.firstName.errors}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input
                    name={fields.lastName.name}
                    key={fields.lastName.key}
                    defaultValue={fields.lastName.initialValue as string}
                    placeholder="Doe"
                  />
                  <p className="text-red-500 text-sm">
                    {fields.lastName.errors}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  name={fields.email.name}
                  key={fields.email.key}
                  defaultValue={fields.email.initialValue as string}
                  type="email"
                  placeholder="john@example.com"
                />
                <p className="text-red-500 text-sm">{fields.email.errors}</p>
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  name={fields.message.name}
                  key={fields.message.key}
                  defaultValue={fields.message.initialValue as string}
                  placeholder="Tell us how we can help..."
                  className="min-h-[150px]"
                />
                <p className="text-red-500 text-sm">{fields.message.errors}</p>
              </div>

              <div className="flex justify-end">
                <SubmitButton text="Send Message" />
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 flex items-start gap-4">
              <Mail className="size-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  hello@wemaad.com
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-start gap-4">
              <Phone className="size-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  +X (XXX) XXX-XXXX
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-start gap-4">
              <MapPin className="size-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Address</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  3, Makram Ebeid
                  <br />
                  Nasr City, Cairo Governorate, Egypt
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

"use client";

import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactForm } from "@/app/actions/contact";
import { ContactFormSubmit } from "./ContactFormSubmit";

export default function ContactSection() {
  return (
    <section className="py-20" aria-labelledby="contact-heading">
      <div className="text-center mb-12">
        <span className="inline-block text-sm text-primary font-medium tracking-tight bg-primary/10 px-4 py-2 rounded-full">
          Get in Touch
        </span>
        <h2
          id="contact-heading"
          className="mt-6 text-3xl font-bold tracking-tight"
        >
          Contact Us
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Have questions? We&apos;re here to help you
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <form
              action={async (formData: FormData) => {
                const result = await submitContactForm(formData);
                if (result.success) {
                  toast.success("Your message has been sent successfully!");
                } else {
                  toast.error(result.error);
                }
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us how we can help..."
                  className="min-h-[150px]"
                  required
                />
              </div>

              <div className="flex justify-end">
                <ContactFormSubmit />
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
}

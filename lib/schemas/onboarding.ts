import { z } from "zod";

export const onboardingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(1, "Address is required"),
  companyName: z.string().optional(),
  companyEmail: z.string().email("Invalid email address").optional(),
  companyAddress: z.string().optional(),
  companyTaxId: z.string().optional(),
  companyLogoUrl: z.string().url("Invalid URL").optional(),
  stampsUrl: z.string().url("Invalid URL").optional(),
  bankName: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankSwiftCode: z.string().optional(),
  bankIBAN: z.string().optional(),
  bankAddress: z.string().optional(),
});

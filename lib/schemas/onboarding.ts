import { z } from "zod";

export const onboardingSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100, "First name is too long"),
  lastName: z.string().min(1, "Last name is required").max(100, "Last name is too long"),
  address: z.string().min(1, "Address is required").max(500, "Address is too long"),
  companyName: z.string().max(200, "Company name is too long").optional(),
  companyEmail: z
    .union([z.literal(""), z.string().email("Invalid email address").max(254, "Email is too long")])
    .optional(),
  companyAddress: z.string().max(500, "Company address is too long").optional(),
  companyTaxId: z.string().max(50, "Tax ID is too long").optional(),
  companyLogoUrl: z
    .union([z.literal(""), z.string().url("Invalid URL")])
    .optional(),
  stampsUrl: z
    .union([z.literal(""), z.string().url("Invalid URL")])
    .optional(),
  bankName: z.string().max(200, "Bank name is too long").optional(),
  bankAccountName: z.string().max(200, "Account name is too long").optional(),
  bankAccountNumber: z.string().max(34, "Account number is too long").optional(),
  bankSwiftCode: z
    .union([
      z.literal(""),
      z
        .string()
        .regex(
          /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/i,
          "Invalid SWIFT/BIC code (must be 8 or 11 alphanumeric characters)"
        ),
    ])
    .optional(),
  bankIBAN: z
    .union([
      z.literal(""),
      z
        .string()
        .min(15, "IBAN must be at least 15 characters")
        .max(34, "IBAN must be at most 34 characters")
        .regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/i, "Invalid IBAN format"),
    ])
    .optional(),
  bankAddress: z.string().max(500, "Bank address is too long").optional(),
});

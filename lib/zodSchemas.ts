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

export const invoiceSchema = z.object({
  invoiceName: z.string().min(1, "Invoice Name is required"),
  total: z.number().min(1, "1$ is minimum"),

  status: z.enum(["PAID", "PENDING"]).default("PENDING"),

  date: z.string().min(1, "Date is required"),

  dueDate: z.number().min(0, "Due Date is required"),

  fromName: z.string().min(1, "Your name is required"),

  fromEmail: z.string().email("Invalid Email address"),

  fromAddress: z.string().min(1, "Your address is required"),

  clientId: z.string().min(1, "Client is required"),

  currency: z.string().min(1, "Currency is required"),

  invoiceNumber: z.number().min(1, "Minimum invoice number of 1"),

  note: z.string().optional(),

  invoiceItemDescription: z.string().min(1, "Description is required"),

  invoiceItemQuantity: z.number().min(1, "Quantity min 1"),

  invoiceItemRate: z.number().min(1, "Rate min 1"),
});

const addressSchema = z.object({
  type: z.enum(["BILLING", "SHIPPING", "OTHER"]),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  isDefault: z.boolean().default(false),
});

const contactPersonSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  position: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

const customFieldSchema = z.object({
  key: z.string().min(1, "Field name is required"),
  value: z.string().min(1, "Field value is required"),
});

export const clientFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().nullable(),
  phone: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  website: z.string().url("Invalid website URL").optional().nullable(),
  notes: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  addresses: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return [];
        }
      }
      return val;
    },
    z.array(addressSchema).min(1, "At least one address is required")
  ),
  contactPersons: z.preprocess((val) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return [];
      }
    }
    return val;
  }, z.array(contactPersonSchema)),
  customFields: z.preprocess((val) => {
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return [];
      }
    }
    return val;
  }, z.array(customFieldSchema)),
});

import { z } from "zod";

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
  }, z.array(contactPersonSchema).min(1, "At least one contact person is required")),
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

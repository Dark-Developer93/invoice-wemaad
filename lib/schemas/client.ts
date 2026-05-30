import { z } from "zod";

const addressSchema = z.object({
  type: z.enum(["BILLING", "SHIPPING", "OTHER"]),
  street: z.string().min(1, "Street is required").max(200, "Street is too long"),
  city: z.string().min(1, "City is required").max(100, "City is too long"),
  state: z.string().max(100, "State is too long").optional(),
  country: z.string().min(1, "Country is required").max(100, "Country is too long"),
  zipCode: z.string().min(1, "ZIP code is required").max(20, "ZIP code is too long"),
  isDefault: z.boolean().default(false),
});

const contactPersonSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100, "First name is too long"),
  lastName: z.string().min(1, "Last name is required").max(100, "Last name is too long"),
  email: z.string().email("Invalid email address").max(254, "Email is too long"),
  phone: z.string().max(20, "Phone number is too long").optional(),
  position: z.string().max(100, "Position is too long").optional(),
  isPrimary: z.boolean().default(false),
});

const customFieldSchema = z.object({
  key: z.string().min(1, "Field name is required").max(100, "Field name is too long"),
  value: z.string().min(1, "Field value is required").max(500, "Field value is too long"),
});

export const clientFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  email: z
    .union([z.literal(""), z.string().email("Invalid email address").max(254, "Email is too long")])
    .optional()
    .nullable(),
  phone: z.string().max(20, "Phone number is too long").optional().nullable(),
  taxId: z.string().max(50, "Tax ID is too long").optional().nullable(),
  website: z
    .union([z.literal(""), z.string().url("Invalid website URL")])
    .optional()
    .nullable(),
  notes: z.string().max(2000, "Notes are too long").optional().nullable(),
  category: z.string().max(100, "Category is too long").optional().nullable(),
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
  }, z.array(customFieldSchema).max(20, "Too many custom fields (maximum 20)")),
});

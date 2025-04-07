import { z } from "zod";

export const addressSchema = z.object({
  name: z.string()
    .min(3, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),
  last_name: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name must not exceed 50 characters"),
  street: z.string()
    .min(3, "Street address is required")
    .max(100, "Street address must not exceed 100 characters"),
  apartment: z.string().optional(),
  company_name: z.string().optional(),
  town: z.string()
    .min(3, "Town/City is required")
    .max(50, "Town/City must not exceed 50 characters"),
  county: z.string()
    .min(1, "County/Region is required")
    .max(50, "County/Region must not exceed 50 characters"),
  post_code: z.string()
    .min(1, "Postcode is required")
    .max(20, "Postcode must not exceed 20 characters")
    .regex(
      /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i,
      "Please enter a valid UK postcode"
    ),
  country: z.string()
    .min(1, "Country is required")
    .max(50, "Country must not exceed 50 characters"),
  phone: z.string()
    .refine((val) => val === '' || /^\d{10}$/.test(val), {
      message: "Phone number must be 10 digits"
    })
    .optional(),
});

export type AddressFormData = z.infer<typeof addressSchema>;


import { z } from "zod";

export const addressSchema = z.object({
  name: z.string()
    .min(3, "First name is required")
    .max(50, "First name must not exceed 50 characters")
    .refine((val) => val.trim().length > 0, {
      message: "First name cannot be only whitespace"
    }),
  last_name: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name must not exceed 50 characters")
    .refine((val) => val.trim().length > 0, {
      message: "Last name cannot be only whitespace"
    }),

  street: z.string()
    .min(3, "Street address is required")
    .max(255, "Street address must not exceed 100 characters")
    .refine((val) => val.trim().length > 0, {
      message: "Street address cannot be only whitespace"
    }),
  apartment: z.string().optional(),
  company_name: z.string().optional(),
  town: z.string()
    .min(3, "Town/City is required")
    .max(50, "Town/City must not exceed 50 characters")
    .refine((val) => val.trim().length > 0, {
      message: "Town/City cannot be only whitespace"
    }),

  region: z.string()
    .min(1, "Region is required")
    .max(50, "Region must not exceed 50 characters")
    .refine((val) => val.trim().length > 0, {
      message: "Region cannot be only whitespace"
    }),
  post_code: z.string()
    .min(1, "Postcode is required")
    .max(20, "Postcode must not exceed 20 characters")
    .regex(
      /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i,
      "Please enter a valid UK postcode"
    ),
  country: z.string()
    .min(1, "Country is required")
    .max(50, "Country must not exceed 50 characters")
    .refine((val) => val.trim().length > 0, {
      message: "Country cannot be only whitespace"
    }),
  phone: z.string()
    .refine((val) => val === '' || /^(\S+)?((((\+44\s?([0–6]|[8–9])\d{3} | \(?0([0–6]|[8–9])\d{3}\)?)\s?\d{3}\s?(\d{2}|\d{3}))|((\+44\s?([0–6]|[8–9])\d{3}|\(?0([0–6]|[8–9])\d{3}\)?)\s?\d{3}\s?(\d{4}|\d{3}))|((\+44\s?([0–6]|[8–9])\d{1}|\(?0([0–6]|[8–9])\d{1}\)?)\s?\d{4}\s?(\d{4}|\d{3}))|((\+44\s?\d{4}|\(?0\d{4}\)?)\s?\d{3}\s?\d{3})|((\+44\s?\d{3}|\(?0\d{3}\)?)\s?\d{3}\s?\d{4})|((\+44\s?\d{2}|\(?0\d{2}\)?)\s?\d{4}\s?\d{4})))$/.test(val), {
      message: "Please enter a valid UK phone number"
    })
    .optional(),
});

export type AddressFormData = z.infer<typeof addressSchema>;


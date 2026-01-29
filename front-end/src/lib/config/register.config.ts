import { z } from 'zod';
import { ValidationMessage } from '@/lib/config/form.config';
import { zodPasswordValidator } from '@/lib/validators/password.validator';

// * Zod Form Schemas
export const SIGN_UP_SCHEMA = z
  .object({
    email: z
      .string({
        required_error: ValidationMessage.EMAIL,
      })
      .min(1, ValidationMessage.EMAIL)
      .max(100, "Email must be less than 100 characters")
      .email('Please enter a valid email address'),
    phone: z
      .string({
        required_error: ValidationMessage.PHONE,
      })
      .min(1, ValidationMessage.PHONE)
      .refine((val) => /^(\S+)?((((\+44\s?([0–6]|[8–9])\d{3} | \(?0([0–6]|[8–9])\d{3}\)?)\s?\d{3}\s?(\d{2}|\d{3}))|((\+44\s?([0–6]|[8–9])\d{3}|\(?0([0–6]|[8–9])\d{3}\)?)\s?\d{3}\s?(\d{4}|\d{3}))|((\+44\s?([0–6]|[8–9])\d{1}|\(?0([0–6]|[8–9])\d{1}\)?)\s?\d{4}\s?(\d{4}|\d{3}))|((\+44\s?\d{4}|\(?0\d{4}\)?)\s?\d{3}\s?\d{3})|((\+44\s?\d{3}|\(?0\d{3}\)?)\s?\d{3}\s?\d{4})|((\+44\s?\d{2}|\(?0\d{2}\)?)\s?\d{4}\s?\d{4})))$/.test(val), {
        message: "Please enter a valid UK phone number"
      }),
    password: zodPasswordValidator(),
    confirmPassword: z
      .string({
        required_error: ValidationMessage.CONFIRM_PASSWORD,
      })
      .min(1, ValidationMessage.CONFIRM_PASSWORD)
      .max(16, "Confirm Password must be less than 16 characters"),
    mail_subscription: z.boolean().optional().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords does not match',
    path: ['confirmPassword'],
  });

export type SignUpFormSchema = z.infer<typeof SIGN_UP_SCHEMA>;

// * Constants
export const SIGN_UP_FORM_CONFIG = {
  EMAIL: {
    LABEL: 'Email',
    PH: 'Enter email address',
    TYPE: 'email',
  },
  PHONE: {
    LABEL: 'Phone',
    PH: 'Enter phone number',
    TYPE: 'tel',
  },
  PASSWORD: {
    LABEL: 'Password',
    PH: 'Enter password',
    TYPE: 'password',
  },
  CONFIRM_PASSWORD: {
    LABEL: 'Confirm Password',
    PH: 'Confirm password',
    TYPE: 'password',
  },
};

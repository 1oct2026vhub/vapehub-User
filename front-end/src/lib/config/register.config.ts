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
    password: zodPasswordValidator(),
    confirmPassword: z
      .string({
        required_error: ValidationMessage.CONFIRM_PASSWORD,
      })
      .min(1, ValidationMessage.CONFIRM_PASSWORD)
      .max(16, "Confirm Password must be less than 16 characters"),
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

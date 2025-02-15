import { z } from 'zod';
import { DEFAULT_REQUIRED_ERROR } from '@/lib/config/form.config';
import { zodPasswordValidator } from '@/lib/validators/password.validator';

// * Zod Form Schemas
export const SIGN_UP_SCHEMA = z
  .object({
    email: z
      .string({
        required_error: DEFAULT_REQUIRED_ERROR,
      })
      .min(1, DEFAULT_REQUIRED_ERROR)
      .email('Please enter a valid email address'),
    password: zodPasswordValidator(),
    confirmPassword: z
      .string({
        required_error: DEFAULT_REQUIRED_ERROR,
      })
      .min(1, DEFAULT_REQUIRED_ERROR) 
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password does not match',
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

import { z } from 'zod';
import { DEFAULT_REQUIRED_ERROR } from './form.config';

// * Zod Form Schemas
export const SIGN_IN_SCHEMA = z.object({
  email: z
    .string({
      required_error: DEFAULT_REQUIRED_ERROR,
    })
    .min(1, DEFAULT_REQUIRED_ERROR)
    .email('Please enter a valid email address'),
  password: z
    .string({
      required_error: DEFAULT_REQUIRED_ERROR,
    })
    .min(1, DEFAULT_REQUIRED_ERROR)
    .min(8, 'Password must be at least 8 characters'),
});

export type SignInFormSchema = z.infer<typeof SIGN_IN_SCHEMA>;

// * Constants
export const SIGN_IN_FORM_CONFIG = {
  EMAIL: {
    LABEL: 'Email or Username',
    PH: 'Enter email address',
    TYPE: 'email',
  },
  PASSWORD: {
    LABEL: 'Password',
    PH: 'Enter password',
    TYPE: 'password',
  },
};

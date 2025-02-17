import { z } from 'zod';
import { ValidationMessage } from './form.config';

// * Zod Form Schemas
export const SIGN_IN_SCHEMA = z.object({
  email: z
    .string({
      required_error: ValidationMessage.EMAIL,
    })
    .min(1, ValidationMessage.EMAIL)
    .max(100, "Email must be less than 100 characters")
    .email('Please enter a valid email address'),
    
  password: z
    .string({
      required_error: ValidationMessage.PASSWORD,
    })
    .min(1, ValidationMessage.PASSWORD)
    .max(16, "Password must be less than 16 characters"),
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

import { z } from 'zod';
import { ValidationMessage } from './form.config';

// * Zod Form Schemas
export const SUBSCRIBE_IN_SCHEMA = z.object({
  email: z
    .string({
      required_error: ValidationMessage.EMAIL,
    })
    .min(1, ValidationMessage.EMAIL)
    .max(100, "Email must be less than 100 characters")
    .email('Please enter a valid email address'),
  
});

export type SubscribeFormSchema = z.infer<typeof SUBSCRIBE_IN_SCHEMA>;

// * Constants
export const SUBSCRIBE_FORM_CONFIG = {
  EMAIL: {
    LABEL: 'Email or Username',
    PH: 'Email address',
    TYPE: 'email',
  },
  
};

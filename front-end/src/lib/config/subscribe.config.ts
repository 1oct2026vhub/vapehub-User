import { z } from 'zod';
import { DEFAULT_REQUIRED_ERROR } from './form.config';

// * Zod Form Schemas
export const SUBSCRIBE_IN_SCHEMA = z.object({
  email: z
    .string({
      required_error: DEFAULT_REQUIRED_ERROR,
    })
    .min(1, DEFAULT_REQUIRED_ERROR)
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

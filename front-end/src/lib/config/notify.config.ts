import { z } from 'zod';
import { ValidationMessage } from './form.config';

export const NOTIFY_ME_SCHEMA = z.object({
  email: z
    .string({
      required_error: ValidationMessage.EMAIL,
    })
    .min(1, ValidationMessage.EMAIL)
    .max(100, 'Email must be less than 100 characters')
    .email('Please enter a valid email address'),
  marketing_opt_in: z.boolean().optional().default(false),
});

export type NotifyMeFormSchema = z.infer<typeof NOTIFY_ME_SCHEMA>;

export interface NotifyMePayload {
  email: string;
  marketing_opt_in?: boolean;
}

export interface NotifyMeResponse {
  product_id: number;
  email: string;
  already_subscribed: boolean;
}

export const NOTIFY_ME_FORM_CONFIG = {
  EMAIL: {
    LABEL: 'EMAIL',
    PH: 'Insert your email',
    TYPE: 'email' as const,
  },
};

import { z } from "zod";
import { ValidationMessage } from '@/lib/config/form.config';
import { zodPasswordValidator } from '@/lib/validators/password.validator';

// * Reset Password
export const RESET_PASSWORD_SCHEMA = z.object({
    email: z
      .string({
        required_error: ValidationMessage.EMAIL,
      })
      .min(1, ValidationMessage.EMAIL)
      .max(100, "Email must be less than 100 characters")
      .email('Please enter a valid email address'),
  });
  
  export type ResetPasswordFormSchema = z.infer<typeof RESET_PASSWORD_SCHEMA>;

  export const RESET_PASSWORD_FORM_CONFIG = {
    EMAIL: {
      LABEL: 'Email',
      PH: 'Enter email address',
      TYPE: 'email',
    },
  };
   
// * Change Password
export const CHANGE_PASSWORD_SCHEMA = z
.object({
  password: zodPasswordValidator(),
  confirmNewPassword: z
    .string({
      required_error: ValidationMessage.CONFIRM_PASSWORD,
    })
    .min(1, ValidationMessage.CONFIRM_PASSWORD)
    .max(16, "Confirm Password must be less than 16 characters")
})
.refine((data) => data.password === data.confirmNewPassword, {
  message: 'Passwords does not match',
  path: ['confirmNewPassword'],
});

export type ChangePasswordFormSchema = z.infer<typeof CHANGE_PASSWORD_SCHEMA>;

export const CHANGE_PASSWORD_FORM_CONFIG = {
  CURRENT_PASSWORD: {
    LABEL: 'Current password',
    PH: 'Enter current password',
    TYPE: 'password',
  },
  NEW_PASSWORD: {
    LABEL: 'New password',
    PH: 'Enter new password',
    TYPE: 'password',
  },
  CHANGE_PASSWORD: {
    LABEL: 'Confirm new password',
    PH: 'Confirm new password',
    TYPE: 'password',
  },
};
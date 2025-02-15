import { z } from "zod";
import { DEFAULT_REQUIRED_ERROR } from '@/lib/config/form.config';
import { zodPasswordValidator } from '@/lib/validators/password.validator';

// * Reset Password
export const RESET_PASSWORD_SCHEMA = z.object({
    email: z
      .string({
        required_error: DEFAULT_REQUIRED_ERROR,
      })
      .min(1, DEFAULT_REQUIRED_ERROR)
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
      required_error: DEFAULT_REQUIRED_ERROR,
    })
    .min(1, DEFAULT_REQUIRED_ERROR),
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
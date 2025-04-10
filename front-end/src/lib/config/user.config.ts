import { z } from "zod";
import { zodPasswordValidator } from "../validators/password.validator";
import { ValidationMessage } from '@/lib/config/form.config';

export interface UserProfileResponse {
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
  }


  export interface UpdateUserProfilePayload {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  }
 

export const userProfileSchema = z.object({
  first_name: z.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),
  last_name: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name must not exceed 50 characters"),
  email: z.string()
    .email("Invalid email address"),
  phone: z.string()
    .regex(/^(\S+)?((((\+44\s?([0–6]|[8–9])\d{3} | \(?0([0–6]|[8–9])\d{3}\)?)\s?\d{3}\s?(\d{2}|\d{3}))|((\+44\s?([0–6]|[8–9])\d{3}|\(?0([0–6]|[8–9])\d{3}\)?)\s?\d{3}\s?(\d{4}|\d{3}))|((\+44\s?([0–6]|[8–9])\d{1}|\(?0([0–6]|[8–9])\d{1}\)?)\s?\d{4}\s?(\d{4}|\d{3}))|((\+44\s?\d{4}|\(?0\d{4}\)?)\s?\d{3}\s?\d{3})|((\+44\s?\d{3}|\(?0\d{3}\)?)\s?\d{3}\s?\d{4})|((\+44\s?\d{2}|\(?0\d{2}\)?)\s?\d{4}\s?\d{4})))$/, "Please enter a valid UK phone number")
})

export type UserProfileFormData = z.infer<typeof userProfileSchema>
 

export type USER_ADDRESS_PAYLOAD = {
  name: string;
  last_name: string;
  company_name: string;
  country: string;
  street: string;
  apartment: string;
  town: string; 
  region: string;
  post_code: string;
  phone: string;
}
export interface Address {
  id: number;
  name: string;
  last_name: string;
  company_name: string;
  country: string;
  street: string;
  apartment: string;
  town: string; 
  region: string;
  post_code: string;
  phone: string;
} 
export interface USER_ADDRESS_RESPONSE {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  UserAddresses: Address[];
}
export type ChangeUserPasswordPayload = {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const changeUserPasswordSchema = z.object({
  currentPassword: z.string().min(1, ValidationMessage.PASSWORD)
  .max(16, "Password must be less than 16 characters"),
  newPassword: zodPasswordValidator(),
  confirmPassword: z.string({
    required_error: ValidationMessage.CONFIRM_PASSWORD,
  })
  .min(1, ValidationMessage.CONFIRM_PASSWORD)
  .max(16, "Confirm Password must be less than 16 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords does not match',
  path: ['confirmPassword'],
});

export type ChangeUserPasswordFormData = z.infer<typeof changeUserPasswordSchema>


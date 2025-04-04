import { z } from "zod";

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
    .regex(/^\d{10}$/, "Phone number must be 10 digits")
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
  county: string;
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
  county: string;
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
  currentPassword: z.string().min(8, "Current password must be at least 8 characters"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
})

export type ChangeUserPasswordFormData = z.infer<typeof changeUserPasswordSchema>


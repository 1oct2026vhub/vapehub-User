import { z } from 'zod';
import { ValidationMessage } from '@/lib/config/form.config';

export function zodPasswordValidator() {
  return z
    .string({
      required_error: ValidationMessage.PASSWORD,
    })
    .max(16, "Password must be less than 16 characters")
    .refine(
      (password) => {
        const hasMinimumLength = password.trim().length >= 8;

        // At least 1 uppercase letter
        const hasUpperCase = /[A-Z]/.test(password);

        // At least 1 lowercase letter
        const hasLowerCase = /[a-z]/.test(password);

        // At least 1 special character (customize the character set based on your requirements)
        const hasSpecialChar = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]/.test(password);

        // At least 1 digit
        const hasDigit = /\d/.test(password);

        return (
          hasMinimumLength &&
          hasUpperCase &&
          hasLowerCase &&
          hasSpecialChar &&
          hasDigit
        );
      },
      {
        message: ValidationMessage.PASSWORD,
      }
    );
}

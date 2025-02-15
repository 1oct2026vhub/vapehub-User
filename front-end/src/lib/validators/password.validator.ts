import { z } from 'zod';
import { DEFAULT_REQUIRED_ERROR } from '@/lib/config/form.config';

export function zodPasswordValidator() {
  return z
    .string({
      required_error: DEFAULT_REQUIRED_ERROR,
    })
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
        message: DEFAULT_REQUIRED_ERROR,
      }
    );
}

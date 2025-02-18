import { KeyboardEvent } from 'react';

// * Types
export type PasswordStrengthTypes =
  | 'upperCase'
  | 'lowerCase'
  | 'specialCh'
  | 'totalNumber'
  | 'length';

export type PasswordStrengthMessage = Record<PasswordStrengthTypes, string>;

export type PasswordStrengthStatus = Record<PasswordStrengthTypes, boolean>;

// * Constants
export const PASSWORD_STRENGTH_MESSAGE: PasswordStrengthMessage = {
  upperCase: 'Must contain 1 uppercase',
  lowerCase: 'Must contain 1 lowercase',
  specialCh: 'Must contain a special character',
  totalNumber: 'Must contain at least 1 number',
  length: 'Must be at least 8 characters long',
};

export const DEFAULT_PASSWORD_STATUS = {
  upperCase: false,
  lowerCase: false,
  specialCh: false,
  totalNumber: false,
  length: false,
};

export const DEFAULT_REQUIRED_ERROR = 'Required';

export enum ValidationMessage {
  EMAIL = 'Email is required',
  PASSWORD = 'Password is required',
  CONFIRM_PASSWORD = 'Confirm Password is required',
}

// * Helper methods
/**
 * Function to restrict input to numeric characters.
 * @param {KeyboardEvent<HTMLInputElement>} event - The keyboard event object.
 * @param {boolean} [allowPlusCharacter] - Optional flag to allow the plus character ('+') input.
 */
export const numericField = (
  event: KeyboardEvent<HTMLInputElement>,
  allowPlusCharacter?: boolean
) => {
  // * To allow the plus character ('+') input.
  if (allowPlusCharacter && event.key === '+') {
    return;
  }

  // * To allow cut copy and paste
  if (
    ['v', 'x', 'a'].includes(event.key.toLowerCase()) &&
    (event.ctrlKey || event.metaKey)
  ) {
    return;
  }

  if (
    !/^\d$/.test(event.key) &&
    ![
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Enter',
    ].includes(event.key)
  ) {
    event.preventDefault();
  }
};

/**
 * * Build FormData payload from a given object
 * @param data
 */
export const buildFormData = <T extends object>(data: T): FormData => {
  const formData = new FormData();
  const objectEntries = Object.entries(data);
  if (objectEntries.length) {
    objectEntries.forEach(([_key, _value]) => {
      formData.append(_key, _value ?? '');
    });
  }

  return formData;
};

/**
 * Handles the paste event on a numeric field, allowing only numeric characters to be pasted.
 * @param {ClipboardEvent} clipboardEvent - The clipboard event object.
 * @param {boolean} [allowPlusCharacter] - Optional flag to allow the plus character ('+') input.
 */
export const handlePasteOnNumericField = (
  clipboardEvent: ClipboardEvent,
  allowPlusCharacter?: boolean
) => {
  const clipboardData = clipboardEvent.clipboardData;

  const pastedText = clipboardData?.getData('text') ?? '';

  const pasteRegex = allowPlusCharacter ? /^\+?\d+$/ : /^\d+$/;

  if (!pasteRegex.test(pastedText)) {
    clipboardEvent.preventDefault();
  }
};

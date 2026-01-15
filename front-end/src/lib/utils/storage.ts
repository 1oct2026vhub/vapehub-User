/**
 * Utility functions for localStorage operations
 * Provides a safe wrapper around localStorage with error handling
 */

const STORAGE_KEYS = {
  GUEST_CART: 'guest_cart',
} as const;

/**
 * Safely get item from localStorage
 */
export const getLocalStorageItem = <T>(key: string): T | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const item = window.localStorage.getItem(key);
    if (!item) {
      return null;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return null;
  }
};

/**
 * Safely set item in localStorage
 */
export const setLocalStorageItem = <T>(key: string, value: T): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded. Consider clearing old data.');
    }
    return false;
  }
};

/**
 * Safely remove item from localStorage
 */
export const removeLocalStorageItem = (key: string): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
    return false;
  }
};

/**
 * Guest cart specific helpers
 */
export const getGuestCart = <T>(): T | null => {
  return getLocalStorageItem<T>(STORAGE_KEYS.GUEST_CART);
};

export const setGuestCart = <T>(cart: T): boolean => {
  return setLocalStorageItem(STORAGE_KEYS.GUEST_CART, cart);
};

export const removeGuestCart = (): boolean => {
  return removeLocalStorageItem(STORAGE_KEYS.GUEST_CART);
};

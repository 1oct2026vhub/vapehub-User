'use client';

import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import { Undefined } from '@/lib/config/app.config';

const PASSWORD_COOKIE_NAME = 'psw-vape-client';

const EMAIL_COOKIE_NAME = 'eml-vape-client';

export const useRememberMe = (): {
  rememberMe: (email: string, password: string) => void;
  forgetMe: () => void;
  getRememberedCredentials: () => Undefined<{
    email: string;
    password: string;
  }>;
} => {
  const rememberMe = (userEmail: string, userPassword: string): void => {
    setCookie(EMAIL_COOKIE_NAME, userEmail);
    setCookie(PASSWORD_COOKIE_NAME, userPassword);
  };

  const forgetMe = (): void => {
    deleteCookie(EMAIL_COOKIE_NAME);
    deleteCookie(PASSWORD_COOKIE_NAME);
  };

  const getRememberedCredentials = (): Undefined<{
    email: string;
    password: string;
  }> => {
    const email = getCookie(EMAIL_COOKIE_NAME) as string;
    const password = getCookie(PASSWORD_COOKIE_NAME) as string;
    return !email || !password
      ? undefined
      : {
          email,
          password,
        };
  };

  return {
    rememberMe,
    forgetMe,
    getRememberedCredentials,
  };
};

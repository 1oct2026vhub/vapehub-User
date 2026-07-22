'use client';

import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import { Undefined } from '@/lib/config/app.config';

const PASSWORD_COOKIE_NAME = 'psw-vape-client';
const EMAIL_COOKIE_NAME = 'eml-vape-client';

/** App-scoped secret used only to obfuscate remember-me cookie values (never sent to the server). */
const CREDENTIAL_SECRET = 'vape-hub-remember-me-v1';

const HEX_PATTERN = /^[0-9a-f]+$/i;

const toHex = (buffer: ArrayBuffer | Uint8Array): string => {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

const fromHex = (hex: string): Uint8Array => {
  const pairs = hex.match(/.{1,2}/g);
  if (!pairs) {
    throw new Error('Invalid hex');
  }
  return new Uint8Array(pairs.map((byte) => parseInt(byte, 16)));
};

const getCryptoKey = async (): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(CREDENTIAL_SECRET),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('vape-hub-remember-me-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

/** Encrypts a value into a hex string (hash-like) so cookies never store plain text. */
const toHashFormat = async (value: string): Promise<string> => {
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(value)
  );

  return `${toHex(iv)}${toHex(cipherBuffer)}`;
};

/** Decrypts a hash-format cookie value back to the original string. */
const fromHashFormat = async (hashedValue: string): Promise<string | undefined> => {
  if (!hashedValue || !HEX_PATTERN.test(hashedValue) || hashedValue.length < 32) {
    return undefined;
  }

  try {
    const key = await getCryptoKey();
    const bytes = fromHex(hashedValue);
    const iv = bytes.slice(0, 12);
    const cipher = bytes.slice(12);
    const plainBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      cipher
    );

    return new TextDecoder().decode(plainBuffer);
  } catch {
    return undefined;
  }
};

export const useRememberMe = (): {
  rememberMe: (email: string, password: string) => Promise<void>;
  forgetMe: () => void;
  getRememberedCredentials: () => Promise<
    Undefined<{
      email: string;
      password: string;
    }>
  >;
} => {
  const rememberMe = async (userEmail: string, userPassword: string): Promise<void> => {
    const [hashedEmail, hashedPassword] = await Promise.all([
      toHashFormat(userEmail),
      toHashFormat(userPassword),
    ]);

    setCookie(EMAIL_COOKIE_NAME, hashedEmail);
    setCookie(PASSWORD_COOKIE_NAME, hashedPassword);
  };

  const forgetMe = (): void => {
    deleteCookie(EMAIL_COOKIE_NAME);
    deleteCookie(PASSWORD_COOKIE_NAME);
  };

  const getRememberedCredentials = async (): Promise<
    Undefined<{
      email: string;
      password: string;
    }>
  > => {
    const storedEmail = getCookie(EMAIL_COOKIE_NAME) as string | undefined;
    const storedPassword = getCookie(PASSWORD_COOKIE_NAME) as string | undefined;

    if (!storedEmail || !storedPassword) {
      return undefined;
    }

    const [email, password] = await Promise.all([
      fromHashFormat(storedEmail),
      fromHashFormat(storedPassword),
    ]);

    // Legacy plain-text cookies (or tampered values) cannot be used safely — clear them.
    if (!email || !password) {
      forgetMe();
      return undefined;
    }

    return { email, password };
  };

  return {
    rememberMe,
    forgetMe,
    getRememberedCredentials,
  };
};

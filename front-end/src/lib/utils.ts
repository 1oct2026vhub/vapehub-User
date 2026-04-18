import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const FREE_DELIVERY_THRESHOLD: number = 30;

/** Snap a monetary amount to whole pence (fixes float drift from summing line items). */
export function roundCurrency(value: unknown): number {
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

/**
 * True when order value meets free-shipping threshold, using whole pence to avoid float drift
 * (e.g. cart sum 29.999… vs threshold 30).
 */
export function orderMeetsFreeShippingThreshold(
  orderTotal: number,
  threshold: number | string | null | undefined
): boolean {
  if (threshold == null || String(threshold).trim() === '') {
    return true;
  }
  const t = typeof threshold === 'number' ? threshold : parseFloat(String(threshold));
  if (!Number.isFinite(t) || t <= 0) {
    return true;
  }
  const orderPence = Math.round(orderTotal * 100);
  const thresholdPence = Math.round(t * 100);
  return orderPence >= thresholdPence;
}

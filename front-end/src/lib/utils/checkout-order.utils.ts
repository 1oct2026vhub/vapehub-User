import { z } from 'zod'
import type { CHECKOUT_FORM_TYPE, CHECKOUT_PAYLOAD } from '@/lib/config/checkout.config'
import { getDefaultCheckoutPaymentMethod } from '@/lib/config/checkout.config'
import type { GUEST_CHECKOUT_AND_ORDER_PAYLOAD } from '@/lib/config/checkout.config'
import { DEFAULT_COUNTRY } from '@/lib/utils/address.utils'
import { orderMeetsFreeShippingThreshold } from '@/lib/utils'
import type { ORDER, REFERRAL, SHIPPING_METHOD_DATA } from '@/lib/config/order.config'
import type { Address } from '@/lib/config/user.config'

/** Slice of coupon state used for order totals (matches CartContext / CartTotal shape). */
export type CheckoutCouponSlice = {
  isApplied: boolean
  value?: number
  mailSubscriptionDiscount?: number
}

export type CheckoutLoyaltySlice = {
  isRedeemed: boolean
  discountValue?: number | null
}

/** Parse API money fields that may be number, numeric string, or formatted currency strings. */
export function parseApiMoney(value: unknown): number {
  if (value == null) return 0
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value === 'string') {
    const n = parseFloat(value.replace(/[^\d.-]/g, ''))
    return Number.isFinite(n) ? n : 0
  }
  return 0
}

/**
 * Net merchandise total before shipping: cart (with deals) − coupon − mail subscription − loyalty.
 * Used for free-shipping threshold checks (same basis as CartTotal display, excluding shipping).
 */
export function calculateOrderTotalBeforeShipping(
  cartTotal: number,
  couponDiscount: CheckoutCouponSlice,
  loyalty: CheckoutLoyaltySlice
): number {
  const displaySubTotal = Number.isFinite(cartTotal) && cartTotal > 0 ? cartTotal : 0
  const mailSubscriptionDiscount =
    couponDiscount.mailSubscriptionDiscount !== undefined &&
    Number.isFinite(couponDiscount.mailSubscriptionDiscount)
      ? couponDiscount.mailSubscriptionDiscount
      : 0
  const couponValue = Number.isFinite(couponDiscount.value) ? (couponDiscount.value ?? 0) : 0
  const loyaltyValue =
    loyalty.isRedeemed && Number.isFinite(loyalty.discountValue) ? (loyalty.discountValue ?? 0) : 0
  const orderTotal = displaySubTotal - couponValue - mailSubscriptionDiscount - loyaltyValue
  return Number.isFinite(orderTotal) ? orderTotal : 0
}

/** Customer-facing grand total including shipping (matches consolidated CartTotal formula). */
export function calculateOrderGrandTotal(
  cartTotal: number,
  couponDiscount: CheckoutCouponSlice,
  loyalty: CheckoutLoyaltySlice,
  shippingCost: number
): number {
  const safeShipping = Number.isFinite(shippingCost) ? shippingCost : 0
  const net = calculateOrderTotalBeforeShipping(cartTotal, couponDiscount, loyalty)
  const total = net + safeShipping
  return Number.isFinite(total) ? total : 0
}

/**
 * Total sent on place-order / guest-checkout payloads (legacy behaviour: cart − coupon − loyalty only).
 * Backend may reconcile; keep aligned with previous client contract unless API changes.
 */
export function calculateCheckoutPayloadTotal(
  cartTotal: number,
  couponValue: number | undefined,
  loyaltyDiscountValue: number | undefined
): number {
  const sub = Number.isFinite(cartTotal) ? cartTotal : 0
  const coupon = Number.isFinite(couponValue) ? (couponValue ?? 0) : 0
  const loyalty = Number.isFinite(loyaltyDiscountValue) ? (loyaltyDiscountValue ?? 0) : 0
  const t = sub - coupon - loyalty
  return Number.isFinite(t) ? t : 0
}

export function buildAuthShippingAddress(
  data: CHECKOUT_FORM_TYPE
): CHECKOUT_PAYLOAD['shipping_address'] {
  return {
    first_name: data.shippingFirstName || '',
    last_name: data.shippingLastName || '',
    address_line_1: data.shippingAddress1 || '',
    address_line_2: data.shippingAddress2 || '',
    city: data.shippingCity || '',
    region: data.shippingRegion || '',
    country: data.shippingCountry || DEFAULT_COUNTRY,
    post_code: data.shippingPostcode || ''
  }
}

export function buildGuestShippingAddress(
  data: CHECKOUT_FORM_TYPE
): GUEST_CHECKOUT_AND_ORDER_PAYLOAD['shipping_address'] {
  return {
    ...buildAuthShippingAddress(data),
    shipping_address_id: null
  }
}

export function buildBillingAddressPayload(
  data: CHECKOUT_FORM_TYPE
): CHECKOUT_PAYLOAD['billing_address'] {
  const different = data.useDifferentBillingAddress
  return {
    first_name: !different ? data.shippingFirstName || '' : data.billingFirstName || '',
    last_name: !different ? data.shippingLastName || '' : data.billingLastName || '',
    address_line_1: !different ? data.shippingAddress1 || '' : data.billingAddress1 || '',
    address_line_2: !different ? data.shippingAddress2 || '' : data.billingAddress2 || '',
    city: !different ? data.shippingCity || '' : data.billingCity || '',
    region: !different ? data.shippingRegion || '' : data.billingRegion || '',
    country: !different ? data.shippingCountry || DEFAULT_COUNTRY : data.billingCountry || DEFAULT_COUNTRY,
    post_code: !different ? data.shippingPostcode || '' : data.billingPostcode || ''
  }
}

/** API field: true when billing matches shipping (inverse of “different billing” checkbox). */
export function toApiUseShippingAsBilling(data: CHECKOUT_FORM_TYPE): boolean {
  return !data.useDifferentBillingAddress
}

const worldPayOrderDataSchema = z.object({
  order_code: z.union([z.string(), z.number()]).transform((v) => String(v)),
  worldpay_url: z.string().min(1)
})

export function parseWorldPayPlaceOrderData(data: unknown): { order_code: string; worldpay_url: string } | null {
  const r = worldPayOrderDataSchema.safeParse(data)
  return r.success ? r.data : null
}

function mapOrderAddressToPayload(
  address: ORDER['orderShippingAddress'] | ORDER['orderBillingAddress']
): CHECKOUT_PAYLOAD['shipping_address'] {
  return {
    first_name: address.name,
    last_name: address.last_name,
    address_line_1: address.street,
    city: address.town,
    region: address.region || '',
    country: address.country || DEFAULT_COUNTRY,
    post_code: address.post_code,
  }
}

function orderAddressesMatch(
  shipping: ORDER['orderShippingAddress'],
  billing: ORDER['orderBillingAddress']
): boolean {
  return (
    shipping.name === billing.name &&
    shipping.last_name === billing.last_name &&
    shipping.street === billing.street &&
    shipping.town === billing.town &&
    shipping.post_code === billing.post_code &&
    shipping.region === billing.region &&
    shipping.country === billing.country
  )
}

function findShippingAddressId(order: ORDER, addresses?: Address[]): number {
  if (!addresses?.length) return 0

  const shipping = order.orderShippingAddress
  const match = addresses.find(
    (address) =>
      address.name === shipping.name &&
      address.last_name === shipping.last_name &&
      address.street === shipping.street &&
      address.town === shipping.town &&
      address.post_code === shipping.post_code &&
      address.region === shipping.region &&
      address.country === shipping.country
  )

  return match?.id ?? 0
}

/** Build POST /api/order payload from an existing pending order (Pay Now flow). */
export function buildPlaceOrderPayloadFromOrder(
  order: ORDER,
  options?: { referral?: REFERRAL | null; userAddresses?: Address[] }
): CHECKOUT_PAYLOAD {
  const shippingAddress = mapOrderAddressToPayload(order.orderShippingAddress)
  const billingAddress = mapOrderAddressToPayload(order.orderBillingAddress)
  const useShippingAsBilling = orderAddressesMatch(
    order.orderShippingAddress,
    order.orderBillingAddress
  )

  return {
    email: order.email,
    phone: order.phone,
    receive_promotions: false,
    shipping_address_id: findShippingAddressId(order, options?.userAddresses),
    couponCode: options?.referral?.coupon_code || undefined,
    shipping_method_id: order.shippingMethod.id,
    shipping_address: shippingAddress,
    billing_address: billingAddress,
    useShippingAsBilling,
    payment_method: {
      method: getDefaultCheckoutPaymentMethod(),
    },
    total: parseApiMoney(order.total),
  }
}

type EnabledShippingOptions = {
  enabledMethods: SHIPPING_METHOD_DATA[]
  filteredSortedMethods: SHIPPING_METHOD_DATA[]
  safeTotalForThreshold: number
}

/**
 * From raw API shipping list + cart/coupon state, derive enabled methods and threshold-filtered list.
 */
export function deriveShippingMethodsForCheckout(
  shippingMethodsData: SHIPPING_METHOD_DATA[] | undefined,
  cartTotal: number,
  couponDiscount: CheckoutCouponSlice,
  loyalty: CheckoutLoyaltySlice
): EnabledShippingOptions {
  if (!shippingMethodsData?.length) {
    return { enabledMethods: [], filteredSortedMethods: [], safeTotalForThreshold: 0 }
  }

  const enabledMethods = shippingMethodsData
    .filter((method) => method.is_enabled && !method.deletedAt)
    .sort((a, b) => a.method_order - b.method_order)

  const safeTotal = calculateOrderTotalBeforeShipping(cartTotal, couponDiscount, loyalty)

  const filteredMethods = enabledMethods.filter((method) => {
    const isEnabled = method.is_enabled ?? false
    const isFreeShipping = method.is_free_shipping ?? false
    const freeShippingThreshold = method.free_shipping_threshold

    if (!isEnabled) return false
    if (!isFreeShipping) return true

    if (!freeShippingThreshold) return true

    const threshold = parseFloat(freeShippingThreshold)
    if (Number.isFinite(threshold) && threshold > 0) {
      return orderMeetsFreeShippingThreshold(safeTotal, freeShippingThreshold)
    }
    return false
  })

  const sortedMethods = [...filteredMethods].sort((a, b) => {
    const aIsFree = a.is_free_shipping ?? false
    const bIsFree = b.is_free_shipping ?? false
    if (aIsFree && bIsFree) return 0
    if (aIsFree && !bIsFree) return -1
    if (!aIsFree && bIsFree) return 1
    return 0
  })

  return {
    enabledMethods,
    filteredSortedMethods: sortedMethods,
    safeTotalForThreshold: safeTotal
  }
}

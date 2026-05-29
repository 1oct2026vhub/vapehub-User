import { z } from 'zod'
import type { APPLY_COUPON_PAYLOAD, CHECKOUT_FORM_TYPE } from '@/lib/config/checkout.config'
import type { CHECKOUT_PAYLOAD, GUEST_CHECKOUT_AND_ORDER_PAYLOAD } from '@/lib/config/checkout.config'
import type { LoyaltyPointsRedemptionResponse } from '@/lib/config/loyalty-points.config'
import { DEFAULT_COUNTRY } from '@/lib/utils/address.utils'
import { orderMeetsFreeShippingThreshold } from '@/lib/utils'
import type { SHIPPING_METHOD_DATA } from '@/lib/config/order.config'

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

const parsePositiveIntId = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return Math.trunc(value)
  if (typeof value === 'string') {
    const n = Number(value.trim())
    if (Number.isFinite(n) && n > 0) return Math.trunc(n)
  }
  return null
}

/**
 * Shipping method id returned by apply-coupon (loyalty / pricing). Supports common API shapes.
 */
export function parseShippingMethodIdFromApplyCouponResponse(data: unknown): number | null {
  if (data == null || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  for (const key of ['shipping_method_id', 'shippingMethodId'] as const) {
    if (key in o) {
      const id = parsePositiveIntId(o[key])
      if (id != null) return id
    }
  }
  const nested = o.shippingMethod ?? o.shipping_method
  if (nested != null && typeof nested === 'object') {
    const sm = nested as Record<string, unknown>
    for (const key of ['id', 'shipping_method_id'] as const) {
      if (key in sm) {
        const id = parsePositiveIntId(sm[key])
        if (id != null) return id
      }
    }
  }
  return null
}

/** Apply-coupon body may use `shippingCost` or `shipping_cost`. */
export function parseShippingCostFromApplyCouponResponse(data: unknown): number {
  if (data == null || typeof data !== 'object') return 0
  const o = data as Record<string, unknown>
  const raw = o.shippingCost ?? o.shipping_cost
  return parseApiMoney(raw)
}

/** Grand total from apply-coupon; `null` when the field is absent. */
export function parseTotalFromApplyCouponResponse(data: unknown): number | null {
  if (data == null || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  if (!('total' in o) && !('grand_total' in o)) return null
  const n = parseApiMoney(o.total ?? o.grand_total)
  return Number.isFinite(n) ? n : null
}

/**
 * Shipping Cost row: prefer apply-coupon `shippingCost` when present (including £0); else catalog rate.
 */
export function resolveCheckoutShippingLineDisplayAmount(
  catalogShippingCost: number,
  applyCouponShippingCost: number | null | undefined
): number {
  if (
    applyCouponShippingCost !== null &&
    applyCouponShippingCost !== undefined &&
    Number.isFinite(applyCouponShippingCost)
  ) {
    return Math.max(0, applyCouponShippingCost)
  }
  return Number.isFinite(catalogShippingCost) ? Math.max(0, catalogShippingCost) : 0
}

/** `is_payment_required` from apply-coupon; `null` when the field is absent. */
export function parseIsPaymentRequiredFromApplyCouponResponse(data: unknown): boolean | null {
  if (data == null || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  if ('is_payment_required' in o && typeof o.is_payment_required === 'boolean') {
    return o.is_payment_required
  }
  if ('payment_required' in o && typeof o.payment_required === 'boolean') {
    return o.payment_required
  }
  return null
}

/** Include `is_payment_required` on place-order only when apply-coupon returned it. */
export function buildOrderIsPaymentRequiredFields(
  value: boolean | null | undefined
): { is_payment_required?: boolean } {
  if (value === null || value === undefined) return {}
  return { is_payment_required: value }
}

export function resolveIsPaymentRequiredForOrder(
  loyalty: { isRedeemed: boolean; applyCouponIsPaymentRequired: boolean | null },
  coupon: { isPaymentRequired?: boolean | null }
): boolean | null {
  if (loyalty.isRedeemed && loyalty.applyCouponIsPaymentRequired !== null) {
    return loyalty.applyCouponIsPaymentRequired
  }
  if (coupon.isPaymentRequired !== null && coupon.isPaymentRequired !== undefined) {
    return coupon.isPaymentRequired
  }
  return null
}

/** When loyalty apply-coupon returns £0 shipping, include catalog `is_free_shipping` methods even if basket is below threshold. */
export type LoyaltyApplyCouponShippingSnapshot = {
  isRedeemed: boolean
  applyCouponShippingCost: number | null
  applyCouponShippingMethodId: number | null
}

/** Clamp requested loyalty points to admin minimum and user balance. */
export function clampPointsToRedeemBounds(n: number, minPts: number, maxPts: number): number {
  const lo = Number.isFinite(minPts) ? Math.max(0, Math.floor(minPts)) : 0
  const hi = Number.isFinite(maxPts) ? Math.max(lo, Math.floor(maxPts)) : lo
  return Math.min(hi, Math.max(lo, Math.floor(n)))
}

export type LoyaltyCartEligibilityBlockingReason =
  | 'none'
  | 'insufficient_points'
  | 'below_min_loyalty_amount'
  | 'below_minimum_order_value'
  | 'api_disallowed'

/** Client-side eligibility from redemption API + current merchandise total (deal-discounted cart total). */
export type LoyaltyCartEligibility = {
  canRedeemOnCart: boolean
  meetsMinAmountForLoyaltyPoints: boolean
  meetsMinimumOrderValueToRedeem: boolean
  hasEnoughPoints: boolean
  minAmountForLoyaltyPoints: number
  minimumOrderValueToRedeem: number
  shortfallMinLoyaltyAmount: number
  shortfallMinOrderValue: number
  blockingReason: LoyaltyCartEligibilityBlockingReason
}

const EMPTY_LOYALTY_CART_ELIGIBILITY: LoyaltyCartEligibility = {
  canRedeemOnCart: false,
  meetsMinAmountForLoyaltyPoints: false,
  meetsMinimumOrderValueToRedeem: false,
  hasEnoughPoints: false,
  minAmountForLoyaltyPoints: 0,
  minimumOrderValueToRedeem: 0,
  shortfallMinLoyaltyAmount: 0,
  shortfallMinOrderValue: 0,
  blockingReason: 'api_disallowed',
}

export function evaluateLoyaltyRedemptionForCart(
  cartTotal: number,
  data: LoyaltyPointsRedemptionResponse | null
): LoyaltyCartEligibility {
  if (!data) return EMPTY_LOYALTY_CART_ELIGIBILITY

  const safeTotal = Number.isFinite(cartTotal) && cartTotal > 0 ? cartTotal : 0
  const minLoyalty = parseApiMoney(data.min_amount_for_loyalty_points)
  const minOrder = parseApiMoney(data.minimum_order_value_to_redeem)

  const meetsMinLoyalty = minLoyalty <= 0 || safeTotal >= minLoyalty
  const meetsMinOrder = minOrder <= 0 || safeTotal >= minOrder
  const hasEnoughPoints =
    data.has_enough_points !== undefined
      ? data.has_enough_points
      : data.user_points >= data.minimum_points_required

  let blockingReason: LoyaltyCartEligibilityBlockingReason = 'none'
  if (!hasEnoughPoints) {
    blockingReason = 'insufficient_points'
  } else if (!meetsMinLoyalty) {
    blockingReason = 'below_min_loyalty_amount'
  } else if (!meetsMinOrder) {
    blockingReason = 'below_minimum_order_value'
  } else if (!data.can_redeem) {
    blockingReason = 'api_disallowed'
  }

  // Cart total can change after redemption info was fetched; re-validate order minimums client-side.
  const canRedeemOnCart = hasEnoughPoints && meetsMinLoyalty && meetsMinOrder

  return {
    canRedeemOnCart,
    meetsMinAmountForLoyaltyPoints: meetsMinLoyalty,
    meetsMinimumOrderValueToRedeem: meetsMinOrder,
    hasEnoughPoints,
    minAmountForLoyaltyPoints: minLoyalty,
    minimumOrderValueToRedeem: minOrder,
    shortfallMinLoyaltyAmount: Math.max(0, minLoyalty - safeTotal),
    shortfallMinOrderValue: Math.max(0, minOrder - safeTotal),
    blockingReason: canRedeemOnCart ? 'none' : blockingReason,
  }
}

/** Session apply-coupon body: omit `points_to_redeem` to let the server redeem the maximum allowed. */
export function buildApplyCouponWithLoyalty(
  shippingMethodId: number,
  loyalty: boolean,
  pointsToRedeem: number | null | undefined,
  pointsData: LoyaltyPointsRedemptionResponse | null
): APPLY_COUPON_PAYLOAD {
  const base: APPLY_COUPON_PAYLOAD = { shippingMethodId, loyalty }
  if (!loyalty) return base
  if (pointsToRedeem == null) return base
  const raw = Math.floor(Number(pointsToRedeem))
  if (!Number.isFinite(raw)) return base
  const minPts = pointsData?.minimum_points_required ?? 0
  const maxPts = pointsData?.user_points ?? raw
  return { ...base, points_to_redeem: clampPointsToRedeemBounds(raw, minPts, maxPts) }
}

/** Place-order / guest-checkout loyalty fields (omit `points_to_redeem` for server-side maximum). */
export function buildOrderLoyaltyFields(
  isRedeemed: boolean,
  pointsToRedeem: number | null | undefined,
  pointsData: LoyaltyPointsRedemptionResponse | null
): { loyalty: boolean; points_to_redeem?: number } {
  if (!isRedeemed) return { loyalty: false }
  if (pointsToRedeem == null) return { loyalty: true }
  const raw = Math.floor(Number(pointsToRedeem))
  if (!Number.isFinite(raw)) return { loyalty: true }
  const minPts = pointsData?.minimum_points_required ?? 0
  const maxPts = pointsData?.user_points ?? raw
  return { loyalty: true, points_to_redeem: clampPointsToRedeemBounds(raw, minPts, maxPts) }
}

/** Cap loyalty so stale apply-coupon values cannot exceed merchandise subtotal. */
export function effectiveLoyaltyDiscountAmount(
  loyalty: CheckoutLoyaltySlice,
  merchandiseSubtotal: number
): number {
  if (!loyalty.isRedeemed) return 0
  const raw = Number.isFinite(loyalty.discountValue) ? (loyalty.discountValue ?? 0) : 0
  const cap = Number.isFinite(merchandiseSubtotal) && merchandiseSubtotal > 0 ? merchandiseSubtotal : 0
  return Math.min(Math.max(0, raw), cap)
}

/**
 * Catalog rules: optional min/max merchandise totals on a shipping method row.
 * Uses pre-discount cart subtotal (matches typical backend eligibility checks).
 */
export function isShippingMethodEligibleForMerchandiseTotal(
  method: SHIPPING_METHOD_DATA,
  merchandiseSubtotal: number
): boolean {
  const total = Number.isFinite(merchandiseSubtotal) && merchandiseSubtotal > 0 ? merchandiseSubtotal : 0

  const minRaw = method.min_order_total
  if (minRaw != null && String(minRaw).trim() !== '') {
    const min = parseFloat(String(minRaw))
    if (Number.isFinite(min) && min > 0 && total < min) return false
  }

  const maxRaw = method.max_order_total
  if (maxRaw != null && String(maxRaw).trim() !== '') {
    const max = parseFloat(String(maxRaw))
    if (Number.isFinite(max) && max > 0 && total > max) return false
  }

  return true
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
  const loyaltyValue = effectiveLoyaltyDiscountAmount(loyalty, displaySubTotal)
  const orderTotal = displaySubTotal - couponValue - mailSubscriptionDiscount - loyaltyValue
  return Number.isFinite(orderTotal) ? Math.max(0, orderTotal) : 0
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
 * Total sent on place-order / guest-checkout payloads (legacy: cart − coupon − loyalty; optional mail when loyalty uses apply-coupon snapshot).
 */
/** Place-order / guest-checkout total: prefer apply-coupon `total` when loyalty priced the order. */
export function resolveCheckoutPayloadTotal(
  cartTotal: number,
  couponValue: number | undefined,
  loyalty: { isRedeemed: boolean; discountValue?: number | null; applyCouponTotal?: number | null },
  mailSubscriptionDiscount?: number | undefined
): number {
  if (
    loyalty.isRedeemed &&
    loyalty.applyCouponTotal != null &&
    Number.isFinite(loyalty.applyCouponTotal)
  ) {
    return Math.max(0, loyalty.applyCouponTotal)
  }
  return calculateCheckoutPayloadTotal(
    cartTotal,
    couponValue,
    loyalty.discountValue ?? undefined,
    mailSubscriptionDiscount
  )
}

export function calculateCheckoutPayloadTotal(
  cartTotal: number,
  couponValue: number | undefined,
  loyaltyDiscountValue: number | undefined,
  mailSubscriptionDiscount?: number | undefined
): number {
  const sub = Number.isFinite(cartTotal) ? cartTotal : 0
  const coupon = Number.isFinite(couponValue) ? (couponValue ?? 0) : 0
  const loyalty = Number.isFinite(loyaltyDiscountValue) ? (loyaltyDiscountValue ?? 0) : 0
  const mail = Number.isFinite(mailSubscriptionDiscount) ? (mailSubscriptionDiscount ?? 0) : 0
  const t = sub - coupon - loyalty - mail
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

function pickNonEmptyUrl(...values: unknown[]): string | null {
  for (const v of values) {
    if (typeof v === 'string' && v.trim().length > 0) return v.trim()
  }
  return null
}

/** Place-order body: requires `order_code` and at least one redirect URL (`worldpay_url` or `payment_success_url`). */
export function parsePlaceOrderResponseData(
  data: unknown
): { order_code: string; worldpay_url: string | null; payment_success_url: string | null } | null {
  if (data == null || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  const orderCodeRaw = o.order_code
  if (orderCodeRaw == null || orderCodeRaw === '') return null
  const order_code = String(orderCodeRaw)

  const nested =
    o.order_details != null && typeof o.order_details === 'object'
      ? (o.order_details as Record<string, unknown>)
      : null

  const worldpay_url = pickNonEmptyUrl(o.worldpay_url)
  const payment_success_url = pickNonEmptyUrl(o.payment_success_url, nested?.payment_success_url)

  if (!worldpay_url && !payment_success_url) return null

  return { order_code, worldpay_url, payment_success_url }
}

/** WorldPay first; otherwise `payment_success_url` for zero-balance orders. */
export function resolvePlaceOrderRedirectUrl(data: unknown): string | null {
  const parsed = parsePlaceOrderResponseData(data)
  if (!parsed) return null
  return parsed.worldpay_url ?? parsed.payment_success_url
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
  loyalty: CheckoutLoyaltySlice,
  loyaltyApplyCouponSnapshot?: LoyaltyApplyCouponShippingSnapshot | null
): EnabledShippingOptions {
  if (!shippingMethodsData?.length) {
    return { enabledMethods: [], filteredSortedMethods: [], safeTotalForThreshold: 0 }
  }

  const enabledMethods = shippingMethodsData
    .filter((method) => method.is_enabled && !method.deletedAt)
    .sort((a, b) => a.method_order - b.method_order)

  const merchandiseSubtotal = Number.isFinite(cartTotal) && cartTotal > 0 ? cartTotal : 0
  const safeTotal = calculateOrderTotalBeforeShipping(cartTotal, couponDiscount, loyalty)

  const loyaltyZeroApplyCouponShipping =
    loyaltyApplyCouponSnapshot?.isRedeemed &&
    loyaltyApplyCouponSnapshot.applyCouponShippingCost !== null &&
    Number.isFinite(loyaltyApplyCouponSnapshot.applyCouponShippingCost) &&
    loyaltyApplyCouponSnapshot.applyCouponShippingCost === 0 &&
    safeTotal <= 0

  const filteredMethods = enabledMethods.filter((method) => {
    const isEnabled = method.is_enabled ?? false
    const isFreeShipping = method.is_free_shipping ?? false
    const freeShippingThreshold = method.free_shipping_threshold

    if (!isEnabled) return false
    if (!isShippingMethodEligibleForMerchandiseTotal(method, merchandiseSubtotal)) return false
    if (!isFreeShipping) return true

    if (!freeShippingThreshold) return true

    const threshold = parseFloat(freeShippingThreshold)
    if (Number.isFinite(threshold) && threshold > 0) {
      if (loyaltyZeroApplyCouponShipping) return true
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

/**
 * Default carrier for checkout / apply-coupon: prefer free shipping when listed, else keep current if still valid, else first option.
 */
export function pickCheckoutShippingMethod(
  filteredSortedMethods: SHIPPING_METHOD_DATA[],
  currentMethodId?: number | null
): SHIPPING_METHOD_DATA | null {
  if (!filteredSortedMethods.length) return null
  const freeShippingMethod = filteredSortedMethods.find((method) => method.is_free_shipping ?? false)
  const matchedMethod = currentMethodId
    ? filteredSortedMethods.find((method) => method.id === currentMethodId)
    : undefined
  return freeShippingMethod ?? matchedMethod ?? filteredSortedMethods[0]
}

/**
 * Shipping method id for apply-coupon: derived from cart + discounts, not a stale UI selection.
 * Pass `loyaltyApplyCouponSnapshot: undefined` after quantity/cart changes so old API shipping ids are not reused.
 */
export function resolveShippingMethodIdForApplyCoupon(
  shippingMethodsData: SHIPPING_METHOD_DATA[] | undefined,
  cartTotal: number,
  couponDiscount: CheckoutCouponSlice,
  loyalty: CheckoutLoyaltySlice,
  loyaltyApplyCouponSnapshot?: LoyaltyApplyCouponShippingSnapshot | null,
  fallbackMethodId?: number | null
): number {
  const { filteredSortedMethods } = deriveShippingMethodsForCheckout(
    shippingMethodsData,
    cartTotal,
    couponDiscount,
    loyalty,
    loyaltyApplyCouponSnapshot
  )

  if (!filteredSortedMethods.length) {
    const fb = fallbackMethodId != null ? Number(fallbackMethodId) : 0
    return Number.isFinite(fb) && fb > 0 ? Math.trunc(fb) : 0
  }

  const apiId = loyaltyApplyCouponSnapshot?.applyCouponShippingMethodId
  if (apiId != null && apiId > 0 && filteredSortedMethods.some((m) => m.id === apiId)) {
    return Math.trunc(apiId)
  }

  const picked = pickCheckoutShippingMethod(filteredSortedMethods, fallbackMethodId ?? null)
  const id = picked?.id != null ? Number(picked.id) : 0
  return Number.isFinite(id) && id > 0 ? Math.trunc(id) : 0
}

/** Ordered method ids valid for the current cart (used for apply-coupon retries). */
export function listShippingMethodIdsForApplyCoupon(
  shippingMethodsData: SHIPPING_METHOD_DATA[] | undefined,
  cartTotal: number,
  couponDiscount: CheckoutCouponSlice,
  loyalty: CheckoutLoyaltySlice,
  loyaltyApplyCouponSnapshot?: LoyaltyApplyCouponShippingSnapshot | null
): number[] {
  const { filteredSortedMethods } = deriveShippingMethodsForCheckout(
    shippingMethodsData,
    cartTotal,
    couponDiscount,
    loyalty,
    loyaltyApplyCouponSnapshot
  )
  const primary = resolveShippingMethodIdForApplyCoupon(
    shippingMethodsData,
    cartTotal,
    couponDiscount,
    loyalty,
    loyaltyApplyCouponSnapshot,
    null
  )
  const ids: number[] = []
  if (primary > 0) ids.push(primary)
  for (const m of filteredSortedMethods) {
    const id = Number(m.id)
    if (Number.isFinite(id) && id > 0 && !ids.includes(id)) ids.push(Math.trunc(id))
  }
  return ids
}

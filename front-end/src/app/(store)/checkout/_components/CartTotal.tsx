'use client'
import ShippingProgress from '@/components/ShippingProgress'
import { DEFAULT_CURRENCY_SYMBOL, ServerActionStatus } from '@/lib/config/app.config'
import { useCart, type LoyaltyRedemption } from '@/lib/context/CartContext'
import { useCheckout } from '@/lib/context/CheckoutContext'
import { Divider, Checkbox } from '@nextui-org/react'
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import CouponForm from '@/components/CouponForm'
import { applyCoupon } from '@/lib/server.actions'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { SHIPPING_METHOD_DATA } from '@/lib/config/order.config'
import { FREE_DELIVERY_THRESHOLD } from '@/lib/utils'
import {
    calculateOrderGrandTotal,
    parseApiMoney,
    buildApplyCouponWithLoyalty,
    parseShippingMethodIdFromApplyCouponResponse,
    parseShippingCostFromApplyCouponResponse,
    parseIsPaymentRequiredFromApplyCouponResponse,
    parseTotalFromApplyCouponResponse,
    resolveShippingMethodIdForApplyCoupon,
    listShippingMethodIdsForApplyCoupon,
    resolveCheckoutShippingLineDisplayAmount,
    effectiveLoyaltyDiscountAmount,
    evaluateLoyaltyRedemptionForCart,
    getLoyaltyOrderMinimumBlockingMessage,
    type CheckoutCouponSlice,
    type CheckoutLoyaltySlice,
    type LoyaltyApplyCouponShippingSnapshot,
} from '@/lib/utils/checkout-order.utils'
import type { APPLY_COUPON_PAYLOAD } from '@/lib/config/checkout.config'
import type { LoyaltyPointsRedemptionResponse } from '@/lib/config/loyalty-points.config'

interface CartTotalProps {
    shippingMethodsData: SHIPPING_METHOD_DATA[];
}

/** Mail discount from apply-coupon body when present (loyalty path keeps coupon state cleared). */
function snapshotMailDiscountFromApplyCoupon(data: unknown): number | null {
    if (!data || typeof data !== 'object') return null
    const o = data as { mail_subscription_discount?: unknown }
    if (!('mail_subscription_discount' in o)) return null
    const n = parseApiMoney(o.mail_subscription_discount)
    return Number.isFinite(n) ? n : null
}

function buildLoyaltyApplyCouponSnapshot(
    loyalty: Pick<
        LoyaltyRedemption,
        'isRedeemed' | 'applyCouponShippingCost' | 'applyCouponShippingMethodId'
    >
): LoyaltyApplyCouponShippingSnapshot | undefined {
    if (!loyalty.isRedeemed) return undefined
    return {
        isRedeemed: true,
        applyCouponShippingCost: loyalty.applyCouponShippingCost,
        applyCouponShippingMethodId: loyalty.applyCouponShippingMethodId,
    }
}

function isShippingMethodUnavailableMessage(message: string | undefined): boolean {
    if (!message) return false
    const m = message.toLowerCase()
    return m.includes('shipping method') && m.includes('not available')
}

async function applyLoyaltyCouponWithShippingCandidates(
    methodIds: number[],
    pointsToRedeem: number | null,
    loyaltyPoints: LoyaltyPointsRedemptionResponse | null,
    onAttemptShippingMethod: (shippingMethodId: number) => void
) {
    let lastResponse: Awaited<ReturnType<typeof applyCoupon>> | null = null
    for (const shippingMethodId of methodIds) {
        if (shippingMethodId <= 0) continue
        onAttemptShippingMethod(shippingMethodId)
        const payload: APPLY_COUPON_PAYLOAD = buildApplyCouponWithLoyalty(
            shippingMethodId,
            true,
            pointsToRedeem,
            loyaltyPoints
        )
        const response = await applyCoupon(payload)
        lastResponse = response
        if (response.status === ServerActionStatus.SUCCESS) {
            return { response, shippingMethodId }
        }
        if (!isShippingMethodUnavailableMessage(response.message)) {
            return { response, shippingMethodId }
        }
    }
    return {
        response: lastResponse,
        shippingMethodId: methodIds.find((id) => id > 0) ?? 0,
    }
}

const CartTotal: React.FC<CartTotalProps> = ({ shippingMethodsData }) => {  
    const { cartTotal, itemCount, setCouponDiscount, couponDiscount, setIsRemoveCoupon, loyaltyRedemption, setLoyaltyRedemption, setShippingMethodIdForCoupon } = useCart();
    const { selectedShippingMethod, setSelectedShippingMethod, registerShippingMethodSelectedHandler } = useCheckout();
    const [isApplyingLoyalty, setIsApplyingLoyalty] = useState(false);
    const [loyaltyValidationMessage, setLoyaltyValidationMessage] = useState<string | null>(null);
    const { isRedeemed, pointsData: loyaltyPoints, discountValue: loyaltyDiscountValue, message: loyaltyMessage, pointsToRedeem, applyCouponShippingCost, applyCouponMailSubscriptionDiscount, applyCouponTotal } = loyaltyRedemption;
    const { status } = useSession();
    const isAuthenticated = status === 'authenticated';
    const loyaltyRefreshDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastLoyaltyShippingMethodIdRef = useRef<number>(0);
    const loyaltyApplyCouponInFlightKeyRef = useRef<string | null>(null);
    const selectedShippingMethodIdRef = useRef<number>(0);

    useEffect(() => {
        selectedShippingMethodIdRef.current = selectedShippingMethod?.id
            ? Number(selectedShippingMethod.id)
            : 0;
    }, [selectedShippingMethod?.id]);

    const commitLoyaltyApplyCouponResponse = useCallback(
        (
            response: Awaited<ReturnType<typeof applyCoupon>>,
            fallbackShippingMethodId: number
        ) => {
            if (response?.status !== ServerActionStatus.SUCCESS || !response.data) {
                return false;
            }
            const loyaltyParsed = parseApiMoney(response.data.loyalty_discount);
            const apiSub = parseApiMoney(response.data.subTotal);
            const apiTot = parseApiMoney(response.data.total);
            const discountAmount =
                loyaltyParsed > 0 ? loyaltyParsed : Math.max(0, apiSub - apiTot);
            const apiShippingMethodId = parseShippingMethodIdFromApplyCouponResponse(response.data);
            const resolvedShippingMethodId =
                apiShippingMethodId ?? (fallbackShippingMethodId > 0 ? fallbackShippingMethodId : null);
            setLoyaltyRedemption((prev) => ({
                ...prev,
                isRedeemed: true,
                discountValue: Number.isFinite(discountAmount) ? discountAmount : 0,
                message: prev.message ?? 'Loyalty points applied',
                applyCouponShippingCost: parseShippingCostFromApplyCouponResponse(response.data),
                applyCouponShippingMethodId:
                    resolvedShippingMethodId != null && resolvedShippingMethodId > 0
                        ? resolvedShippingMethodId
                        : null,
                applyCouponMailSubscriptionDiscount: snapshotMailDiscountFromApplyCoupon(response.data),
                applyCouponIsPaymentRequired: parseIsPaymentRequiredFromApplyCouponResponse(response.data),
                applyCouponTotal: parseTotalFromApplyCouponResponse(response.data),
            }));
            if (resolvedShippingMethodId != null && resolvedShippingMethodId > 0) {
                lastLoyaltyShippingMethodIdRef.current = resolvedShippingMethodId;
            } else if (fallbackShippingMethodId > 0) {
                lastLoyaltyShippingMethodIdRef.current = fallbackShippingMethodId;
            }
            return true;
        },
        [setLoyaltyRedemption]
    );

    const refreshLoyaltyApplyCouponForShipping = useCallback(
        async (shippingMethodId: number) => {
            if (shippingMethodId <= 0 || !loyaltyPoints) return;

            const requestKey = `loyalty-${shippingMethodId}-${pointsToRedeem ?? 'max'}`;
            if (loyaltyApplyCouponInFlightKeyRef.current === requestKey) return;

            loyaltyApplyCouponInFlightKeyRef.current = requestKey;
            try {
                const response = await applyCoupon(
                    buildApplyCouponWithLoyalty(
                        shippingMethodId,
                        true,
                        pointsToRedeem,
                        loyaltyPoints
                    )
                );
                if (commitLoyaltyApplyCouponResponse(response, shippingMethodId)) {
                    return;
                }
                if (response?.status === ServerActionStatus.ERROR) {
                    const errMsg =
                        response && 'message' in response && typeof response.message === 'string'
                            ? response.message
                            : 'Failed to refresh loyalty discount for the selected shipping method.';
                    toast.error(errMsg);
                }
            } catch (e) {
                console.error('Error refreshing loyalty discount for shipping method:', e);
            } finally {
                if (loyaltyApplyCouponInFlightKeyRef.current === requestKey) {
                    loyaltyApplyCouponInFlightKeyRef.current = null;
                }
            }
        },
        [loyaltyPoints, pointsToRedeem, commitLoyaltyApplyCouponResponse]
    );

    const loyaltyEligibility = useMemo(
        () => evaluateLoyaltyRedemptionForCart(cartTotal, loyaltyPoints),
        [cartTotal, loyaltyPoints]
    );

    const loyaltyOrderMinimumHint = useMemo(
        () => getLoyaltyOrderMinimumBlockingMessage(loyaltyEligibility, DEFAULT_CURRENCY_SYMBOL),
        [loyaltyEligibility]
    );

    const loyaltyIneligibleMessage = useMemo(() => {
        const { blockingReason } = loyaltyEligibility;
        switch (blockingReason) {
            case 'insufficient_points':
                return loyaltyPoints
                    ? `You need at least ${loyaltyPoints.minimum_points_required} loyalty points to redeem (${loyaltyPoints.points_needed} more required).`
                    : null;
            case 'below_minimum_order_value':
                return loyaltyOrderMinimumHint;
            case 'api_disallowed':
                return 'Loyalty points cannot be redeemed on this order.';
            default:
                return null;
        }
    }, [loyaltyEligibility, loyaltyPoints, loyaltyOrderMinimumHint]);

    const loyaltyPointsToRedeemError = useMemo(() => {
        if (!loyaltyPoints || pointsToRedeem == null) return null;
        if (pointsToRedeem < loyaltyPoints.minimum_points_required) {
            return `Value must be greater than or equal to ${loyaltyPoints.minimum_points_required}.`;
        }
        if (pointsToRedeem > loyaltyPoints.user_points) {
            return `Value must be less than or equal to ${loyaltyPoints.user_points}.`;
        }
        return null;
    }, [loyaltyPoints, pointsToRedeem]);

    const clearLoyaltyRedemptionState = useCallback(() => {
        setLoyaltyRedemption((prev) => ({
            ...prev,
            isRedeemed: false,
            discountValue: 0,
            message: null,
            pointsToRedeem: null,
            applyCouponShippingCost: null,
            applyCouponShippingMethodId: null,
            applyCouponMailSubscriptionDiscount: null,
            applyCouponIsPaymentRequired: null,
            applyCouponTotal: null,
        }));
    }, [setLoyaltyRedemption]);

    /** Full API loyalty discount (may include shipping); capped value only for stale fallbacks before refresh. */
    const displayLoyaltyDiscount = useMemo(() => {
        if (!isRedeemed) return 0;
        if (Number.isFinite(loyaltyDiscountValue) && loyaltyDiscountValue > 0) {
            return loyaltyDiscountValue;
        }
        return effectiveLoyaltyDiscountAmount(
            { isRedeemed, discountValue: loyaltyDiscountValue },
            cartTotal
        );
    }, [isRedeemed, loyaltyDiscountValue, cartTotal]);

    const loyaltyForShipping = useMemo(
        (): CheckoutLoyaltySlice => ({
            isRedeemed,
            discountValue: effectiveLoyaltyDiscountAmount(
                { isRedeemed, discountValue: loyaltyDiscountValue },
                cartTotal
            ),
        }),
        [isRedeemed, loyaltyDiscountValue, cartTotal]
    );

    const couponSliceForShipping = useMemo((): CheckoutCouponSlice => {
        const mailFromLoyaltyApply =
            isRedeemed &&
            applyCouponMailSubscriptionDiscount !== null &&
            Number.isFinite(applyCouponMailSubscriptionDiscount)
                ? applyCouponMailSubscriptionDiscount
                : undefined;
        return {
            isApplied: couponDiscount.isApplied,
            value: couponDiscount.value,
            mailSubscriptionDiscount:
                mailFromLoyaltyApply !== undefined
                    ? mailFromLoyaltyApply
                    : couponDiscount.mailSubscriptionDiscount,
        };
    }, [
        couponDiscount.isApplied,
        couponDiscount.value,
        couponDiscount.mailSubscriptionDiscount,
        isRedeemed,
        applyCouponMailSubscriptionDiscount,
    ]);

  /** `fresh: true` after quantity/cart changes — ignore stale apply-coupon shipping snapshot and UI selection. */
    const resolveApplyCouponShippingMethodId = useMemo(() => {
        return (
            loyaltySnapshot?: LoyaltyApplyCouponShippingSnapshot | null,
            fresh = false
        ) =>
            resolveShippingMethodIdForApplyCoupon(
                shippingMethodsData,
                cartTotal,
                couponSliceForShipping,
                loyaltyForShipping,
                fresh ? undefined : loyaltySnapshot,
                fresh ? null : selectedShippingMethod?.id ? Number(selectedShippingMethod.id) : 0
            );
    }, [
        shippingMethodsData,
        cartTotal,
        couponSliceForShipping,
        loyaltyForShipping,
        selectedShippingMethod?.id,
    ]);

    const listApplyCouponShippingMethodIds = useMemo(() => {
        return (fresh = false) =>
            listShippingMethodIdsForApplyCoupon(
                shippingMethodsData,
                cartTotal,
                couponSliceForShipping,
                loyaltyForShipping,
                fresh ? undefined : buildLoyaltyApplyCouponSnapshot({
                      isRedeemed: true,
                      applyCouponShippingCost: loyaltyRedemption.applyCouponShippingCost,
                      applyCouponShippingMethodId: loyaltyRedemption.applyCouponShippingMethodId,
                  })
            );
    }, [
        shippingMethodsData,
        cartTotal,
        couponSliceForShipping,
        loyaltyForShipping,
        loyaltyRedemption.applyCouponShippingCost,
        loyaltyRedemption.applyCouponShippingMethodId,
    ]);

    const syncSelectedShippingMethod = (methodId: number) => {
        if (!methodId || !shippingMethodsData?.length) return;
        const method = shippingMethodsData.find((m) => m.id === methodId);
        if (method && selectedShippingMethod?.id !== method.id) {
            setSelectedShippingMethod(method);
        }
    };

    useEffect(() => {
        if (loyaltyEligibility.canRedeemOnCart) {
            setLoyaltyValidationMessage(null);
        }
    }, [loyaltyEligibility.canRedeemOnCart]);

    useEffect(() => {
        if (couponDiscount.isApplied && couponDiscount.code) {
            clearLoyaltyRedemptionState();
        }
    }, [couponDiscount, clearLoyaltyRedemptionState]);
    useEffect(() => {
        if (itemCount === 0) {
            clearLoyaltyRedemptionState();
        }
    }, [itemCount, clearLoyaltyRedemptionState]);

    useEffect(() => {
        if (!isRedeemed) {
            lastLoyaltyShippingMethodIdRef.current = 0;
        }
    }, [isRedeemed]);
    
    // When cart quantity/total changes with loyalty on, pick a carrier valid for the new merchandise total immediately.
    useEffect(() => {
        if (!isRedeemed) return;
        const shippingMethodId = resolveApplyCouponShippingMethodId(undefined, true);
        if (shippingMethodId > 0) {
            syncSelectedShippingMethod(shippingMethodId);
            setShippingMethodIdForCoupon(shippingMethodId);
        }
    }, [
        cartTotal,
        itemCount,
        isRedeemed,
        resolveApplyCouponShippingMethodId,
        setShippingMethodIdForCoupon,
    ]);

    // Keep CartContext coupon revalidation aligned with the selected shipping method when set.
    useEffect(() => {
        const selectedId = selectedShippingMethod?.id ? Number(selectedShippingMethod.id) : 0;
        if (selectedId > 0) {
            setShippingMethodIdForCoupon(selectedId);
            return;
        }
        const shippingMethodId = isRedeemed
            ? resolveApplyCouponShippingMethodId(undefined, true)
            : 0;
        if (shippingMethodId > 0) {
            setShippingMethodIdForCoupon(shippingMethodId);
        }
    }, [
        selectedShippingMethod,
        setShippingMethodIdForCoupon,
        isRedeemed,
        resolveApplyCouponShippingMethodId,
        cartTotal,
        itemCount,
    ]);

    const refreshLoyaltyApplyCouponForShippingRef = useRef(refreshLoyaltyApplyCouponForShipping);
    refreshLoyaltyApplyCouponForShippingRef.current = refreshLoyaltyApplyCouponForShipping;

    const canRefreshLoyaltyForShippingRef = useRef(false);
    canRefreshLoyaltyForShippingRef.current =
        isAuthenticated &&
        isRedeemed &&
        !couponDiscount.code &&
        !!loyaltyPoints &&
        loyaltyEligibility.canRedeemOnCart &&
        !loyaltyPointsToRedeemError;

    useEffect(() => {
        registerShippingMethodSelectedHandler((shippingMethodId: number) => {
            if (!canRefreshLoyaltyForShippingRef.current) return;
            if (lastLoyaltyShippingMethodIdRef.current === shippingMethodId) return;
            void refreshLoyaltyApplyCouponForShippingRef.current(shippingMethodId);
        });
        return () => registerShippingMethodSelectedHandler(null);
    }, [registerShippingMethodSelectedHandler]);

    // Authenticated loyalty: debounced applyCoupon keeps discount aligned with API when cart quantity/total changes only.
    // CartContext owns coupon revalidation; toggling loyalty still calls applyCoupon immediately in handleRedeemToggle (may duplicate once ~400ms after redeem).
    useEffect(() => {
        if (
            !isAuthenticated ||
            !isRedeemed ||
            couponDiscount.code ||
            !loyaltyPoints ||
            !loyaltyEligibility.canRedeemOnCart ||
            loyaltyPointsToRedeemError
        ) {
            if (loyaltyRefreshDebounceRef.current) {
                clearTimeout(loyaltyRefreshDebounceRef.current);
                loyaltyRefreshDebounceRef.current = null;
            }
            return;
        }

        if (loyaltyRefreshDebounceRef.current) {
            clearTimeout(loyaltyRefreshDebounceRef.current);
        }

        loyaltyRefreshDebounceRef.current = setTimeout(async () => {
            loyaltyRefreshDebounceRef.current = null;
            const preferredId = selectedShippingMethodIdRef.current;
            const fallbackIds = listApplyCouponShippingMethodIds(true);
            const methodIds =
                preferredId > 0
                    ? [preferredId, ...fallbackIds.filter((id) => id !== preferredId)]
                    : fallbackIds;
            try {
                const { response, shippingMethodId } = await applyLoyaltyCouponWithShippingCandidates(
                    methodIds,
                    pointsToRedeem,
                    loyaltyPoints,
                    (id) => {
                        if (preferredId > 0 && id !== preferredId) return;
                        syncSelectedShippingMethod(id);
                    }
                );
                if (response && commitLoyaltyApplyCouponResponse(response, shippingMethodId)) {
                    if (preferredId <= 0 && shippingMethodId > 0) {
                        syncSelectedShippingMethod(shippingMethodId);
                    }
                } else if (response?.status === ServerActionStatus.ERROR) {
                    const errMsg =
                        response && 'message' in response && typeof response.message === 'string'
                            ? response.message
                            : 'Failed to refresh loyalty discount.';
                    toast.error(errMsg);
                }
            } catch (e) {
                console.error('Error refreshing loyalty discount:', e);
            }
        }, 400);

        return () => {
            if (loyaltyRefreshDebounceRef.current) {
                clearTimeout(loyaltyRefreshDebounceRef.current);
                loyaltyRefreshDebounceRef.current = null;
            }
        };
    }, [
        isAuthenticated,
        isRedeemed,
        couponDiscount.code,
        loyaltyPoints,
        cartTotal,
        itemCount,
        pointsToRedeem,
        loyaltyEligibility.canRedeemOnCart,
        loyaltyPointsToRedeemError,
        commitLoyaltyApplyCouponResponse,
    ]);

    const handleRedeemToggle = async (checked: boolean) => {
        if (checked && !loyaltyEligibility.canRedeemOnCart) {
            setLoyaltyValidationMessage(
                loyaltyIneligibleMessage || 'Cannot apply loyalty points on this order.'
            );
            return;
        }

        setLoyaltyValidationMessage(null);
        setIsApplyingLoyalty(true);
        let response: Awaited<ReturnType<typeof applyCoupon>> | null = null;
        let shippingMethodId = 0;

        if (checked) {
            const methodIds = listApplyCouponShippingMethodIds(true);
            const result = await applyLoyaltyCouponWithShippingCandidates(
                methodIds,
                pointsToRedeem,
                loyaltyPoints,
                (id) => syncSelectedShippingMethod(id)
            );
            response = result.response;
            shippingMethodId = result.shippingMethodId;
        } else {
            shippingMethodId = resolveApplyCouponShippingMethodId(undefined, true);
            response = await applyCoupon(
                buildApplyCouponWithLoyalty(shippingMethodId, false, null, loyaltyPoints)
            );
        }

        if (response?.status === ServerActionStatus.SUCCESS && response.data) {
            const apiSubTotal = parseApiMoney(response.data.subTotal) || cartTotal;
            const apiTotal = parseApiMoney(response.data.total) || cartTotal;
            const loyaltyDiscountParsed = checked ? parseApiMoney(response.data.loyalty_discount) : 0;
            const discountAmount = checked
                ? (loyaltyDiscountParsed > 0 ? loyaltyDiscountParsed : Math.max(0, apiSubTotal - apiTotal))
                : 0;
            const apiShippingMethodId = parseShippingMethodIdFromApplyCouponResponse(response.data);
            const resolvedShippingMethodId =
                apiShippingMethodId ?? (shippingMethodId > 0 ? shippingMethodId : null);
            setLoyaltyRedemption(prev => ({
                ...prev,
                isRedeemed: checked,
                discountValue: Number.isFinite(discountAmount) ? discountAmount : 0,
                message: checked ? 'Loyalty points applied' : null,
                pointsToRedeem: checked ? prev.pointsToRedeem : null,
                applyCouponShippingCost: checked ? parseShippingCostFromApplyCouponResponse(response.data) : null,
                applyCouponShippingMethodId:
                    checked && resolvedShippingMethodId != null && resolvedShippingMethodId > 0
                        ? resolvedShippingMethodId
                        : null,
                applyCouponMailSubscriptionDiscount: checked
                    ? snapshotMailDiscountFromApplyCoupon(response.data)
                    : null,
                applyCouponIsPaymentRequired: checked
                    ? parseIsPaymentRequiredFromApplyCouponResponse(response.data)
                    : null,
                applyCouponTotal: checked ? parseTotalFromApplyCouponResponse(response.data) : null,
            }));
            if (checked && resolvedShippingMethodId != null && resolvedShippingMethodId > 0) {
                lastLoyaltyShippingMethodIdRef.current = resolvedShippingMethodId;
            }
            if (!checked) {
                lastLoyaltyShippingMethodIdRef.current = 0;
            }
            if (checked) {
                setCouponDiscount({ value: 0, isApplied: false, code: null, message: null, discountValue: '' });
            }
            if (
                checked &&
                resolvedShippingMethodId != null &&
                resolvedShippingMethodId > 0
            ) {
                syncSelectedShippingMethod(resolvedShippingMethodId);
            }
        } else if (response?.status === ServerActionStatus.ERROR) {
            toast.error(response.message || 'Failed to apply loyalty points.');
        }
        setIsApplyingLoyalty(false);
    };

    const getRedemptionLabel = () => {
        if (!loyaltyPoints) return "";

        const { minimum_points_required, user_points } = loyaltyPoints;
        const minOrder =
            loyaltyEligibility.minimumOrderValueToRedeem > 0
                ? `; minimum order ${DEFAULT_CURRENCY_SYMBOL}${loyaltyEligibility.minimumOrderValueToRedeem.toFixed(2)}`
                : '';
        return `Apply loyalty discount on this order (${user_points} points available; minimum ${minimum_points_required} points required to redeem${minOrder}).`;
    }

    const handleRemoveDiscount = () => {
        if (isRedeemed) {
            handleRedeemToggle(false);
        } else {
            setIsRemoveCoupon(true);
        }
    }
    const freeShippingThreshold = useMemo(() => {
        if (!shippingMethodsData || shippingMethodsData.length === 0) {
            return FREE_DELIVERY_THRESHOLD;
        }

        const freeShippingMethod = shippingMethodsData.find(
            method => (method.is_free_shipping ?? false) && method.free_shipping_threshold
        );

        if (freeShippingMethod?.free_shipping_threshold) {
            const thresholdValue = parseFloat(freeShippingMethod.free_shipping_threshold);
            return Number.isFinite(thresholdValue) && thresholdValue > 0
                ? thresholdValue
                : FREE_DELIVERY_THRESHOLD;
        }

        return FREE_DELIVERY_THRESHOLD;
    }, [shippingMethodsData]);

    // Check if any shipping method has is_enabled && is_free_shipping
    const hasEnabledFreeShipping = useMemo(() => {
        if (!shippingMethodsData || shippingMethodsData.length === 0) {
            return false;
        }
        return shippingMethodsData.some(
            method => method.is_enabled === true && method.is_free_shipping === true
        );
    }, [shippingMethodsData]);

    // Shipping Cost row: apply-coupon API `shippingCost` when loyalty/coupon priced the cart; else catalog rate.
    const currentShippingCost = parseFloat(selectedShippingMethod?.shipping_cost || '0');
    const catalogShippingCost = Number.isFinite(currentShippingCost) ? currentShippingCost : 0;
    const applyCouponShippingFromApi = isRedeemed
        ? applyCouponShippingCost
        : couponDiscount.isApplied && couponDiscount.shippingCost !== undefined
          ? couponDiscount.shippingCost
          : null;
    const safeShippingCost = resolveCheckoutShippingLineDisplayAmount(
        catalogShippingCost,
        applyCouponShippingFromApi
    );
    const loyaltyApplyCouponZeroShipping =
        isRedeemed &&
        applyCouponShippingCost !== null &&
        Number.isFinite(applyCouponShippingCost) &&
        applyCouponShippingCost === 0;    
    // Subtotal: use cartTotal (includes deal discounts), not coupon API subTotal
    const displaySubTotal = Number.isFinite(cartTotal) && cartTotal > 0 ? cartTotal : 0;

    const couponSliceForTotals = couponSliceForShipping

    const effectiveMailDiscount = useMemo(() => {
        const m = couponSliceForTotals.mailSubscriptionDiscount
        return m !== undefined && Number.isFinite(m) ? m : 0
    }, [couponSliceForTotals.mailSubscriptionDiscount])

    const displayTotal = useMemo(() => {
        if (isRedeemed && applyCouponTotal !== null && Number.isFinite(applyCouponTotal)) {
            return Math.max(0, applyCouponTotal);
        }
        return calculateOrderGrandTotal(
            cartTotal,
            couponSliceForTotals,
            { isRedeemed, discountValue: displayLoyaltyDiscount },
            safeShippingCost
        );
    }, [
        isRedeemed,
        applyCouponTotal,
        cartTotal,
        couponSliceForTotals,
        displayLoyaltyDiscount,
        safeShippingCost,
    ]);

    const safeSubTotal = Number.isFinite(displaySubTotal) ? displaySubTotal : 0;
    const safeTotal = Number.isFinite(displayTotal) ? displayTotal : 0;
    
    return (
        <div className='flex flex-col p-3 md:p-5 gap-4 md:gap-6 bg-white border border-skin-neutral-100 rounded w-full shadow-checkout'>
            <div className='!font-oswald primary-gradient-600 text-title-2 md:text-2xl font-semibold w-fit'>Cart Total</div>
            <div className='flex flex-col gap-3'>
                {!isRedeemed && (
                    <CouponForm
                        onCouponApplied={(discount) => {
                            setCouponDiscount(discount);
                            if (discount.isApplied) {
                                setLoyaltyRedemption(prev => ({
                                    ...prev,
                                    isRedeemed: false,
                                    discountValue: 0,
                                    message: null,
                                    pointsToRedeem: null,
                                    applyCouponShippingCost: null,
                                    applyCouponShippingMethodId: null,
                                    applyCouponMailSubscriptionDiscount: null,
                                    applyCouponIsPaymentRequired: null,
                                    applyCouponTotal: null,
                                }));
                            }
                        }}
                        initialCouponCode={couponDiscount.code || ''}
                        cartTotal={cartTotal}
                        isGuest={!isAuthenticated}
                        shippingMethodId={selectedShippingMethod?.id ? Number(selectedShippingMethod.id) : 0}
                    />
                )}
                {couponDiscount.isApplied && couponDiscount.code && (
                    <div>
                        <div className='flex items-center justify-between text-skin-primary-400 text-content-3 md:text-content-1 font-bold'>
                            <div className='flex flex-col'>
                                <p>{couponDiscount.message}</p>
                                <p>Coupon: {couponDiscount.code}</p>
                            </div>
                            <div className='flex items-center'>
                                <p>-{DEFAULT_CURRENCY_SYMBOL} {couponDiscount.discountValue}</p>
                                <button
                                    className='text-red-500 hover:underline text-content-3 md:text-content-1 font-bold'
                                    onClick={handleRemoveDiscount}
                                >
                                    [Remove]
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {effectiveMailDiscount > 0 &&
                    (couponDiscount.mailSubscriptionData && couponDiscount.mailSubscriptionData.isDiscountUsed === false ? (
                        <p className='text-green-600 text-content-3 md:text-content-1 font-semibold'>
                            Subscription discount applied with coupon.
                        </p>
                    ) : isRedeemed ? (
                        <p className='text-green-600 text-content-3 md:text-content-1 font-semibold'>
                            Subscription discount applied.
                        </p>
                    ) : null)}
                {isRedeemed && (
                    <div className='flex items-center justify-between text-green-600 text-content-3 md:text-content-1 font-bold'>
                        <p>{loyaltyMessage}</p>
                        <div className='flex items-center'>
                            <p>-{DEFAULT_CURRENCY_SYMBOL} {displayLoyaltyDiscount.toFixed(2)}</p>
                            <button
                                className='text-red-500 hover:underline text-content-3 md:text-content-1 font-bold'
                                onClick={handleRemoveDiscount}
                            >
                                [Remove]
                            </button>
                        </div>
                    </div>
                )}
                {isAuthenticated && loyaltyPoints && !couponDiscount.code && (
                    <div className="mt-2 flex flex-col gap-2">
                        <div className="flex items-start">
                            <Checkbox
                                isSelected={isRedeemed}
                                onValueChange={handleRedeemToggle}
                                isDisabled={isApplyingLoyalty}
                            >
                                <span className="ml-2 text-sm text-gray-600">
                                    {getRedemptionLabel()}
                                </span>
                            </Checkbox>
                        </div>
                        {(loyaltyValidationMessage || loyaltyOrderMinimumHint) && (
                            <p className="text-danger text-tiny p-1 ml-7">
                                {loyaltyValidationMessage || loyaltyOrderMinimumHint}
                            </p>
                        )}
                        {isRedeemed && loyaltyPoints && (
                            <div className="ml-7 flex flex-col gap-1 max-w-xs">
                                <label htmlFor="loyalty-points-to-redeem" className="text-xs text-gray-600">
                                    Points to redeem (leave blank for the maximum allowed for this order)
                                </label>
                                <input
                                    id="loyalty-points-to-redeem"
                                    type="number"
                                    inputMode="numeric"
                                    min={loyaltyPoints.minimum_points_required}
                                    max={loyaltyPoints.user_points}
                                    disabled={isApplyingLoyalty}
                                    aria-invalid={loyaltyPointsToRedeemError ? true : undefined}
                                    className={`rounded border px-2 py-1.5 text-sm text-gray-800 disabled:opacity-50 [appearance:textfield] [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                                        loyaltyPointsToRedeemError
                                            ? 'border-danger'
                                            : 'border-skin-neutral-100'
                                    }`}
                                    placeholder="Maximum"
                                    value={pointsToRedeem ?? ''}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        if (v === '') {
                                            setLoyaltyRedemption((prev) => ({ ...prev, pointsToRedeem: null }));
                                            return;
                                        }
                                        const n = parseInt(v, 10);
                                        if (!Number.isFinite(n)) return;
                                        setLoyaltyRedemption((prev) => ({ ...prev, pointsToRedeem: n }));
                                    }}
                                />
                                {loyaltyPointsToRedeemError && (
                                    <p className="text-danger text-tiny p-1">
                                        {loyaltyPointsToRedeemError}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
                <Divider className='border-2' />
                <div className='space-y-1.5'>
                    <div className='flex items-center justify-between text-content-2 md:text-title-2 font-bold'>
                        <p className='text-skin-neutral-500 !font-oswald'>Number of Items</p>
                        <p className='text-skin-neutral-300'>{itemCount}</p>
                    </div>
                    <div className='flex items-center justify-between text-content-2 md:text-title-2 font-bold'>
                        <p className='text-skin-neutral-500 !font-oswald'>Shipping Cost</p>
                        <p className='text-skin-neutral-300'>{DEFAULT_CURRENCY_SYMBOL}{safeShippingCost.toFixed(2)}</p>
                    </div>
                    <div className='flex items-center justify-between text-content-2 md:text-title-2 font-bold'>
                        <p className='text-skin-neutral-500 !font-oswald'>Subtotal</p>
                        <p className='text-skin-neutral-300'>{DEFAULT_CURRENCY_SYMBOL}{safeSubTotal}</p>
                    </div>
                    {effectiveMailDiscount > 0 && (
                        <div className='flex items-center justify-between text-content-2 md:text-title-2 font-bold text-green-700'>
                            <p className='text-skin-neutral-500 !font-oswald'>Mail subscription discount</p>
                            <p className='text-skin-neutral-300'>-{DEFAULT_CURRENCY_SYMBOL}{effectiveMailDiscount.toFixed(2)}</p>
                        </div>
                    )}
                </div>
                <Divider className='border-2' />
                {hasEnabledFreeShipping && (
                    <>
                        <ShippingProgress 
                            totalAmount={safeTotal} 
                            freeShippingThreshold={freeShippingThreshold} 
                            shippingCost={safeShippingCost}
                            loyaltyApplyCouponZeroShipping={loyaltyApplyCouponZeroShipping}
                        />
                        <Divider className='border-2' />
                    </>
                )}
                <div className='flex items-center justify-between text-black font-bold'>
                    <p className='text-title-2 md:text-2xl !font-oswald'>Total</p>
                    <p className='text-title-2 md:text-2xl !font-oswald'>{DEFAULT_CURRENCY_SYMBOL}{safeTotal.toFixed(2)}</p>
                </div>
            </div>
        </div>
    )
}

export default CartTotal;

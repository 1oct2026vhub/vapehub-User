'use client'
import ShippingProgress from '@/components/ShippingProgress'
import { DEFAULT_CURRENCY_SYMBOL, ServerActionStatus } from '@/lib/config/app.config'
import { useCart } from '@/lib/context/CartContext'
import { useCheckout } from '@/lib/context/CheckoutContext'
import { Divider, Checkbox } from '@nextui-org/react'
import React, { useEffect, useMemo, useState, useRef } from 'react'
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
    type CheckoutCouponSlice,
} from '@/lib/utils/checkout-order.utils'

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

const CartTotal: React.FC<CartTotalProps> = ({ shippingMethodsData }) => {  
    const { cartTotal, itemCount, setCouponDiscount, couponDiscount, setIsRemoveCoupon, loyaltyRedemption, setLoyaltyRedemption, setShippingMethodIdForCoupon } = useCart();
    const { selectedShippingMethod } = useCheckout();
    const [isApplyingLoyalty, setIsApplyingLoyalty] = useState(false);
    const { isRedeemed, pointsData: loyaltyPoints, discountValue: loyaltyDiscountValue, message: loyaltyMessage, pointsToRedeem, applyCouponShippingCost, applyCouponMailSubscriptionDiscount } = loyaltyRedemption;
    const { status } = useSession();
    const isAuthenticated = status === 'authenticated';
    const loyaltyRefreshDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (couponDiscount.isApplied && couponDiscount.code) {
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
            }));
        }
    }, [couponDiscount, setLoyaltyRedemption]);
    useEffect(() => {
        if (itemCount === 0) {
            // Reset loyalty points when cart becomes empty
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
            }));
        }
    }, [itemCount, setLoyaltyRedemption]);
    
    // Update shipping method ID in CartContext when selectedShippingMethod changes
    // This ensures coupon revalidation uses the correct shipping method ID when quantity updates
    useEffect(() => {
        const shippingMethodId = selectedShippingMethod?.id ? Number(selectedShippingMethod.id) : 0;
        setShippingMethodIdForCoupon(shippingMethodId);
    }, [selectedShippingMethod, setShippingMethodIdForCoupon]);

    // Authenticated loyalty: debounced applyCoupon keeps discount aligned with API when cart/shipping changes.
    // CartContext owns coupon revalidation; toggling loyalty still calls applyCoupon immediately in handleRedeemToggle (may duplicate once ~400ms after redeem).
    useEffect(() => {
        if (!isAuthenticated || !isRedeemed || couponDiscount.code || !loyaltyPoints) {
            if (loyaltyRefreshDebounceRef.current) {
                clearTimeout(loyaltyRefreshDebounceRef.current);
                loyaltyRefreshDebounceRef.current = null;
            }
            return;
        }

        const shippingMethodId = selectedShippingMethod?.id ? Number(selectedShippingMethod.id) : 0;

        if (loyaltyRefreshDebounceRef.current) {
            clearTimeout(loyaltyRefreshDebounceRef.current);
        }

        loyaltyRefreshDebounceRef.current = setTimeout(async () => {
            loyaltyRefreshDebounceRef.current = null;
            try {
                const response = await applyCoupon(
                    buildApplyCouponWithLoyalty(
                        shippingMethodId,
                        true,
                        pointsToRedeem,
                        loyaltyPoints
                    )
                );
                if (response.status === ServerActionStatus.SUCCESS && response.data) {
                    const loyaltyParsed = parseApiMoney(response.data.loyalty_discount);
                    const apiSub = parseApiMoney(response.data.subTotal);
                    const apiTot = parseApiMoney(response.data.total);
                    const discountAmount =
                        loyaltyParsed > 0 ? loyaltyParsed : Math.max(0, apiSub - apiTot);
                    const apiShippingMethodId = parseShippingMethodIdFromApplyCouponResponse(response.data);
                    const resolvedShippingMethodId =
                        apiShippingMethodId ?? (shippingMethodId > 0 ? shippingMethodId : null);
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
                    }));
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
        selectedShippingMethod?.id,
        setLoyaltyRedemption,
        pointsToRedeem,
    ]);

    const handleRedeemToggle = async (checked: boolean) => {
        setIsApplyingLoyalty(true);
        const shippingMethodId = selectedShippingMethod?.id ? Number(selectedShippingMethod.id) : 0;
        const payload = buildApplyCouponWithLoyalty(
            shippingMethodId,
            checked,
            checked ? pointsToRedeem : null,
            loyaltyPoints
        );

        const response = await applyCoupon(payload);
        if (response.status === ServerActionStatus.SUCCESS && response.data) {
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
            }));
            if (checked) {
                setCouponDiscount({ value: 0, isApplied: false, code: null, message: null, discountValue: '' });
            }
        } else if (response.status === ServerActionStatus.ERROR) {
            toast.error(response.message || 'Failed to apply loyalty points.');
        }
        setIsApplyingLoyalty(false);
    };

    const getRedemptionLabel = () => {
        if (!loyaltyPoints) return "";

        const { minimum_points_required, user_points } = loyaltyPoints;
        return `Apply loyalty discount on this order (${user_points} points available; minimum ${minimum_points_required} points required to redeem).`;
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

    // Shipping: when loyalty is redeemed, show apply-coupon API shipping (matches server pricing); otherwise catalog price from selected method.
    const currentShippingCost = parseFloat(selectedShippingMethod?.shipping_cost || '0');
    const catalogShippingCost = Number.isFinite(currentShippingCost) ? currentShippingCost : 0;
    const useLoyaltyApplyCouponShipping =
        isRedeemed && applyCouponShippingCost !== null && Number.isFinite(applyCouponShippingCost);
    const safeShippingCost = useLoyaltyApplyCouponShipping ? (applyCouponShippingCost as number) : catalogShippingCost;
    /** Align with the Shipping Cost line: loyalty + £0 effective shipping (API snapshot or catalog Free method). */
    const loyaltyApplyCouponZeroShipping = isRedeemed && safeShippingCost === 0;
    
    // Subtotal: use cartTotal (includes deal discounts), not coupon API subTotal
    const displaySubTotal = Number.isFinite(cartTotal) && cartTotal > 0 ? cartTotal : 0;

    const couponSliceForTotals = useMemo((): CheckoutCouponSlice => {
        const mailFromLoyaltyApply =
            isRedeemed &&
            applyCouponMailSubscriptionDiscount !== null &&
            Number.isFinite(applyCouponMailSubscriptionDiscount)
                ? applyCouponMailSubscriptionDiscount
                : undefined
        return {
            isApplied: couponDiscount.isApplied,
            value: couponDiscount.value,
            mailSubscriptionDiscount:
                mailFromLoyaltyApply !== undefined ? mailFromLoyaltyApply : couponDiscount.mailSubscriptionDiscount,
        }
    }, [
        couponDiscount.isApplied,
        couponDiscount.value,
        couponDiscount.mailSubscriptionDiscount,
        isRedeemed,
        applyCouponMailSubscriptionDiscount,
    ])

    const effectiveMailDiscount = useMemo(() => {
        const m = couponSliceForTotals.mailSubscriptionDiscount
        return m !== undefined && Number.isFinite(m) ? m : 0
    }, [couponSliceForTotals.mailSubscriptionDiscount])

    const displayTotal = calculateOrderGrandTotal(
        cartTotal,
        couponSliceForTotals,
        { isRedeemed, discountValue: loyaltyDiscountValue },
        safeShippingCost
    )

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
                            <p>-{DEFAULT_CURRENCY_SYMBOL} {loyaltyDiscountValue.toFixed(2)}</p>
                            <button
                                className='text-red-500 hover:underline text-content-3 md:text-content-1 font-bold'
                                onClick={handleRemoveDiscount}
                            >
                                [Remove]
                            </button>
                        </div>
                    </div>
                )}
                {loyaltyPoints?.can_redeem && !couponDiscount.code && (
                    <div className="mt-2 flex flex-col gap-2">
                        <div className="flex items-start">
                            <Checkbox isSelected={isRedeemed} onValueChange={handleRedeemToggle} isDisabled={isApplyingLoyalty}>
                                <span className="ml-2 text-sm text-gray-600">
                                    {getRedemptionLabel()}
                                </span>
                            </Checkbox>
                        </div>
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
                                    className="rounded border border-skin-neutral-100 px-2 py-1.5 text-sm text-gray-800 disabled:opacity-50"
                                    placeholder="Maximum"
                                    value={pointsToRedeem ?? ''}
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

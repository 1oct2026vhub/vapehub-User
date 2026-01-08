'use client'
import ShippingProgress from '@/components/ShippingProgress'
import { DEFAULT_CURRENCY_SYMBOL, ServerActionStatus } from '@/lib/config/app.config'
import { useCart } from '@/lib/context/CartContext'
import { useCheckout } from '@/lib/context/CheckoutContext'
import { Divider, Checkbox } from '@nextui-org/react'
import React, { useEffect, useMemo, useState } from 'react'
import CouponForm from '@/components/CouponForm'
import { applyCoupon } from '@/lib/server.actions'
import { toast } from 'sonner'
import { APPLY_COUPON_PAYLOAD } from '@/lib/config/checkout.config'
import { useSession } from 'next-auth/react'
import { SHIPPING_METHOD_DATA } from '@/lib/config/order.config'
import { FREE_DELIVERY_THRESHOLD } from '@/lib/utils'

interface CartTotalProps {
    shippingMethodsData: SHIPPING_METHOD_DATA[];
}

const CartTotal: React.FC<CartTotalProps> = ({ shippingMethodsData }) => {  
    const { cartTotal, itemCount, setCouponDiscount, couponDiscount, setIsRemoveCoupon, loyaltyRedemption, setLoyaltyRedemption } = useCart();
    const { selectedShippingMethod } = useCheckout();
    const [isApplyingLoyalty, setIsApplyingLoyalty] = useState(false);
    const { isRedeemed, pointsData: loyaltyPoints, discountValue: loyaltyDiscountValue, message: loyaltyMessage } = loyaltyRedemption;
    const { status } = useSession();
    const isAuthenticated = status === 'authenticated';

    useEffect(() => {
        if (couponDiscount.isApplied && couponDiscount.code) {
            setLoyaltyRedemption(prev => ({ ...prev, isRedeemed: false, discountValue: 0, message: null }));
        }
    }, [couponDiscount, setLoyaltyRedemption]);
    useEffect(() => {
        if (itemCount === 0) {
            // Reset loyalty points when cart becomes empty
            setLoyaltyRedemption(prev => ({
                ...prev,
                isRedeemed: false,
                discountValue: 0,
                message: null
            }));
        }
    }, [itemCount, setLoyaltyRedemption]);
    const handleRedeemToggle = async (checked: boolean) => {
        setIsApplyingLoyalty(true);
        const payload: APPLY_COUPON_PAYLOAD = {
            shippingMethodId: selectedShippingMethod?.id ? Number(selectedShippingMethod.id) : 0,
            loyalty: checked,
        };

        const response = await applyCoupon(payload);
        if (response.status === ServerActionStatus.SUCCESS && response.data) {
            // Use API response values for accurate calculation
            const apiSubTotal = response.data.subTotal || cartTotal;
            const apiTotal = response.data.total || cartTotal;
            const discountAmount = checked ? (apiSubTotal - apiTotal) : 0;
            setLoyaltyRedemption(prev => ({
                ...prev,
                isRedeemed: checked,
                discountValue: Number.isFinite(discountAmount) ? discountAmount : 0,
                message: checked ? 'Loyalty points applied' : null
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

        const { minimum_points_required, user_points, redemption_amount, redemption_type } = loyaltyPoints;
        const pointsPrefix = `You're eligible to use ${minimum_points_required} of your ${user_points} loyalty points to get`;

        // Use API subTotal if available from coupon, otherwise use cartTotal
        const baseAmount = couponDiscount.isApplied && couponDiscount.subTotal !== undefined
            ? couponDiscount.subTotal
            : cartTotal;
        
        if (redemption_type === 'percentage') {
            const discountAmount = (Number(redemption_amount) / 100) * baseAmount;
            return `${pointsPrefix} a ${DEFAULT_CURRENCY_SYMBOL}${Number.isFinite(discountAmount) ? discountAmount.toFixed(2) : '0.00'} discount`;
        }

        return `${pointsPrefix} a ${DEFAULT_CURRENCY_SYMBOL}${Number.isFinite(Number(redemption_amount)) ? Number(redemption_amount).toFixed(2) : '0.00'} discount`;
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

    // Use API response values when coupon is applied, otherwise use calculated values
    const currentShippingCost = parseFloat(selectedShippingMethod?.shipping_cost || '0');
    
    // Subtotal: CRITICAL - Always use cartTotal (which includes deal discounts) instead of API subTotal
    // API subTotal (couponDiscount.subTotal) is the original subtotal WITHOUT deal discounts
    // cartTotal is calculated with deal discounts applied via calculateGuestDealsAndTotals
    // This ensures deal discounts are always shown in the subtotal, even after coupon is applied
    // DO NOT use couponDiscount.subTotal as it doesn't include deal discounts
    const displaySubTotal = Number.isFinite(cartTotal) && cartTotal > 0 ? cartTotal : 0;
    
    // Shipping Cost: Always use current selected shipping method cost (not API shipping cost)
    // API shipping cost might be from when coupon was applied with different shipping method
    const safeShippingCost = Number.isFinite(currentShippingCost) ? currentShippingCost : 0;
    
    // Calculate mail subscription discount if available
    const mailSubscriptionDiscount = (couponDiscount.mailSubscriptionDiscount !== undefined && Number.isFinite(couponDiscount.mailSubscriptionDiscount))
        ? couponDiscount.mailSubscriptionDiscount
        : 0;
    
    // Total calculation:
    // When coupon is applied: cartTotal (with deals) - coupon discount - mail subscription discount + shipping - loyalty
    // When no coupon: cartTotal + shipping - coupon discount - mail subscription discount - loyalty discount
    let displayTotal: number;
    if (couponDiscount.isApplied && couponDiscount.value !== undefined && Number.isFinite(couponDiscount.value)) {
        // Use cartTotal (includes deals) as base, then apply coupon discount
        // This ensures deal discounts are preserved in the calculation
        const couponValue = Number.isFinite(couponDiscount.value) ? couponDiscount.value : 0;
        const loyaltyValue = isRedeemed && Number.isFinite(loyaltyDiscountValue) ? loyaltyDiscountValue : 0;
        // Formula: (cartTotal with deals) - coupon discount - mail subscription discount + shipping - loyalty
        displayTotal = displaySubTotal - couponValue - mailSubscriptionDiscount + safeShippingCost - loyaltyValue;
    } else {
        // Calculate locally: cartTotal + shipping - coupon - mail subscription discount - loyalty
        const couponValue = Number.isFinite(couponDiscount.value) ? couponDiscount.value : 0;
        const loyaltyValue = isRedeemed && Number.isFinite(loyaltyDiscountValue) ? loyaltyDiscountValue : 0;
        displayTotal = displaySubTotal + safeShippingCost - couponValue - mailSubscriptionDiscount - loyaltyValue;
    }
    
    // Ensure no NaN values with final safety check
    const safeSubTotal = Number.isFinite(displaySubTotal) ? displaySubTotal : 0;
    const safeTotal = Number.isFinite(displayTotal) ? displayTotal : 0;
    
    return (
        <div className='flex flex-col p-3 md:p-5 gap-4 md:gap-6 bg-white border border-skin-neutral-100 rounded w-full shadow-checkout'>
            <h3 className='primary-gradient-600 text-title-2 md:text-2xl font-semibold w-fit'>Cart Total</h3>
            <div className='flex flex-col gap-3'>
                {!isRedeemed && (
                    <CouponForm
                        onCouponApplied={(discount) => {
                            setCouponDiscount(discount);
                            if (discount.isApplied) {
                                setLoyaltyRedemption(prev => ({ ...prev, isRedeemed: false, discountValue: 0, message: null }));
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
                {couponDiscount.mailSubscriptionData && couponDiscount.mailSubscriptionData.isDiscountUsed === false && mailSubscriptionDiscount > 0 && (
                  <p className='text-green-600 text-content-3 md:text-content-1 font-semibold'>
                        Subscription discount applied with coupon.
                    </p>
                )}
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
                    <div className='mt-2 flex items-center'>
                        <Checkbox isSelected={isRedeemed} onValueChange={handleRedeemToggle} isDisabled={isApplyingLoyalty}>
                            <span className='ml-2 text-sm text-gray-600'>
                                {getRedemptionLabel()}
                            </span>
                        </Checkbox>
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
                        <p className='text-skin-neutral-300'>{DEFAULT_CURRENCY_SYMBOL}{safeSubTotal.toFixed(2)}</p>
                    </div>
                </div>
                <Divider className='border-2' />
                {hasEnabledFreeShipping && (
                    <>
                        <ShippingProgress totalAmount={safeSubTotal} freeShippingThreshold={freeShippingThreshold} />
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

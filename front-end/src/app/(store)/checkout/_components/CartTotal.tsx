'use client'
import ShippingProgress from '@/components/ShippingProgress'
import { DEFAULT_CURRENCY_SYMBOL, ServerActionStatus } from '@/lib/config/app.config'
import { useCart } from '@/lib/context/CartContext'
import { useCheckout } from '@/lib/context/CheckoutContext'
import { Divider, Checkbox } from '@nextui-org/react'
import React, { useEffect, useMemo, useState, useRef } from 'react'
import CouponForm from '@/components/CouponForm'
import { applyCoupon, applyGuestCoupon } from '@/lib/server.actions'
import { getGuestCart } from '@/lib/utils/storage'
import { CartItem } from '@/lib/config/cart.config'
import { APPLY_GUEST_COUPON_PAYLOAD } from '@/lib/config/checkout.config'
import { toast } from 'sonner'
import { APPLY_COUPON_PAYLOAD } from '@/lib/config/checkout.config'
import { useSession } from 'next-auth/react'
import { SHIPPING_METHOD_DATA } from '@/lib/config/order.config'
import { FREE_DELIVERY_THRESHOLD } from '@/lib/utils'

interface CartTotalProps {
    shippingMethodsData: SHIPPING_METHOD_DATA[];
}

const CartTotal: React.FC<CartTotalProps> = ({ shippingMethodsData }) => {  
    const { cartTotal, itemCount, setCouponDiscount, couponDiscount, setIsRemoveCoupon, loyaltyRedemption, setLoyaltyRedemption, setShippingMethodIdForCoupon } = useCart();
    const { selectedShippingMethod } = useCheckout();
    const [isApplyingLoyalty, setIsApplyingLoyalty] = useState(false);
    const { isRedeemed, pointsData: loyaltyPoints, discountValue: loyaltyDiscountValue, message: loyaltyMessage } = loyaltyRedemption;
    const { status } = useSession();
    const isAuthenticated = status === 'authenticated';
    const isRevalidatingRef = useRef(false);
    const lastRevalidatedRef = useRef<{ cartTotal: number; itemCount: number; shippingMethodId: number } | null>(null);

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
    
    // Update shipping method ID in CartContext when selectedShippingMethod changes
    // This ensures coupon revalidation uses the correct shipping method ID when quantity updates
    useEffect(() => {
        const shippingMethodId = selectedShippingMethod?.id ? Number(selectedShippingMethod.id) : 0;
        setShippingMethodIdForCoupon(shippingMethodId);
    }, [selectedShippingMethod, setShippingMethodIdForCoupon]);
    
    // Revalidate coupon when component mounts or when cart/shipping method changes
    // This ensures coupon discount updates when user returns to checkout page after adding products
    useEffect(() => {
        const revalidateCoupon = async () => {
            // Only revalidate if:
            // 1. Coupon is already applied
            // 2. Coupon code exists
            // 3. Shipping method is available (on checkout page)
            // 4. Not already revalidating
            if (!couponDiscount.isApplied || !couponDiscount.code || !selectedShippingMethod || isRevalidatingRef.current) {
                return;
            }
            
            const shippingMethodId = selectedShippingMethod.id ? Number(selectedShippingMethod.id) : 0;
            
            // Check if we already revalidated for this cart state and shipping method
            const lastRevalidated = lastRevalidatedRef.current;
            if (lastRevalidated && 
                lastRevalidated.cartTotal === cartTotal && 
                lastRevalidated.itemCount === itemCount && 
                lastRevalidated.shippingMethodId === shippingMethodId) {
                return; // Already revalidated for this state
            }
            
            isRevalidatingRef.current = true;
            
            try {
                let response;
                
                if (isAuthenticated) {
                    // For authenticated users
                    response = await applyCoupon({
                        couponCode: couponDiscount.code,
                        shippingMethodId: shippingMethodId,
                    });
                } else {
                    // For guest users
                    const guestCartItems: CartItem[] | null = getGuestCart<CartItem[]>();
                    if (!guestCartItems || guestCartItems.length === 0) {
                        isRevalidatingRef.current = false;
                        return;
                    }
                    
                    const cartItemsForApi = guestCartItems.map(item => ({
                        product_id: item.product_id,
                        variant_id: item.variant_id,
                        quantity: item.quantity
                    }));
                    
                    const payload: APPLY_GUEST_COUPON_PAYLOAD = {
                        couponCode: couponDiscount.code,
                        cartItems: cartItemsForApi,
                        shippingMethodId: shippingMethodId,
                        loyalty: false
                    };
                    
                    response = await applyGuestCoupon(payload);
                }
                
                if (response.status === ServerActionStatus.SUCCESS && response.data && response.data.total != null && response.data.coupon) {
                    const couponData = response.data;
                    // Parse values - handle both number and string types from API
                    const apiSubTotalValue = couponData.subTotal as number | string;
                    const apiSubTotal = typeof apiSubTotalValue === 'string'
                        ? parseFloat(apiSubTotalValue.replace(/[^\d.-]/g, '')) || 0
                        : (Number.isFinite(apiSubTotalValue) ? apiSubTotalValue : 0);
                    const apiTotalValue = couponData.total as number | string;
                    const apiTotal = typeof apiTotalValue === 'string'
                        ? parseFloat(apiTotalValue.replace(/[^\d.-]/g, '')) || 0
                        : (Number.isFinite(apiTotalValue) ? apiTotalValue : 0);
                    const apiShippingCostValue = couponData.shippingCost as number | string;
                    const apiShippingCost = typeof apiShippingCostValue === 'string'
                        ? parseFloat(apiShippingCostValue.replace(/[^\d.-]/g, '')) || 0
                        : (Number.isFinite(apiShippingCostValue) ? apiShippingCostValue : 0);
                    
                    const discountAmount = couponData.discount_amount ?? (apiSubTotal - apiTotal);
                    const mailSubscriptionDiscountValue = (couponData.mail_subscription_discount !== undefined && Number.isFinite(couponData.mail_subscription_discount))
                        ? couponData.mail_subscription_discount
                        : undefined;
                    
                    setCouponDiscount({
                        value: Number.isFinite(discountAmount) ? discountAmount : 0,
                        isApplied: true,
                        code: couponDiscount.code,
                        message: couponData.coupon.discount_type === "percentage" ? `Extra ${couponData.coupon.discount_value}% off` : `Extra ${DEFAULT_CURRENCY_SYMBOL}${couponData.coupon.discount_value} off`,
                        discountValue: Number.isFinite(discountAmount) ? discountAmount.toFixed(2) : '0.00',
                        discount_amount: Number.isFinite(couponData.discount_amount) ? couponData.discount_amount : undefined,
                        shippingCost: apiShippingCost,
                        subTotal: apiSubTotal,
                        total: apiTotal,
                        mailSubscriptionData: couponData.mail_subscription_data || couponDiscount.mailSubscriptionData,
                        mailSubscriptionDiscount: mailSubscriptionDiscountValue,
                    });
                    
                    // Update last revalidated state
                    lastRevalidatedRef.current = {
                        cartTotal,
                        itemCount,
                        shippingMethodId
                    };
                } else if (response.status === ServerActionStatus.ERROR) {
                    // Coupon is no longer valid, remove it
                    setCouponDiscount({
                        value: 0,
                        isApplied: false,
                        code: couponDiscount.code,
                        message: null,
                        discountValue: '',
                        mailSubscriptionData: couponDiscount.mailSubscriptionData,
                    });
                }
            } catch (error) {
                console.error('Error revalidating coupon:', error);
            } finally {
                isRevalidatingRef.current = false;
            }
        };
        
        // Revalidate when component mounts or when cart/shipping method changes
        revalidateCoupon();
    }, [isAuthenticated, couponDiscount.code, couponDiscount.isApplied, selectedShippingMethod?.id, cartTotal, itemCount, setCouponDiscount]);
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
            // Loyalty discount: use loyalty-only discount from API when available.
            // NOTE: (subTotal - total) includes deals + loyalty + other discounts, so it is NOT loyalty-only.
            const loyaltyDiscountRaw = checked
                ? (response.data as unknown as { loyalty_discount?: number | string }).loyalty_discount
                : 0;
            const loyaltyDiscountParsed =
                typeof loyaltyDiscountRaw === 'string'
                    ? (parseFloat(loyaltyDiscountRaw.replace(/[^\d.-]/g, '')) || 0)
                    : (typeof loyaltyDiscountRaw === 'number' && Number.isFinite(loyaltyDiscountRaw) ? loyaltyDiscountRaw : 0);
            // Fallback to legacy behavior only if API doesn't provide loyalty_discount
            const discountAmount = checked
                ? (loyaltyDiscountParsed > 0 ? loyaltyDiscountParsed : (apiSubTotal - apiTotal))
                : 0;
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

    // Keep loyalty discount amount in sync with cart total when loyalty is applied.
    // This updates the green "Loyalty points applied" amount (and total calculation) after quantity/add-to-cart changes,
    // without re-calling applyCoupon. Coupon flow is unchanged and remains mutually exclusive with loyalty.
    useEffect(() => {
        if (!isRedeemed) return;
        if (!loyaltyPoints) return;
        if (couponDiscount.isApplied || couponDiscount.code) return;

        const redemptionAmountNum = typeof loyaltyPoints.redemption_amount === 'string'
            ? parseFloat(loyaltyPoints.redemption_amount.replace(/[^\d.-]/g, '')) || 0
            : (Number.isFinite(Number(loyaltyPoints.redemption_amount)) ? Number(loyaltyPoints.redemption_amount) : 0);

        const baseAmount = Number.isFinite(cartTotal) && cartTotal > 0 ? cartTotal : 0;

        const rawDiscount = loyaltyPoints.redemption_type === 'percentage'
            ? (redemptionAmountNum / 100) * baseAmount
            : redemptionAmountNum;

        const nextDiscount = Number.isFinite(rawDiscount)
            ? Math.max(0, Math.round(rawDiscount * 100) / 100)
            : 0;

        // Avoid unnecessary state updates / render loops
        if (Math.abs((loyaltyDiscountValue || 0) - nextDiscount) < 0.01) return;

        setLoyaltyRedemption(prev => ({
            ...prev,
            isRedeemed: true,
            discountValue: nextDiscount,
            message: prev.message ?? 'Loyalty points applied',
        }));
    }, [
        isRedeemed,
        loyaltyPoints,
        cartTotal,
        couponDiscount.isApplied,
        couponDiscount.code,
        loyaltyDiscountValue,
        setLoyaltyRedemption,
    ]);

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
                        <ShippingProgress 
                            totalAmount={safeTotal} 
                            freeShippingThreshold={freeShippingThreshold} 
                            shippingCost={safeShippingCost}
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

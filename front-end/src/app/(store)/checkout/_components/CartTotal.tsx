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
            shippingMethodId: 0,
            loyalty: checked,
        };

        const response = await applyCoupon(payload);
        if (response.status === ServerActionStatus.SUCCESS && response.data) {
            const discountAmount = checked ? (cartTotal - response.data.total) : 0;
            setLoyaltyRedemption(prev => ({
                ...prev,
                isRedeemed: checked,
                discountValue: discountAmount,
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

        if (redemption_type === 'percentage') {
            const discountAmount = (Number(redemption_amount) / 100) * cartTotal;
            return `${pointsPrefix} a ${DEFAULT_CURRENCY_SYMBOL}${discountAmount.toFixed(2)} discount`;
        }

        return `${pointsPrefix} a ${DEFAULT_CURRENCY_SYMBOL}${Number(redemption_amount).toFixed(2)} discount`;
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

    const shippingCost = parseFloat(selectedShippingMethod?.shipping_cost || '0');
    const total = (cartTotal + shippingCost) - couponDiscount.value - loyaltyDiscountValue;
    console.log("loyaltyPoints", loyaltyPoints);
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
                {couponDiscount.mailSubscriptionData && couponDiscount.mailSubscriptionData.isDiscountUsed === false && (
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
                        <p className='text-skin-neutral-300'>{DEFAULT_CURRENCY_SYMBOL}{shippingCost.toFixed(2)}</p>
                    </div>
                    <div className='flex items-center justify-between text-content-2 md:text-title-2 font-bold'>
                        <p className='text-skin-neutral-500 !font-oswald'>Subtotal</p>
                        <p className='text-skin-neutral-300'>{DEFAULT_CURRENCY_SYMBOL}{cartTotal.toFixed(2)}</p>
                    </div>
                </div>
                <Divider className='border-2' />
                {hasEnabledFreeShipping && (
                    <>
                        <ShippingProgress totalAmount={cartTotal} freeShippingThreshold={freeShippingThreshold} />
                        <Divider className='border-2' />
                    </>
                )}
                <div className='flex items-center justify-between text-black font-bold'>
                    <p className='text-title-2 md:text-2xl !font-oswald'>Total</p>
                    <p className='text-title-2 md:text-2xl !font-oswald'>{DEFAULT_CURRENCY_SYMBOL}{total.toFixed(2)}</p>
                </div>
            </div>
        </div>
    )
}

export default CartTotal;

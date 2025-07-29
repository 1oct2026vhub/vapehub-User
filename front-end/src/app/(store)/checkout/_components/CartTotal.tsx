'use client'

import ShippingProgress from '@/components/ShippingProgress'
import { DEFAULT_CURRENCY_SYMBOL, ServerActionStatus } from '@/lib/config/app.config'
import { useCart } from '@/lib/context/CartContext'
import { useCheckout } from '@/lib/context/CheckoutContext'
import { Divider, Checkbox } from '@nextui-org/react'
import React, { useEffect, useState } from 'react'
import CouponForm from '@/components/CouponForm'
import { applyCoupon } from '@/lib/server.actions'
import { toast } from 'sonner'
import { APPLY_COUPON_PAYLOAD } from '@/lib/config/checkout.config'

const CartTotal: React.FC = () => {
    const { cartTotal, itemCount, setCouponDiscount, couponDiscount, setIsRemoveCoupon, loyaltyRedemption, setLoyaltyRedemption } = useCart();
    const { selectedShippingMethod } = useCheckout();
    const [isApplyingLoyalty, setIsApplyingLoyalty] = useState(false);
    const { isRedeemed, pointsData: loyaltyPoints, discountValue: loyaltyDiscountValue, message: loyaltyMessage } = loyaltyRedemption;

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
        console.log("apply coupon response from redeem checkbox", response);

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
        console.log("loyaltyPoints", loyaltyPoints);
        const pointsPrefix = `You're eligible to use ${minimum_points_required} of your ${user_points} loyalty points to get`;
    
        if (redemption_type === 'percentage') {
            return `${pointsPrefix} a ${redemption_amount}% discount`;
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

    const shippingCost = selectedShippingMethod?.shipping_cost || 0;
    const total = (cartTotal + shippingCost) - couponDiscount.value - loyaltyDiscountValue;

    return (
        <div className='flex flex-col p-3 md:p-5 gap-4 md:gap-6 bg-white border border-skin-neutral-100 rounded-14 w-full'>
            <h3 className='primary-gradient-600 text-title-2 md:text-h5 font-bold w-fit'>Cart Total</h3>
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
                    />
                )}
                {couponDiscount.isApplied && couponDiscount.code && (
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
                    <div className='flex items-center justify-between text-content-2 md:text-title-2 font-semibold'>
                        <p className='text-skin-neutral-500'>Number of Items</p>
                        <p className='text-skin-neutral-300'>{itemCount}</p>
                    </div>
                    <div className='flex items-center justify-between text-content-2 md:text-title-2 font-semibold'>
                        <p className='text-skin-neutral-500'>Shipping Cost</p>
                        <p className='text-skin-neutral-300'>{DEFAULT_CURRENCY_SYMBOL}{shippingCost.toFixed(2)}</p>
                    </div>
                    <div className='flex items-center justify-between text-content-2 md:text-title-2 font-semibold'>
                        <p className='text-skin-neutral-500'>Subtotal</p>
                        <p className='text-skin-neutral-300'>{DEFAULT_CURRENCY_SYMBOL}{cartTotal.toFixed(2)}</p>
                    </div>
                </div>
                <Divider className='border-2'/>
                <ShippingProgress />
                <Divider className='border-2'/>
                <div className='flex items-center justify-between text-black font-semibold'>
                    <p className='text-content-2 md:text-title-1'>Total</p>
                    <p className='text-title-2 md:text-h5'>{DEFAULT_CURRENCY_SYMBOL}{total.toFixed(2)}</p>
                </div>
            </div>
        </div>
    )
}

export default CartTotal;

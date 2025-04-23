'use client'

import ShippingProgress from '@/components/ShippingProgress'
import { DEFAULT_CURRENCY_SYMBOL } from '@/lib/config/app.config'
import { useCart } from '@/lib/context/CartContext'
import { useCheckout } from '@/lib/context/CheckoutContext'
import { Divider } from '@nextui-org/react'
import React from 'react'
import CouponForm from '@/components/CouponForm'

const CartTotal: React.FC = () => {
    const { cartTotal, itemCount, setCouponDiscount, couponDiscount } = useCart();
    const { selectedShippingMethod } = useCheckout();

    const shippingCost = selectedShippingMethod?.shipping_cost || 0;
    const total = (cartTotal + shippingCost) - couponDiscount.value;

    return (
        <div className='flex flex-col p-3 md:p-5 gap-4 md:gap-6 bg-white border border-skin-neutral-100 rounded-14 w-full'>
            <h3 className='primary-gradient-600 text-title-2 md:text-h5 font-bold w-fit'>Cart Total</h3>
            <div className='flex flex-col gap-3'>
                <CouponForm 
                    onCouponApplied={setCouponDiscount}
                    initialCouponCode={couponDiscount.code || ''}
                    cartTotal={cartTotal}
                />
                {couponDiscount.isApplied && (
                    <div className='flex items-center justify-between text-skin-primary-400 text-content-3 md:text-content-1 font-bold'>
                        <p>{couponDiscount.message}</p>
                        <p>-{DEFAULT_CURRENCY_SYMBOL} {couponDiscount.discountValue}</p>
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

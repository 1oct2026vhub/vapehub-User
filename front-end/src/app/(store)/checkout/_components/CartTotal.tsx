'use client'

import { EditIcon2 } from '@/components/Icons' 
import ShippingProgress from '@/components/ShippingProgress'
import { DEFAULT_CURRENCY_SYMBOL } from '@/lib/config/app.config'
import { useCart } from '@/lib/context/CartContext'
import { useCheckout } from '@/lib/context/CheckoutContext'
import { Button, Divider } from '@nextui-org/react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { APPLY_COUPON_FORM_SCHEMA, APPLY_COUPON_FORM_TYPE, APPLY_COUPON_PAYLOAD } from '@/lib/config/checkout.config'
import { applyCoupon } from '@/lib/server.actions'
import { ServerActionStatus } from '@/lib/config/app.config'
import { toast } from 'sonner'
import InputField from '@/components/InputField'

const CartTotal: React.FC = () => {
    const { cartTotal, itemCount, setCouponDiscount, couponDiscount } = useCart();
    const { selectedShippingMethod } = useCheckout();
    const [couponSuccessMessage, setCouponSuccessMessage] = useState(couponDiscount.isApplied ? 'Coupon applied successfully' : '');

    const couponForm = useForm<APPLY_COUPON_FORM_TYPE>({
        resolver: zodResolver(APPLY_COUPON_FORM_SCHEMA),
        defaultValues: {
            couponCode: couponDiscount.code || '',
            shippingMethodId: selectedShippingMethod?.id || 0,
        }
    });

    const handleApplyCoupon = async (data: APPLY_COUPON_FORM_TYPE) => {
        const response = await applyCoupon(data as unknown as APPLY_COUPON_PAYLOAD);
        if (response.status === ServerActionStatus.SUCCESS) {
            setCouponSuccessMessage("Coupon applied successfully");
            setCouponDiscount({
                value: cartTotal - response.data.total,
                isApplied: true,
                code: data.couponCode || null,
                message: response.data.coupon.description,
                discountValue: response.data.coupon.discount_value
            });
        } else {
            toast.error(response.message);
            couponForm.reset({ couponCode: '' });
            setCouponDiscount({
                value: 0,
                isApplied: false,
                code: null,
                message: null,
                discountValue: ''
            });
        }
    };

    const shippingCost = selectedShippingMethod?.shipping_cost || 0;
    const total = (cartTotal + shippingCost) - couponDiscount.value;

    return (
        <div className='flex flex-col p-3 md:p-5 gap-4 md:gap-6 bg-white border border-skin-neutral-100 rounded-14 w-full'>
            <h2 className='primary-gradient-600 text-title-2 md:text-h5 font-bold w-fit'>Cart Total</h2>
            <div className='flex flex-col gap-3'>
                <div className='flex items-start gap-3'>
                    <InputField
                        type='text'
                        label="Coupon Code"
                        isRequired
                        className='xl:min-w-[366px]'
                        placeholder='THN-865'
                        control={couponForm.control}
                        name='couponCode'
                    />
                    <Button
                        size="lg"
                        radius="md"
                        color="primary"
                        className="btn shadow-button bg-skin-neutral-500 !text-skin-white !p-4 !w-fit !min-w-fit !rounded-10"
                        startContent={<EditIcon2 />}
                        onPress={() => couponForm.handleSubmit(handleApplyCoupon)()}
                        isLoading={couponForm.formState.isSubmitting}
                        isDisabled={!couponForm.formState.isValid}
                    />
                </div>
                {couponSuccessMessage && (
                    <p className='primary-gradient-100 text-content-3 md:text-content-1 font-bold'>
                        {couponSuccessMessage}
                    </p>
                )}
                <Divider className='border-2' />
                {couponDiscount.isApplied && (
                    <div className='flex items-center justify-between text-skin-primary-400 text-content-3 md:text-content-1 font-bold'>
                        <p>{couponDiscount.message}</p>
                        <p>-{DEFAULT_CURRENCY_SYMBOL} {couponDiscount.discountValue}</p>
                    </div>
                )}
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

"use client"
import ShippingProgress from '@/components/ShippingProgress'
import { DEFAULT_CURRENCY_SYMBOL, ServerActionStatus } from '@/lib/config/app.config'
import { useCart } from '@/lib/context/CartContext'
import { ROUTES } from '@/lib/routes'
import { checkout } from '@/lib/server.actions'
import { Button, Divider } from '@nextui-org/react'
import { useRouter } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import CouponForm from '@/components/CouponForm'
import { CHECKOUT_PAYLOAD } from '@/lib/config/checkout.config'

const CartDetails: React.FC = () => {
    const { status } = useSession();
    const { cartTotal, itemCount, couponDiscount, setCouponDiscount, checkoutStockValidation, stockValidationLoading, setIsRemoveCoupon } = useCart();
    const router = useRouter();

    const handleCheckout = async () => {
        const isValid = await checkoutStockValidation();
        if(isValid) {
            const response = await checkout({ couponCode: couponDiscount.code || '' } as unknown as CHECKOUT_PAYLOAD);
            if(response.status === ServerActionStatus.SUCCESS) {
                router.push(ROUTES.CHECKOUT);
            } else {
                toast.error(response.message);
            }
        }
    }

    return (
        <div className='flex flex-col p-3 md:p-5 gap-3 bg-white border border-skin-neutral-100 rounded-14 w-full lg:w-4/6 xl:w-full xl:max-w-[584px]'>
            {status === 'authenticated' && (
                <>
                    <CouponForm 
                        onCouponApplied={setCouponDiscount}
                        initialCouponCode={couponDiscount.code || ''}
                        cartTotal={cartTotal}
                    />
                    {couponDiscount.isApplied && (
                        <div className='flex items-center justify-between text-skin-primary-400 text-content-3 md:text-content-1 font-bold'>
                            <div className='flex flex-col'> 
                                <p>{couponDiscount.message}</p>
                                <p>Coupon: {couponDiscount.code}</p>
                            </div>
                            <div className='flex items-center'>
                                <p>-{DEFAULT_CURRENCY_SYMBOL} {couponDiscount.discountValue}</p>
                                <button 
                                    className='text-red-500 hover:underline text-content-3 md:text-content-1 font-bold'
                                    onClick={() => setIsRemoveCoupon(true)}
                                >
                                    [Remove]
                                </button>
                            </div>
                        </div>
                    )}
                    <Divider />
                </>
            )}
            <div className='space-y-1.5'>
                <div className='flex items-center justify-between text-content-2 md:text-title-2 font-semibold'>
                    <p className='text-skin-neutral-500'>Number of Items</p>
                    <p className='text-skin-neutral-300'>{itemCount}</p>
                </div>
                <div className='flex items-center justify-between text-content-2 md:text-title-2 font-semibold'>
                    <p className='text-skin-neutral-500'>Subtotal</p>
                    <p className='text-skin-neutral-300'>{DEFAULT_CURRENCY_SYMBOL} {cartTotal.toFixed(2)}</p>
                </div>
            </div>
            <Divider />
            <ShippingProgress />
            <Divider />
            <div className='flex items-center justify-between text-black font-semibold'>
                <p className='text-content-2 md:text-title-1'>Total</p>
                <p className='text-title-2 md:text-h5'>{DEFAULT_CURRENCY_SYMBOL} {couponDiscount.isApplied ?  (cartTotal - couponDiscount.value).toFixed(2): (cartTotal).toFixed(2)}</p>
            </div>
            <Button
                size="lg"
                radius="md"
                color="primary"
                className="w-full btn primary-btn shadow-button !text-skin-white !rounded-10 text-content-1 md:text-title-1 !py-4 !px-6 max-md:!h-9.5"
                onPress={handleCheckout}
                isLoading={stockValidationLoading}
            >
                Checkout Now
            </Button>
        </div>
    )
}

export default CartDetails

"use client"
import InputField from '@/components/InputField'
import ShippingProgress from '@/components/ShippingProgress'
import { DEFAULT_CURRENCY_SYMBOL, ServerActionStatus } from '@/lib/config/app.config'
import { APPLY_COUPON_FORM_SCHEMA, APPLY_COUPON_FORM_TYPE, APPLY_COUPON_PAYLOAD, CHECKOUT_PAYLOAD } from '@/lib/config/checkout.config'
import { useCart } from '@/lib/context/CartContext'
import { ROUTES } from '@/lib/routes'
import { applyCoupon, checkout } from '@/lib/server.actions'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Divider } from '@nextui-org/react' 
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

const CartDetails: React.FC = () => {
    const { status } = useSession();
    const cartCouponFormConfig = useForm<APPLY_COUPON_FORM_TYPE>({
        resolver: zodResolver(APPLY_COUPON_FORM_SCHEMA),
        mode: 'onSubmit',
    });

    const { cartTotal, itemCount } = useCart();
    const [couponSuccessMessage, setCouponSuccessMessage] = useState('');
    const router = useRouter();

    const handleFormSubmit = async (data: { couponCode?: string; shippingMethodId?: number })  => {
        const response = await applyCoupon(data as unknown as APPLY_COUPON_PAYLOAD);
        if(response.status === ServerActionStatus.SUCCESS) {
            setCouponSuccessMessage(response.data.message);
        } else {
            toast.error(response.message);
            cartCouponFormConfig.reset();
        }
    }

  const handleCheckout = async () => {
    
    const couponCode = cartCouponFormConfig.getValues('couponCode') || '';
    if(!couponCode) {
        router.replace(ROUTES.CHECKOUT);
        return;
    }
    const response = await checkout({ couponCode } as unknown as CHECKOUT_PAYLOAD);
    if(response.status === ServerActionStatus.SUCCESS) {
        router.push(ROUTES.CHECKOUT);
    } else {
        toast.error(response.message);
    }
  }

    return (
        <div className='flex flex-col p-3 md:p-5 gap-3 bg-white border border-skin-neutral-100 rounded-14 w-full lg:w-4/6 xl:w-full xl:max-w-[584px]'>
            {status === 'authenticated' && (
                <>
                <form onSubmit={cartCouponFormConfig.handleSubmit(handleFormSubmit)} className='flex items-center gap-3'>
                    <InputField
                        type='text'
                        label="Coupon Code"
                        isRequired
                        className='xl:min-w-[366px]'
                        control={cartCouponFormConfig.control}
                        name='couponCode'
                    />
                    <Button
                        size="lg"
                        radius="md"
                        color="primary"
                        className="btn primary-btn shadow-button !text-skin-white !rounded-10 text-content-1 md:text-title-1 !leading-none min-w-[130px] md:!min-w-[166px] !font-medium h-11 md:h-12"
                        type='submit'
                        isLoading={cartCouponFormConfig.formState.isSubmitting}
                        isDisabled={!cartCouponFormConfig.formState.isValid}
                    >
                        Apply Code
                    </Button>
                </form>
            
           {couponSuccessMessage && <p className='text-success-500 text-content-3 md:text-content-1 font-bold'>{couponSuccessMessage}</p>}
            <Divider />
            <div className='flex items-center justify-between text-skin-primary-400 text-content-3 md:text-content-1 font-bold'>
                <p>Extra 10% Off</p>
                <p>-£ 6.58</p>
            </div>
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
                <p className='text-title-2 md:text-h5'>{DEFAULT_CURRENCY_SYMBOL} {cartTotal.toFixed(2)}</p>
            </div>
            <Button
                size="lg"
                radius="md"
                color="primary"
                className="w-full btn primary-btn shadow-button !text-skin-white !rounded-10 text-content-1 md:text-title-1 !py-4 !px-6 max-md:!h-9.5"
                onPress={handleCheckout}
            >
                Checkout Now
            </Button>
        </div>
    )
}

export default CartDetails

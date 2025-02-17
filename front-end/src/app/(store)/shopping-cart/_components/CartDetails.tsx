import InputForm from '@/components/InputForm'
import ShippingProgress from '@/components/ShippingProgress'
import { Button, Divider } from '@nextui-org/react'
import React from 'react'

const CartDetails: React.FC = () => {
    return (
        <div className='flex flex-col p-3 md:p-5 gap-3 bg-white border border-skin-neutral-100 rounded-14 w-full lg:w-4/6 xl:w-full xl:max-w-[584px]'>
            <div className='flex items-center gap-3'>
                <InputForm
                    type='text'
                    label="Coupon Code"
                    isRequired
                    className='xl:min-w-[366px]'
                />
                <Button
                    size="lg"
                    radius="md"
                    color="primary"
                    className="btn primary-btn shadow-button !text-skin-white !rounded-10 text-content-1 md:text-title-1 !leading-none min-w-[130px] md:!min-w-[166px] !font-medium h-9.5 md:h-max"
                >
                    Apply Code
                </Button>
            </div>
            <Divider />
            <div className='flex items-center justify-between text-skin-primary-400 text-content-3 md:text-content-1 font-bold'>
                <p>Extra 10% Off</p>
                <p>-£ 6.58</p>
            </div>
            <div className='space-y-1.5'>
                <div className='flex items-center justify-between text-content-2 md:text-content-1 font-semibold'>
                    <p className='text-skin-neutral-500'>Number of Items</p>
                    <p className='text-skin-neutral-300'>15</p>
                </div>
                <div className='flex items-center justify-between text-content-2 md:text-content-1 font-semibold'>
                    <p className='text-skin-neutral-500'>Subtotal</p>
                    <p className='text-skin-neutral-300'>£ 65.58</p>
                </div>
            </div>
            <Divider />
            <ShippingProgress />
            <Divider />
            <div className='flex items-center justify-between text-black font-semibold'>
                <p className='text-content-2 md:text-title-1'>Total</p>
                <p className='text-title-2 md:text-h5'>£ 65.58</p>
            </div>
            <Button
                size="lg"
                radius="md"
                color="primary"
                className="w-full btn primary-btn shadow-button !text-skin-white !rounded-10 text-content-1 md:text-title-1 !py-4 !px-6 max-md:!h-9.5"
            >
                Checkout Now
            </Button>
        </div>
    )
}

export default CartDetails

import { EditIcon2 } from '@/components/Icons'
import InputForm from '@/components/InputForm'
import ShippingProgress from '@/components/ShippingProgress'
import { Button, Divider } from '@nextui-org/react'
import React from 'react'

const CartTotal: React.FC = () => {
    return (
        <div className='flex flex-col p-3 md:p-5 gap-4 md:gap-6 bg-white border border-skin-neutral-100 rounded-14 w-full'>
            <h2 className='primary-gradient-600 text-title-2 md:text-h5 font-bold w-fit'>Cart Total</h2>
            <div className='flex flex-col gap-3'>
                <div className='flex items-start gap-3'>
                    <InputForm
                        type='text'
                        label="Coupon Code"
                        size='lg'
                        isRequired
                        className='xl:min-w-[366px]'
                        placeholder='THN-865'
                    />
                    <Button
                        size="lg"
                        radius="md"
                        color="primary"
                        className="btn shadow-button bg-skin-neutral-500 !text-skin-white !p-4 !w-fit !min-w-fit !rounded-10"
                        startContent={<EditIcon2 />}
                    />
                </div>
                <Divider />
                <div className='flex items-center justify-between text-skin-primary-400 text-content-3 md:text-content-1 font-bold'>
                    <p>Extra 10% Off</p>
                    <p>-£ 6.58</p>
                </div>
                <div className='space-y-1.5'>
                    <div className='flex items-center justify-between text-content-2 md:text-title-2 font-semibold'>
                        <p className='text-skin-neutral-500'>Number of Items</p>
                        <p className='text-skin-neutral-300'>15</p>
                    </div>
                    <div className='flex items-center justify-between text-content-2 md:text-title-2 font-semibold'>
                        <p className='text-skin-neutral-500'>Shipping Cost</p>
                        <p className='text-skin-neutral-300'>15</p>
                    </div>
                    <div className='flex items-center justify-between text-content-2 md:text-title-2 font-semibold'>
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
            </div>
        </div>
    )
}

export default CartTotal;

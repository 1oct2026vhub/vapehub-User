import { DEFAULT_CURRENCY_SYMBOL } from '@/lib/config/app.config'
import { ORDER } from '@/lib/config/order.config'
import { DEFAULT_COUNTRY } from '@/lib/utils/address.utils'
import React from 'react'
type OrderDetailsProps = {
    data: ORDER
}

const OrderDetails: React.FC<OrderDetailsProps> = ({data}) => {
    return (
        <div className='flex flex-col gap-4 md:gap-6 max-md:pb-6 border-b md:border-r md:border-b-0 border-skin-neutral-200 w-full md:w-[50%] xl:w-[60%]'>
            <div className='space-y-2'>
                <h4 className='text-skin-neutral-400 font-semibold text-content-1 md:text-title-1'>Order Total</h4>
                <div className='space-y-1 text-content-1 md:text-title-2 text-skin-neutral-300 font-bold'>
                    <p>{DEFAULT_CURRENCY_SYMBOL}{data.total}</p>
                </div>
            </div>
           <div className='space-y-2'>
                <h4 className='text-skin-neutral-400 font-semibold text-content-1 md:text-title-1'>Shipping Cost</h4>
                <div className='space-y-1 text-content-1 md:text-title-2 text-skin-neutral-300 font-bold'>
                    <p>{DEFAULT_CURRENCY_SYMBOL}{data.shippingMethod?.shipping_cost || 0}</p>
                </div>
            </div>

            <div className='space-y-2'>
                <h4 className='text-skin-neutral-400 font-semibold text-content-1 md:text-title-1'>Shipping Details</h4>
                <div className='space-y-1 text-content-1 md:text-title-2 text-skin-neutral-300 font-bold'>
                    <h5>{data.shippingAddress?.name || ""}</h5>
                    <p>{data.shippingAddress?.street || ""}</p>
                    <p>{data.shippingAddress?.post_code || ""}</p>
                    <p>{data.shippingAddress?.country || DEFAULT_COUNTRY}</p>
                </div>
            </div>

            <div className='space-y-2'>
                <h4 className='text-skin-neutral-400 font-semibold text-content-1 md:text-title-1'>Billing Details</h4>
                <div className='space-y-1 text-content-1 md:text-title-2 text-skin-neutral-300 font-bold'>
                    <h5>{data.billingAddress?.name || ""}</h5>
                    <p>{data.billingAddress?.street || ""}</p>
                    <p>{data.billingAddress?.post_code || ""}</p>
                    <p>{data.billingAddress?.country || DEFAULT_COUNTRY}</p>
                </div>
            </div>

            <div className='space-y-2'>
                <h4 className='text-skin-neutral-400 font-semibold text-content-1 md:text-title-1'>Contact Details</h4>
                <div className='space-y-1 text-content-1 md:text-title-2 text-skin-neutral-300 font-bold'>
                    <p>{data.email || ""}</p>
                    <p>{data.phone || ""}</p>
                </div>
            </div>

            <div className='space-y-2'>
                <h4 className='text-skin-neutral-400 font-semibold text-content-1 md:text-title-1'>Shipping Method</h4>
                <div className='space-y-1 text-content-1 md:text-title-2 text-skin-neutral-300 font-bold'>
                    <p>{data.shippingMethod?.shipping_method || ""}</p>
                </div>
            </div>

            <div className='space-y-2'>
                <h4 className='text-skin-neutral-400 font-semibold text-content-1 md:text-title-1'>Order ID</h4>
                <div className='space-y-1 text-content-1 md:text-title-2 text-skin-neutral-300 font-bold'>
                    <p>{data.order_unique_id}</p>
                </div>
            </div>
            <div className='space-y-2'>
                <h4 className='text-skin-neutral-400 font-semibold text-content-1 md:text-title-1'>Order Date</h4>
                <div className='space-y-1 text-content-1 md:text-title-2 text-skin-neutral-300 font-bold'>
                    <p>{new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
            </div>
        </div>
    )
}

export default OrderDetails

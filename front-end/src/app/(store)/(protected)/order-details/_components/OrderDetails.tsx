import { DEFAULT_CURRENCY_SYMBOL } from '@/lib/config/app.config'
import { ORDER, REFERRAL } from '@/lib/config/order.config'
import { DEFAULT_COUNTRY } from '@/lib/utils/address.utils'
import React from 'react'
type OrderDetailsProps = {
    data: ORDER;
    referral: REFERRAL
}

const OrderDetails: React.FC<OrderDetailsProps> = ({data, referral}) => {
  
    return (
        <div className='grid grid-cols-2 space-y-3 justify-between max-md:pb-6 w-full'>
            <div className='space-y-2'>
                <div className='!font-oswald text-skin-neutral-400 font-semibold text-content-1 md:text-title-1'>Order Total</div>
                <div className='space-y-1 text-content-1 md:text-title-2 text-skin-neutral-300 font-bold'>
                    <p>{DEFAULT_CURRENCY_SYMBOL}{data.total}</p>
                </div>
            </div>
           <div className='space-y-2'>
                <div className='!font-oswald text-skin-neutral-400 font-semibold text-content-1 md:text-title-1'>Shipping Cost</div>
                <div className='space-y-1 text-content-1 md:text-title-2 text-skin-neutral-300 font-bold'>
                    <p>{DEFAULT_CURRENCY_SYMBOL}{data.shippingMethod?.shipping_cost || 0}</p>
                </div>
            </div>

            <div className='space-y-2'>
                <div className='!font-oswald text-skin-neutral-400 font-semibold text-content-1 md:text-title-1'>Shipping Details</div>
                <div className='space-y-1 text-content-1 md:text-title-2 text-skin-neutral-300 font-bold'>
                    <p className='!font-oswald'>{data.orderShippingAddress?.name || ""} {data.orderShippingAddress?.last_name || ""}</p>
                    <p>{data.orderShippingAddress?.street || ""}</p>
                    <p>{data.orderShippingAddress?.post_code || ""}</p>
                    <p>{data.orderShippingAddress?.country || DEFAULT_COUNTRY}</p>
                </div>
            </div>

            <div className='space-y-2'>
                <div className='!font-oswald text-skin-neutral-400 font-semibold text-content-1 md:text-title-1'>Billing Details</div>
                <div className='space-y-1 text-content-1 md:text-title-2 text-skin-neutral-300 font-bold'>
                    <p className='!font-oswald'>{data.orderBillingAddress?.name || ""} {data.orderBillingAddress?.last_name || ""}</p>
                    <p>{data.orderBillingAddress?.street || ""}</p>
                    <p>{data.orderBillingAddress?.post_code || ""}</p>
                    <p>{data.orderBillingAddress?.country || DEFAULT_COUNTRY}</p>
                </div>
            </div>
            <div className='space-y-2'>
                <div className='!font-oswald text-skin-neutral-400 font-semibold text-content-1 md:text-title-1'>Payment Method</div>
                <div className='space-y-1 text-content-1 md:text-title-2 text-skin-neutral-300 font-bold'>
                    <p>{data.paymentMethod?.payment_method || ""}</p>
                    {/* <p className='capitalize'>{data.paymentMethod?.status || ""}</p> */}
                </div>
            </div>

            <div className='space-y-2'>
                <div className='!font-oswald text-skin-neutral-400 font-semibold text-content-1 md:text-title-1'>Contact Details</div>
                <div className='space-y-1 text-content-1 md:text-title-2 text-skin-neutral-300 font-bold'>
                    <p>{data.email || ""}</p>
                    <p>{data.phone || ""}</p>
                </div>
            </div>

            <div className='space-y-2'>
                <div className='!font-oswald text-skin-neutral-400 font-semibold text-content-1 md:text-title-1'>Shipping Method</div>
                <div className='space-y-1 text-content-1 md:text-title-2 text-skin-neutral-300 font-bold'>
                    <p>{data.shippingMethod?.shipping_method || ""}</p>
                </div>
            </div>

            {
                    referral && (
                    <div className='space-y-2'>
                        <div className='!font-oswald text-skin-neutral-400 font-semibold text-content-1 md:text-title-1'>Applied Coupon</div>
                        <div className='space-y-1 text-content-1 md:text-title-2 text-skin-neutral-300 font-bold'>
                            <p>{referral.coupon_code}</p>
                           <p>{referral.coupon_type === "percentage" ? `Extra ${referral.coupon_value}% off` : `Extra ${DEFAULT_CURRENCY_SYMBOL}${referral.coupon_value} off`}</p>
                           <p>Discount: -{referral.coupon_discount}</p>
                        </div>
                    </div>
                )
            }

            <div className='space-y-2'>
                <div className='!font-oswald text-skin-neutral-400 font-semibold text-content-1 md:text-title-1'>Order ID</div>
                <div className='space-y-1 text-content-1 md:text-title-2 text-skin-neutral-300 font-bold'>
                    <p>{data.order_unique_id}</p>
                </div>
            </div>
            <div className='space-y-2'>
                <div className='!font-oswald text-skin-neutral-400 font-semibold text-content-1 md:text-title-1'>Order Date</div>
                <div className='space-y-1 text-content-1 md:text-title-2 text-skin-neutral-300 font-bold'>
                    <p>{new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
            </div>
            
        </div>
    )
}

export default OrderDetails

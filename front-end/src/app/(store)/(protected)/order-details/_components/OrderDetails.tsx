import React from 'react'

const OrderDetails: React.FC = () => {
    return (
        <div className='flex flex-col gap-4 md:gap-6 max-md:pb-6 border-b md:border-r md:border-b-0 border-skin-neutral-200 w-full md:w-[50%] xl:w-[60%]'>
            <div className='space-y-2'>
                <h4 className='text-skin-neutral-400 font-semibold text-content-1 md:text-title-1'>Shipping Details</h4>
                <div className='space-y-1 text-content-1 md:text-title-2 text-skin-neutral-300 font-bold'>
                    <h5>Neerajdev R</h5>
                    <p>64 Ockham Road, East Sleekburn</p>
                    <p>NE22 1PN</p>
                    <p>UK</p>
                </div>
            </div>

            <div className='space-y-2'>
                <h4 className='text-skin-neutral-400 font-semibold text-content-1 md:text-title-1'>Contact Details</h4>
                <div className='space-y-1 text-content-1 md:text-title-2 text-skin-neutral-300 font-bold'>
                    <p>neeraj@gmail.com</p>
                    <p>8075999260, 9497908268</p>
                </div>
            </div>

            <div className='space-y-2'>
                <h4 className='text-skin-neutral-400 font-semibold text-content-1 md:text-title-1'>Shipping Method</h4>
                <div className='space-y-1 text-content-1 md:text-title-2 text-skin-neutral-300 font-bold'>
                    <p>Royal Mail Next Day Guaranteed</p>
                </div>
            </div>

            <div className='space-y-2'>
                <h4 className='text-skin-neutral-400 font-semibold text-content-1 md:text-title-1'>Order ID</h4>
                <div className='space-y-1 text-content-1 md:text-title-2 text-skin-neutral-300 font-bold'>
                    <p>0256HSHS962JS</p>
                </div>
            </div>
        </div>
    )
}

export default OrderDetails

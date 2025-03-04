import { Button } from '@nextui-org/button'
import { NextPage } from 'next'
import Image from 'next/image'
import React from 'react'

const PaymentSuccess: NextPage = () => {
    return (
        <div className="auth-form-container md:!py-[84px]">
            <div className="auth-form-wrapper !space-y-0 !rounded-2xl !max-w-[600px] !p-5 !gap-5">
                <div className="space-y-3.5 text-center w-full">
                    <Image
                        src='/images/payment-success.svg'
                        alt="payment success"
                        width={200}
                        height={200}
                        className="mx-auto"
                    />
                    <h1 className="mx-auto text-title-2 md:text-title-1 text-skin-neutral-300 font-bold ">Puff, Paid, Perfect!</h1>
                    <p className="text-content-2 md:text-content-1 text-center font-bold text-skin-neutral-300 mx-auto max-w-[406px]">Payment complete. Your next puff is on its way.</p>
                </div>

                <div className='py-5 border-t border-b border-skin-neutral-100 w-full space-y-3.5'>
                    <div className='flex items-center justify-between text-content-2 font-bold text-skin-neutral-300 leading-none capitalize'>
                        <p>Transaction ID</p>
                        <p>MTV9001556</p>
                    </div>
                    <div className='flex items-center justify-between text-content-2 font-bold text-skin-neutral-300 leading-none capitalize'>
                        <p>Amount Paid</p>
                        <p>£14</p>
                    </div>
                    <div className='flex items-center justify-between text-content-2 font-bold text-skin-neutral-300 leading-none capitalize'>
                        <p>Payment Method</p>
                        <p>Online</p>
                    </div>
                    <div className='flex items-center justify-between text-content-2 font-bold text-skin-neutral-300 leading-none capitalize'>
                        <p>Date</p>
                        <p>01/02/2025</p>
                    </div>
                    <div className='flex items-center justify-between text-content-2 font-bold text-skin-neutral-300 leading-none capitalize'>
                        <p>Time</p>
                        <p>02:25 AM</p>
                    </div>
                </div>

                <Button
                    size="lg"
                    radius="md"
                    color="primary"
                    className="btn primary-btn shadow-input text-content-1 !font-medium h-11 mx-auto"
                >
                    View Product
                </Button>

            </div>
        </div>
    )
}

export default PaymentSuccess

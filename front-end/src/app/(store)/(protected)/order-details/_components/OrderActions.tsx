"use client"
import { Button } from '@nextui-org/button'
import Image from 'next/image'
import React, { useState } from 'react'
import ReviewForm from '@/components/ReviewForm'

const OrderActions: React.FC = () => {
    const [showReviewForm, setShowReviewForm] = useState(false)

    const handleReviewSubmit = (rating: number, review: string) => {
        // TODO: Implement review submission logic
        console.log('Review submitted:', { rating, review })
        setShowReviewForm(false);
    }

    return (
        <div className='space-y-3.5 w-full md:w-[50%] xl:w-[40%]'>
            <h3 className='text-title-2 md:text-h5 text-skin-neutral-400 font-semibold leading-none'>More Action</h3>
            <div className='space-y-3 w-full'>
                <div className='flex items-center gap-4 justify-between w-full'>
                    <div className='flex items-center gap-1'>
                        <Image
                            src="/images/pdfthumb.svg"
                            alt="pdf thumb"
                            width={30}
                            height={30}
                        />
                        <p className='text-skin-neutral-300 text-title-2 font-bold'>Download Invoice</p>
                    </div>
                    <Button
                        size='sm'
                        radius='sm'
                        variant='bordered'
                        color='default'
                        className='border-skin-neutral-500 rounded-10 min-w-[114px] text-skin-neutral-500 !text-content-2 font-extrabold'
                    >Download</Button>
                </div>
                <div className='flex items-center gap-4 justify-between w-full'>
                    <div className='flex items-center gap-1'>
                        <p className='text-skin-neutral-300 text-title-2 font-bold'>Write Review</p>
                    </div>
                    <Button
                        size='sm'
                        radius='sm'
                        variant='bordered'
                        color='default'
                        className='border-skin-neutral-500 rounded-10 min-w-[114px] text-skin-neutral-500 !text-content-2 font-extrabold'
                        onPress={() => setShowReviewForm(!showReviewForm)}
                    >Write Review</Button>
                </div>
                {showReviewForm && (
                    <div className='mt-4 p-4 border border-skin-neutral-100 rounded-xl'>
                        <ReviewForm onSubmit={handleReviewSubmit} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default OrderActions

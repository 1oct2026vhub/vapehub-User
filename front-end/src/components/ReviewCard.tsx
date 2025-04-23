import React from 'react'
import { RatingStarEmpty, RatingStarFilled, RatingStarPartial } from './Icons'
import Image from 'next/image'

const ReviewCard: React.FC = () => {
    return (
        <div className='bg-skin-white border border-skin-neutral-50 rounded-3xl shadow space-y-3 p-6'>
            <div className="flex items-start justify-between">
                <Image
                    src='/images/avatar.png'
                    alt='User'
                    width={60}
                    height={60}
                    className="max-w-8 min-w-8 md:min-w-[60px] md:max-w-max"
                />
                <div className='space-y-5 text-right'>
                    <div className="flex items-center gap-1">
                        <RatingStarFilled className="max-w-3.5 md:max-w-max" />
                        <RatingStarFilled className="max-w-3.5 md:max-w-max" />
                        <RatingStarFilled className="max-w-3.5 md:max-w-max" />
                        <RatingStarPartial className="max-w-3.5 md:max-w-max" />
                        <RatingStarEmpty className="max-w-3.5 md:max-w-max" />
                    </div>
                    <p className='text-skin-blue-500 font-medium text-content-1'>4 January 2024</p>
                </div>
            </div>
            <h4 className='text-22 text-skin-blue-500 font-semibold'>Savannah Nguyen</h4>
            <p className='text-title-2 font-medium text-skin-neutral-500'>Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit.
                Exercitation veniam consequat sunt nostrud amet. Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet.</p>
        </div>
    )
}

export default ReviewCard

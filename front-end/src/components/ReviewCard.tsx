import React from 'react'
import { RatingStarEmpty, RatingStarFilled } from './Icons'
import Image from 'next/image'
import { REVIEWS } from '@/lib/config/order.config';

const ReviewCard: React.FC<{ review: REVIEWS }> = ({ review }) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getDisplayName = () => {
        const firstName = review.user.first_name?.trim();
        const lastName = review.user.last_name?.trim();
        
        if (!firstName || !lastName) {
            return 'Anonymous';
        }
        
        return `${firstName} ${lastName}`;
    };

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
                        {[...Array(5)].map((_, index) => (
                            index < review.rating ? (
                                <RatingStarFilled key={index} className="w-6 h-6" />
                            ) : (
                                <RatingStarEmpty key={index} className="w-6 h-6" />
                            )
                        ))}
                    </div>
                    <p className='text-skin-blue-500 font-medium text-content-1'>{formatDate(review.created_at)}</p>
                </div>
            </div>
            <h4 className='text-22 text-skin-blue-500 font-semibold capitalize'>{getDisplayName()}</h4>
            <p className='text-title-2 font-medium text-skin-neutral-500'>{review.comment}</p>
        </div>
    )
}

export default ReviewCard

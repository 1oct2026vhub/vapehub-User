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
        const firstName = review.user?.first_name?.trim();
        const lastName = review.user?.last_name?.trim();
        
        if (!firstName || !lastName) {
            return 'Anonymous';
        }
        
        return `${firstName} ${lastName}`;
    };

    const getInitials = () => {
        const firstName = review.user?.first_name?.trim();
        const lastName = review.user?.last_name?.trim();
    
        if (!firstName && !lastName) {
            return 'A';
        }
    
        const firstInitial = firstName ? firstName.charAt(0) : '';
        const lastInitial = lastName ? lastName.charAt(0) : '';
    
        return `${firstInitial}${lastInitial}`.toUpperCase();
    };

    return (
        <div className='bg-skin-white border border-skin-neutral-50 rounded-3xl shadow space-y-3 p-6'>
            <div className="flex items-start justify-between">
                <div className="w-[60px] h-[60px] rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center">
                    {review.user?.profile_pic_url ? (
                        <Image
                            src={review.user.profile_pic_url}
                            alt={getDisplayName()}
                            width={60}
                            height={60}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-orange-300 to-orange-400 text-white text-xl font-bold">
                            <span>{getInitials()}</span>
                        </div>
                    )}
                </div>
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
                    <p className='text-skin-blue-500 font-medium text-content-1'>{formatDate(review?.created_at)}</p>
                </div>
            </div>
            <h4 className='text-22 text-skin-blue-500 font-semibold capitalize'>{getDisplayName()}</h4>
            <p className='text-title-2 font-medium text-skin-neutral-500'>{review?.comment}</p>
        </div>
    )
}

export default ReviewCard

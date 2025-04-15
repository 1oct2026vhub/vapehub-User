import React, { useState } from 'react';
import { Button } from '@nextui-org/button';
import { RatingStarEmpty, RatingStarFilled } from './Icons';
import { Textarea } from '@nextui-org/input';

interface ReviewFormProps {
    onSubmit: (rating: number, review: string) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating > 0 && review.trim()) {
            onSubmit(rating, review);
            setIsSubmitted(true);
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <div className="text-center">
                    <h4 className="text-title-2 font-semibold text-skin-neutral-400 mb-2">Thank You!</h4>
                    <p className="text-content-2 text-skin-neutral-300">
                        Your review has been submitted successfully.
                    </p>
                </div>
                <div className="flex gap-1">
                    {[...Array(rating)].map((_, index) => (
                        <RatingStarFilled key={index} className="w-6 h-6" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div className="flex flex-col gap-2">
                <h4 className="text-title-2 font-semibold text-skin-neutral-400">Your Rating</h4>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className="focus:outline-none"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                        >
                            {star <= (hoverRating || rating) ? (
                                <RatingStarFilled className="w-6 h-6" />
                            ) : (
                                <RatingStarEmpty className="w-6 h-6" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <h4 className="text-title-2 font-semibold text-skin-neutral-400">Your Review</h4>
                <Textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Share your experience with this product..."
                    minRows={4}
                    classNames={{
                        input: "text-content-2",
                        label: "text-content-2",
                    }}
                />
            </div>

            <Button
                type="submit"
                size="md"
                radius="sm"
                color="primary"
                className="w-full"
                isDisabled={rating === 0 || !review.trim()}
            >
                Submit Review
            </Button>
        </form>
    );
};

export default ReviewForm; 
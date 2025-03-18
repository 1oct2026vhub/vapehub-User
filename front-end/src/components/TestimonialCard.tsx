import React from "react";
import { RatingStarEmpty, RatingStarFilled, RatingStarPartial } from "./Icons";
import Image from "next/image";
import Link from "next/link";

interface TestimonialCardProps {
    imageSrc: string;
    altText: string;
    href: string;
    name: string;
    review: string;
    width?: number;
    height?: number;
    ratingCount?: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
    imageSrc,
    altText,
    href,
    name,
    review,
    ratingCount = 0,
    width = 60,
    height = 60
}) => {
    return (
        <Link
            href={href}
            className="block bg-skin-white p-3.5 md:p-6 border space-y-3 border-neutral-50 rounded-3xl shadow-card hover:shadow-brand-card transition-all duration-300"
        >
            <div className="flex items-start justify-between">
                <Image
                    src={imageSrc}
                    alt={altText}
                    width={width}
                    height={height}
                    loading="lazy"
                    className="max-w-8 min-w-8 md:min-w-[60px] md:max-w-max aspect-square"
                />
                <div className="flex items-center gap-1">
                {[...Array(5)].map((_, index) => {
                    if (index < Math.floor(ratingCount)) {
                        return <RatingStarFilled key={index} className="max-w-3.5 md:max-w-max" />;
                    } else if (index < ratingCount) {
                        return <RatingStarPartial key={index} className="max-w-3.5 md:max-w-max" />;
                    } else {
                        return <RatingStarEmpty key={index} className="max-w-3.5 md:max-w-max" />;
                    }
                })}
                     
                </div>
            </div>
            <h5 className="text-content-1 md:text-title-1 xl:text-h5 text-skin-neutral-500 font-semibold">
                {name}
            </h5>
            <p className="text-content-3 md:text-content-1 xl:text-title-1 font-bold text-skin-neutral-300 line-clamp-6">
                {review}
            </p>
        </Link>
    );
};

export default TestimonialCard;

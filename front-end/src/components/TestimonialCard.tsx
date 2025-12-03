import React from "react";
import { RatingStarEmpty, RatingStarFilled, RatingStarPartial } from "./Icons";
import Image from "next/image";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils/date.utils";

interface TestimonialCardProps {
    imageSrc: string | null;
    altText: string;
    href: string;
    name: string;
    review: string;
    width?: number;
    height?: number;
    ratingCount?: number;
    verified?: boolean;
    createdAt?: string; // ISO date string
}

// Verified Checkmark Icon
const VerifiedIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className={className}
    >
        <path
            d="M8 0L9.797 5.527L16 6.11L12 10.045L12.944 16L8 13.527L3.056 16L4 10.045L0 6.11L6.203 5.527L8 0Z"
            fill="currentColor"
        />
        <path
            d="M5.5 8.5L7 10L10.5 6.5"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

// Generate initials from name
const getInitials = (name: string): string => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

const TestimonialCard: React.FC<TestimonialCardProps> = ({
    imageSrc,
    altText,
    // href,
    name,
    review,
    ratingCount = 0,
    width = 60,
    height = 60,
    verified = false,
    createdAt
}) => {
    const hasProfileImage = imageSrc && imageSrc !== "/images/avatar.png";
    const initials = getInitials(name);

    return (
        <div
            className="flex flex-col h-full bg-skin-white p-3.5 md:p-6 border space-y-3 border-neutral-50 rounded-xl shadow-card hover:shadow-brand-card transition-all duration-300 cursor-default"
        >
            <div className="flex items-start justify-between">
                {hasProfileImage ? (
                    <Image
                        src={imageSrc}
                        alt={altText}
                        width={width}
                        height={height}
                        loading="lazy"
                        className="max-w-8 min-w-8 md:min-w-[60px] md:max-w-max aspect-square rounded-full object-cover"
                    />
                ) : (
                    <div
                        className="bg-gray-500 max-w-8 min-w-8 md:min-w-[60px] md:max-w-[60px] aspect-square rounded-full flex items-center justify-center text-white font-semibold text-xs md:text-base"
                        aria-label={altText}
                    >
                        {initials}
                    </div>
                )}
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
            <div className="flex items-center gap-2">
                <h5 className="text-title-2 md:text-2xl text-skin-neutral-500 font-semibold">
                    {name}
                </h5>
                {verified && (
                    <div className="flex items-center gap-1 bg-green-100 text-green-600 px-2 py-0.5 rounded-full" title="Verified">
                        <VerifiedIcon className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                        <span className="text-xs md:text-sm font-medium">Verified</span>
                    </div>
                )}
            </div>
            <p className="text-content-3 md:text-title-2 font-bold text-skin-neutral-300 line-clamp-6 flex-grow">
                {review}
            </p>
            {createdAt && (
                <p className="text-content-3 md:text-content-2 text-skin-neutral-400 font-medium mt-2">
                    {formatRelativeTime(createdAt)}
                </p>
            )}
        </div>
    );
};

export default TestimonialCard;

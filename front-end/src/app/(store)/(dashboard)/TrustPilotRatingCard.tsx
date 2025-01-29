import Image from "next/image";
import React from "react";

interface StarRatingProps {
  filledStars: number;
  totalStars?: number;
}

// StarRating Component
const StarRating: React.FC<StarRatingProps> = ({
  filledStars,
  totalStars = 5,
}) => (
  <div className="flex gap-0.5">
    {Array.from({ length: totalStars }).map((_, index) => (
      <Image
        key={index}
        src={
          index < filledStars
            ? "/images/rating-star.svg"
            : "/images/rating-star-half.svg"
        }
        alt={index < filledStars ? "Filled Star" : "Half Star"}
        width={26}
        height={26}
        className="max-w-4 md:max-w-fit"
      />
    ))}
  </div>
);

interface TrustPilotRatingCardProps {
  title: string;
  filledStars: number;
  totalStars?: number;
}

const TrustPilotRatingCard: React.FC<TrustPilotRatingCardProps> = ({
  title,
  filledStars,
  totalStars = 5,
}) => (
  <div className="w-fit sm:max-w-[772px] p-2.5 lg:px-6 lg:py-4.5 mx-auto bg-skin-white rounded-xl shadow-input border border-skin-neutral-100 flex items-center gap-3 md:gap-5">
    <div className="flex items-center gap-1">
      <Image src="/images/colored-star.svg" alt="Trustpilot Logo" width={32} height={32} className="max-w-5 md:max-w-fit" />
      <h2 className="text-skin-neutral-500 text-content-3 sm:text-content-1 md:text-title-1 xl:text-h5 font-semibold leading-tight">
        {title}
      </h2>
    </div>
    <StarRating filledStars={filledStars} totalStars={totalStars} />
  </div>
);

export default TrustPilotRatingCard;

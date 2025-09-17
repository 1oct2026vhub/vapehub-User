"use client"
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { getTrustpilotReviews } from "@/lib/server.actions";
import { ServerActionStatus } from "@/lib/config/app.config";

interface TrustpilotData {
  reviews: Array<{
    id: string;
    stars: number;
    title: string;
    text: string;
    createdAt: string;
    consumer: {
      displayName: string;
    };
    ratingCategory: string;
  }>;
  pagination: {
    page: number;
    per_page: number;
  };
  overallStats: {
    averageRating: number;
    trustScore: number;
    totalReviews: number;
    ratingDistribution: {
      oneStar: { count: number; percentage: string };
      twoStars: { count: number; percentage: string };
      threeStars: { count: number; percentage: string };
      fourStars: { count: number; percentage: string };
      fiveStars: { count: number; percentage: string };
    };
    scoreBreakdown: {
      stars: number;
      trustScore: number;
      ratingCategory: string;
      showRatingBanner: boolean;
    };
  };
  showRatingBanner: boolean;
}

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
    {Array.from({ length: totalStars }).map((_, index) => {
      const starValue = index + 1;
      const isFullyFilled = starValue <= Math.floor(filledStars);
      const isHalfFilled = !isFullyFilled && starValue <= Math.ceil(filledStars) && filledStars % 1 !== 0;
      
      let starSrc = "/images/rating-star-half.svg"; // Default to empty star
      
      if (isFullyFilled) {
        starSrc = "/images/rating-star.svg"; // Fully filled star
      } else if (isHalfFilled) {
        starSrc = "/images/rating-star-half.svg"; // Half filled star
      } else {
        starSrc = "/images/rating-star-half.svg"; // Empty star (using half star image as empty)
      }
      
      return (
        <Image
          key={index}
          src={starSrc}
          alt={isFullyFilled ? "Filled Star" : isHalfFilled ? "Half Star" : "Empty Star"}
          width={26}
          height={26}
          className="max-w-4 md:max-w-fit"
        />
      );
    })}
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
}) => {
  const [trustpilotData, setTrustpilotData] = useState<TrustpilotData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrustpilotReviews = async () => {
      try {
        setLoading(true);
        const response = await getTrustpilotReviews({ page: 1, per_page: 10 });
        
        if (response.status === ServerActionStatus.SUCCESS && response.data) {
          setTrustpilotData(response.data);
          
          // Additional console logs for specific data

        } 
      } catch (error) {
        console.error('Trustpilot API Exception:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrustpilotReviews();
  }, []);

  // Use API data if available, otherwise fall back to props
  const displayStars = trustpilotData?.overallStats?.scoreBreakdown?.stars || filledStars;
  const displayTitle = trustpilotData?.overallStats?.scoreBreakdown?.ratingCategory || title;

  return (
    <div className="w-fit sm:max-w-[772px] p-2.5 lg:px-6 lg:py-4.5 mx-auto bg-skin-white rounded-xl shadow-input border border-skin-neutral-100 flex items-center gap-3 md:gap-5">
      <div className="flex items-center gap-1">
        <Image src="/images/colored-star.svg" alt="Trustpilot Logo" width={32} height={32} className="max-w-5 md:max-w-fit" loading="lazy"/>
        <h2 className="text-skin-neutral-500 text-content-3 sm:text-content-1 md:text-title-1 xl:text-h5 font-semibold leading-tight">
          {loading ? 'Loading...' : `Trustpilot has rated Vapehub as ${displayTitle}!`}
        </h2>
      </div>
      <StarRating filledStars={displayStars} totalStars={totalStars} />
      {/* {trustpilotData && (
        <div className="text-xs text-skin-neutral-400">
          {trustpilotData.overallStats.totalReviews} reviews
        </div>
      )} */}
    </div>
  );
};

export default TrustPilotRatingCard;

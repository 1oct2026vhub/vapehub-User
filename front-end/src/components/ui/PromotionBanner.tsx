import React from 'react';

interface PromotionBannerProps {
  message: string;
}

const PromotionBanner: React.FC<PromotionBannerProps> = ({ message }) => {
  return (
    <div
      className="bg-notification-banner-gradient p-3 flex items-center justify-center w-full"
      role="alert"
      aria-live="polite"
    >
      <h5 className="text-content-3 sm:text-content-1 lg:text-title-2 font-bold text-white">
        {message}
      </h5>
    </div>
  );
};

export default PromotionBanner;


"use client";
import React, { useState, useEffect } from 'react';
import { FlashNewsItem } from '@/lib/config/global.config';

interface PromotionBannerProps {
  messages: FlashNewsItem[];
}

const PromotionBanner: React.FC<PromotionBannerProps> = ({ messages }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (messages.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [messages.length]);

  if (messages.length === 0) {
    return null;
  }

  const currentMessage = messages[currentIndex];
  return (
    <div
      className="bg-header-gradient p-3 flex items-center justify-center w-full border-b border-skin-primary-300"
      role="alert"
      aria-live="polite"
    >
      <div className="!font-oswald text-content-3 sm:text-content-1 lg:text-title-2 font-bold text-white">
        {currentMessage.url ? (
          <a href={currentMessage.url}>
            {currentMessage.label}
          </a>
        ) : (
          currentMessage.label
        )}
      </div>
    </div>
  );
};

export default PromotionBanner;


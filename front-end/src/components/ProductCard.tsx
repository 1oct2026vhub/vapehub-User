"use client"
// import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@nextui-org/button';
// import Link from 'next/link';
import { DEFAULT_CURRENCY_SYMBOL } from '@/lib/config/app.config';
import Link from 'next/link';
import NoImage from './NoImage';
// import { REVIEWS } from '@/lib/config/order.config';
import { RatingStarEmpty, RatingStarFilled } from './Icons';

interface ProductCardProps {
  title: string;
  altText?: string;
  imageSrc: string;
  price: string;
  buttonText: string;
  productId: number;
  flavors?: number;
  totalPuffs?: string;
  link: string;
  isNew?: string;
  averageRating?: number;
  totalReviews?: number;
  outOfStock?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  altText,
  imageSrc,
  price,
  buttonText,
  outOfStock,
  // productId,
  flavors,
  totalPuffs,
  link,
  isNew,
  averageRating = 0,
  totalReviews = 0,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showTitleTooltip, setShowTitleTooltip] = useState(false);
  const [isTitleTruncated, setIsTitleTruncated] = useState(false);
  const titleRef = useRef<HTMLParagraphElement>(null);

  // Check if title exceeds 4 lines
  useEffect(() => {
    const checkTruncation = () => {
      if (titleRef.current) {
        const element = titleRef.current;
        
        // Wait for element to be rendered
        if (!element.offsetWidth || !element.offsetHeight) {
          setTimeout(checkTruncation, 50);
          return;
        }
        
        // Get the actual text content from the element (works with both prop and static text)
        const textContent = element.textContent || element.innerText || title;
        
        if (!textContent || !textContent.trim()) {
          setIsTitleTruncated(false);
          return;
        }
        
        const computedStyle = window.getComputedStyle(element);
        const fontSize = parseFloat(computedStyle.fontSize);
        const lineHeightValue = computedStyle.lineHeight;
        
        // Calculate line height
        let lineHeight: number;
        if (lineHeightValue === 'normal') {
          lineHeight = fontSize * 1.2;
        } else if (lineHeightValue.includes('px')) {
          lineHeight = parseFloat(lineHeightValue);
        } else {
          lineHeight = fontSize * parseFloat(lineHeightValue);
        }
        
        // Height for exactly 4 lines (with some tolerance)
        const fourLineHeight = lineHeight * 4;
        
        // Get actual rendered width
        const rect = element.getBoundingClientRect();
        const actualWidth = rect.width || element.offsetWidth;
        
        if (!actualWidth) {
          setTimeout(checkTruncation, 50);
          return;
        }
        
        // Create temporary element to measure actual content height without line-clamp
        const tempElement = document.createElement('div');
        tempElement.style.position = 'absolute';
        tempElement.style.visibility = 'hidden';
        tempElement.style.width = `${actualWidth}px`;
        tempElement.style.fontSize = computedStyle.fontSize;
        tempElement.style.fontWeight = computedStyle.fontWeight;
        tempElement.style.fontFamily = computedStyle.fontFamily;
        tempElement.style.lineHeight = computedStyle.lineHeight;
        tempElement.style.padding = '0';
        tempElement.style.margin = '0';
        tempElement.style.wordBreak = 'break-word';
        tempElement.style.whiteSpace = 'normal';
        tempElement.style.boxSizing = 'border-box';
        tempElement.style.overflow = 'visible';
        tempElement.style.top = '-9999px';
        tempElement.style.left = '-9999px';
        tempElement.textContent = textContent;
        
        document.body.appendChild(tempElement);
        // Force layout calculation
        void tempElement.offsetHeight;
        const actualHeight = tempElement.scrollHeight || tempElement.offsetHeight;
        document.body.removeChild(tempElement);
        
        // Show tooltip only if actual content height STRICTLY exceeds 4 lines (truncated with ellipsis)
        // Only show when content is clearly more than 4 lines (ellipsis appears)
        // Use small positive tolerance to ensure we only catch actual truncation
        const isTruncated = actualHeight > fourLineHeight + 1;
        setIsTitleTruncated(isTruncated);
      }
    };
    
    // Use requestAnimationFrame for better timing
    const rafId = requestAnimationFrame(() => {
      setTimeout(checkTruncation, 100);
      setTimeout(checkTruncation, 300);
      setTimeout(checkTruncation, 600);
    });
    
    window.addEventListener('resize', checkTruncation);
    
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', checkTruncation);
    };
  }, [title]);
  
  return (
    <Link prefetch={false} href={link} className="block h-full">
      <div className="bg-skin-white rounded-md flex flex-col h-full shadow-mob-product-card md:shadow-product-card hover:shadow-card transition-all duration-300">
        <div className="relative p-1.5 md:py-6 md:px-3 bg-skin-neutral-50 rounded-t-md">
          <NoImage
            src={imageSrc}
            alt={altText ?? title}
            width={275}
            height={275}
            className="w-full aspect-square rounded mix-blend-multiply"
          />
          {totalPuffs && (
            <div className='quantity'>
              <span>{totalPuffs}</span>
            </div>
          )}

          {
            isNew && (
              <div className='new-product'>
                <span>{isNew}</span>
              </div>
            )
          }

        </div>
        <div className="flex flex-col px-2.5 py-3 md:py-5 flex-grow">
          <div className="flex flex-col flex-grow">
            <div className='h-[132px] md:h-[155px] relative'>
              <div className="relative h-full">
                <h4 
                  ref={titleRef}
                  className="text-title-2 md:text-h5 text-skin-neutral-500 font-semibold line-clamp-4 xl:mr-8 cursor-pointer"
                  onMouseEnter={() => isTitleTruncated && setShowTitleTooltip(true)}
                  onMouseLeave={() => setShowTitleTooltip(false)}
                >
                  {title}
                </h4>
                {showTitleTooltip && isTitleTruncated && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-white text-sm rounded-lg shadow-lg z-50 max-w-xs break-words" style={{ backgroundColor: '#02643E' }}>
                    <div className="whitespace-normal leading-relaxed">
                      {titleRef.current?.textContent || titleRef.current?.innerText || title}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent" style={{ borderTopColor: '#02643E' }}></div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 absolute top-[108px] md:top-[127px]">
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, i) => {
                    if (i < Math.round(averageRating)) {
                      return <RatingStarFilled key={i} className='w-3 md:w-4' />;
                    }
                    return <RatingStarEmpty key={i} className='w-3 md:w-4' />;
                  })}
                </div>
                <p className="text-content-3 md:text-title-2 text-skin-neutral-400 font-semibold">({totalReviews} {totalReviews <= 1 ? 'Review' : 'Reviews'})</p>
              </div>
            </div>
          </div>
          <div className='flex items-center justify-between min-h-[20px] md:min-h-[24px] mt-2.5'>
          <p className="text-content-3 md:text-content-1 text-skin-neutral-400 font-semibold md:font-bold h-3 md:h-4 xl:h-5">
            {flavors ? `${flavors} ${flavors > 1 ? 'Flavours' : 'Flavour'}` : ''}
          </p>
          <div className="min-h-[20px] md:min-h-[24px] flex items-center">
            {outOfStock && (
              <p className="text-content-3 md:text-content-2 xl:text-content-1 text-red-500 font-bold">
                Out of Stock
              </p>
            )}
          </div>
        </div>
          <div className="flex items-center justify-between gap-2 min-h-8 self-stretch mt-2.5">
            <p className="text-title-2 md:text-h5 text-skin-neutral-500 font-bold">{DEFAULT_CURRENCY_SYMBOL}{price}</p>
            {buttonText && (
              <div className="relative">
                <Button
                  size="md"
                  radius="md"
                  color="primary"
                  className="btn primary-btn shadow-input !text-content-3 md:!text-title-2 uppercase line-clamp-1 truncate max-w-26 sm:max-w-30 lg:max-w-36 !min-w-fit h-fit !px-2 !py-1"
                  onMouseEnter={() => buttonText.length > 16 && setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  {buttonText.length > 16 ? `${buttonText.substring(0, 13)}...` : buttonText}
                  {/* {buttonText} */}
                </Button>
                {showTooltip && buttonText.length > 16 && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50" style={{ backgroundColor: '#02643E' }}>
                    {buttonText}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent" style={{ borderTopColor: '#02643E' }}></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

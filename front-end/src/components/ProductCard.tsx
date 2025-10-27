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
  
  // Check if title is actually truncated
  useEffect(() => {
    if (titleRef.current) {
      const element = titleRef.current;
      const isTruncated = element.scrollHeight > element.clientHeight;
      setIsTitleTruncated(isTruncated);
    }
  }, [title]);
  
  return (
    <Link prefetch={false} href={link} className="block">
      <div className="bg-skin-white rounded-md flex flex-col content-stretch shadow-product-card hover:shadow-card transition-all duration-300">
        <div className="relative p-1.5 md:py-6 md:px-3 bg-skin-neutral-50 rounded-t-md">
          <NoImage
            src={imageSrc}
            alt={title}
            width={275}
            height={275}
            className="w-full aspect-square rounded"
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
        <div className="flex flex-col space-y-2.5 px-2.5 py-5">
          <div className="flex flex-col justify-between gap-2.5">
            <div className='min-h-[45px] xl:min-h-[60px]'>
              <div className="relative">
                <h4 
                  ref={titleRef}
                  className="text-title-2 md:text-h5 text-skin-neutral-500 font-semibold line-clamp-2 xl:mr-8 cursor-pointer"
                  onMouseEnter={() => isTitleTruncated && setShowTitleTooltip(true)}
                  onMouseLeave={() => setShowTitleTooltip(false)}
                >
                  {title}
                </h4>
                {showTitleTooltip && isTitleTruncated && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-white text-sm rounded-lg shadow-lg z-50 max-w-xs break-words" style={{ backgroundColor: '#02643E' }}>
                    <div className="whitespace-normal leading-relaxed">
                      {title}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent" style={{ borderTopColor: '#02643E' }}></div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 -mt-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }, (_, i) => {
                  if (i < Math.round(averageRating)) {
                    return <RatingStarFilled key={i} className='w-3 md:w-4' />;
                  }
                  return <RatingStarEmpty key={i} className='w-3 md:w-4' />;
                })}
              </div>
              <p className="text-content-3 md:text-title-2 text-skin-neutral-400 font-semibold mt-0.5">({totalReviews} {totalReviews <= 1 ? 'Review' : 'Reviews'})</p>
            </div>
          </div>
          <div className='flex items-center justify-between'>
          <p className="text-content-3 md:text-content-1 text-skin-neutral-400 font-semibold md:font-bold h-3 md:h-4 xl:h-5">
            {flavors ? `${flavors} ${flavors > 1 ? 'Flavours' : 'Flavour'}` : ''}
          </p>
          <div>
            {outOfStock && (
              <p className="text-content-3 md:text-content-2 xl:text-content-1 text-red-500 font-bold">
                Out of Stock
              </p>
            )}
          </div>
        </div>
          <div className="flex items-center justify-between gap-2 min-h-8 self-stretch">
            <p className="text-title-2 md:text-h5 text-skin-neutral-500 font-bold">{DEFAULT_CURRENCY_SYMBOL}{price}</p>
            {buttonText && (
              <div className="relative">
                <Button
                  size="md"
                  radius="md"
                  color="primary"
                  className="btn primary-btn shadow-input text-content-2 md:!text-title-2 uppercase line-clamp-1 truncate max-w-26 sm:max-w-30 lg:max-w-36 !min-w-fit h-fit !px-2 !py-1"
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

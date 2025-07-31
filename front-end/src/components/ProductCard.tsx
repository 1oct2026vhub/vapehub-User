"use client"
// import Image from 'next/image';
import React from 'react';
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
}

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  imageSrc,
  price,
  buttonText,
  // productId,
  flavors,
  totalPuffs,
  link,
  isNew,
  averageRating = 0,
  totalReviews = 0,
}) => {
  return (
    <Link href={link} className="block">
      <div className="bg-skin-white border border-skin-neutral-50 rounded-xl flex flex-col gap-4 content-stretch shadow-deal-card-mob xl:shadow-deal-card hover:shadow-xl transition-all duration-300 p-3 md:p-4.5">
        <div className="relative p-1.5 md:py-6 md:px-3 border-2 border-skin-neutral-100 shadow-input bg-skin-white rounded-10">
          <NoImage
            src={imageSrc}
            alt={title}
            width={275}
            height={275}
            className="w-full aspect-square"
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
        <div className="flex flex-col space-y-2.5 md:space-y-3.5">
          <div className="flex flex-col justify-between gap-1">
            <div className='min-h-[45px] xl:min-h-[60px]'>
              <p className="text-content-1 md:text-title-2 xl:text-title-1 text-skin-neutral-500 font-semibold line-clamp-2 xl:mr-8">{title}</p>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                {Array.from({ length: 5 }, (_, i) => {
                  if (i < Math.round(averageRating)) {
                    return <RatingStarFilled key={i} className='w-3 md:w-4' />;
                  }
                  return <RatingStarEmpty key={i} className='w-3 md:w-4' />;
                })}
              </div>
              <p className="text-[8px] md:text-content-3 xl:text-content-2 text-black font-bold mt-0.5">({totalReviews} {totalReviews <= 1 ? 'Review' : 'Reviews'})</p>
            </div>
          </div>
          <p className="text-content-3 md:text-content-2 xl:text-content-1 text-skin-neutral-500 font-bold h-3 md:h-4 xl:h-5">
            {flavors ? `${flavors} ${flavors > 1 ? 'Flavours' : 'Flavour'}` : ''}
          </p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-content-1 sm:text-title-2 md:text-title-1 xl:text-h5 text-skin-neutral-500 font-bold">{DEFAULT_CURRENCY_SYMBOL}{price}</p>
            {buttonText && (
              <Button
                size="md"
                radius="md"
                color="primary"
                className="btn primary-btn shadow-input text-content-2 max-w-36 whitespace-pre-wrap sm:text-content-1 !leading-none max-sm:h-6 sm:max-h-max !px-2 sm:!px-4 !py-2"
              >
                {buttonText.length > 16 ? `${buttonText.substring(0, 13)}...` : buttonText}
                {/* {buttonText} */}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

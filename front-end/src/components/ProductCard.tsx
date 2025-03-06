import Image from 'next/image';
import React from 'react';
import { Button } from '@nextui-org/button';
import Link from 'next/link';
import { DEFAULT_CURRENCY_SYMBOL } from '@/lib/config/app.config';

interface ProductCardProps {
  title: string;
  imageSrc: string;
  price: string;
  buttonText: string;
  reviews: number;
  flavors?: number;
  totalPuffs?: string;
  link: string;
  isNew?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  imageSrc,
  price,
  buttonText,
  reviews,
  flavors,
  totalPuffs,
  link,
  isNew
}) => {
  return (
    <Link href={link} className="block">
      <div className="bg-skin-white border border-skin-neutral-50 rounded-xl flex flex-col gap-4 shadow-deal-card-mob xl:shadow-deal-card hover:shadow-xl transition-all duration-300 p-3 md:p-4.5">
        <div className="relative p-1.5 md:py-6 md:px-3 border-2 border-skin-neutral-100 shadow-input bg-skin-neutral-50 rounded-10">
          {imageSrc && imageSrc.startsWith('http') ? (
                  <Image
                    src={imageSrc} alt={title} width={245} height={234} className='w-full'
                  />
                ) : 
                
                <Image
                    src="/images/product-1.png" alt={title} width={245} height={234} className='w-full'
                  />
                
          }

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
        <div className="flex flex-col gap-2.5 md:gap-3.5">
          <div className="flex flex-col justify-between xl:min-h-[77px]">
            <h3 className="text-content-1 md:text-title-2 xl:text-title-1 text-skin-neutral-500 font-semibold line-clamp-2 xl:mr-8">{title}</h3>
            <div className="flex items-center gap-1">
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <Image key={i} src='/images/review-star.svg' alt='review star' width={12} height={12} className='w-3 md:w-4' />
                ))}
              </div>
              <p className="text-[8px] md:text-content-3 xl:text-content-2 text-black font-bold mt-0.5 md:mt-1">({reviews} Reviews)</p>
            </div>
          </div>
          {flavors ? <p className="text-content-3 md:text-content-2 xl:text-content-1 text-skin-neutral-500 font-bold">{flavors} Flavours</p> : null}
          <div className="flex items-center justify-between gap-2">
            <h5 className="text-title-2 md:text-title-1 xl:text-h5 text-skin-neutral-500 font-bold">{DEFAULT_CURRENCY_SYMBOL}{price}</h5>
            <Button
              size="md"
              radius="md"
              color="primary"
              className="btn primary-btn shadow-input w-fit !min-w-fit text-content-1 !leading-none max-sm:h-6 sm:max-h-max !px-2 sm:!px-4 !py-2"
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

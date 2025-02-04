import Image from 'next/image';
import React from 'react';
import { Button } from '@nextui-org/button';
import { ReviewStarFilled } from './Icons';

interface ProductCardProps {
  title: string;
  imageSrc: string;
  price: string;
  buttonText: string;
  reviews: number;
  flavors?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  imageSrc,
  price,
  buttonText,
  reviews,
  flavors,
}) => {
  return (
    <a href="#" className="block">
      <div className="bg-skin-white border border-skin-neutral-50 rounded-xl flex flex-col gap-4 shadow-deal-card-mob xl:shadow-deal-card p-3 md:p-4.5">
        <div className="relative p-1.5 md:py-6 md:px-3 border-2 border-skin-neutral-100 shadow-input bg-skin-neutral-50 rounded-10">
          <Image src={imageSrc} alt={title} width={245} height={234} className='w-full' />
          <div className='quantity'>
            <span>15000 Puffs</span>
          </div>
          <div className='new-product'>
            <span>New</span>
          </div>
        </div>
        <div className="space-y-2 md:space-y-3.5">
          <div className="flex flex-col justify-between xl:min-h-[77px]">
            <h4 className="text-content-1 md:text-title-2 xl:text-title-1 text-skin-neutral-500 font-semibold line-clamp-2 xl:mr-8">{title}</h4>
            <div className="flex items-center gap-1">
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <Image  key={i} src='/images/review-star.svg' alt='review star' width={12} height={12} className='w-3 md:w-4' />
                ))}
              </div>
              <p className="text-[8px] md:text-content-3 xl:text-content-2 text-black font-bold mt-1">({reviews} Reviews)</p>
            </div>
          </div>
          {flavors && <p className="text-content-3 md:text-content-2 xl:text-content-1 text-skin-neutral-500 font-bold">{flavors} Flavours</p>}
          <div className="flex items-center justify-between">
            <h5 className="text-ttitle-2 md:text-title-1 xl:text-h5 text-skin-neutral-500 font-bold">{price}</h5>
            <Button
              size="md"
              radius="md"
              color="primary"
              className="btn primary-btn shadow-input w-fit !min-w-fit text-content-1 !leading-none max-sm:h-6 sm:max-h-max !px-4 !py-2"
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </a>
  );
};

export default ProductCard;

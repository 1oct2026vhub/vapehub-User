import EmptyPlaceholder from '@/components/ui/EmptyPlaceholder';
import { BannerResponse } from '@/lib/config/global.config';
import Image from 'next/image';
import Link from 'next/link';
import React, { memo } from 'react';

interface BannerImageProps {
  banner: BannerResponse;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

const BannerImage: React.FC<BannerImageProps> = memo(({ banner, width, height, priority = false, className }) => (
  <>
  {banner.image_url && banner.image_url.startsWith('http') ?
  <Link href={banner.redirect_url}>
    <Image
      src={banner.image_url}
      alt={banner.title}
      width={width}
      height={height}
      className={`w-full h-full object-fill aspect-video ${className}`}
      loading={priority ? "eager" : "lazy"}
      priority={priority}
    />
  </Link>: <p>No image found</p> }
  </>
));

BannerImage.displayName = 'BannerImage';

interface PromotionalBannersProps {
  banners: BannerResponse[];
}

const PromotionalBanners: React.FC<PromotionalBannersProps> = memo(({ banners }) => {
  if (!Array.isArray(banners) || banners.length === 0) {
    return  <EmptyPlaceholder title='Uh, oh!' description='No banners available' />;
  }

  const sortedBanners = [...banners].sort((a, b) => a.display_order - b.display_order);
  
  return (
    <>
      <section className="md:grid-cols-2 grid-cols-1 md:grid-rows-2 gap-7 mt-10 grid" role="region" aria-label="Promotional Banners Desktop">
      {sortedBanners.map((banner, index) => (
        <div key={`banner-${banner.title}-${index}`} className={`${index % 3 === 0 ? 'row-span-2 max-h-[274px] md:max-h-[573px]' : 'col-span-1 row-span-1 max-h-[274px]'} `}>
          <BannerImage 
            banner={banner}
            width={361}
            height={274} 
          />
          </div>
        ))}
      </section>
     
    </>
  );
});

PromotionalBanners.displayName = 'PromotionalBanners';

export default PromotionalBanners;

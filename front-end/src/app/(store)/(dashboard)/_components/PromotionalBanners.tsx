import NoImage from '@/components/NoImage';
import EmptyPlaceholder from '@/components/ui/EmptyPlaceholder';
import { BannerResponse } from '@/lib/config/global.config';
import Link from 'next/link';
import React, { memo } from 'react';
import { getPromotionBanner } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';

interface BannerImageProps {
  banner: BannerResponse;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

const BannerImage: React.FC<BannerImageProps> = memo(({ banner, width, height, priority = false, className }) => (
  <>
   
  <Link href={banner.redirect_url}>
    <NoImage
      src={banner.image_url}
      alt={banner.title}
      width={width}
      height={height}
      priority={priority}
      sizes="80vw"
      className={`w-full h-full object-fill aspect-video rounded-md md:rounded-lg ${className}`}
    />
    </Link>
  </>
));

BannerImage.displayName = 'BannerImage';

const PromotionalBanners: React.FC = async () => {
  const bannersResponse = await getPromotionBanner();
  
  if (bannersResponse.status !== ServerActionStatus.SUCCESS) {
    return <EmptyPlaceholder title='Uh, oh!' description='Failed to load banners' />;
  }

  const banners: BannerResponse[] = bannersResponse.data ?? [];
  if (!Array.isArray(banners) || banners.length === 0) {
    return <EmptyPlaceholder title='Uh, oh!' description='No banners available' />;
  }

  const sortedBanners = [...banners].sort((a, b) => a.display_order - b.display_order);
  
  return (
    <>
      <section className="grid-cols-1 md:grid-cols-2 gap-7 mt-10 hidden md:grid" role="region" aria-label="Promotional Banners Desktop">
        {sortedBanners[0] && (
          <BannerImage
            banner={sortedBanners[0]}
            width={662}
            height={573}
            priority
            className='max-h-[573px] rounded-md md:rounded-lg'
          />
        )}

        <div className="grid grid-cols-1 gap-7">
          {sortedBanners.slice(1, 3).map((banner, index) => (
            <BannerImage
              key={`desktop-banner-${banner.title}-${index}`}
              banner={banner}
              width={662}
              height={274}
              className='max-h-[274px] rounded-md md:rounded-lg'
            />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 mt-10 md:hidden" role="region" aria-label="Promotional Banners Mobile">
        {sortedBanners.slice(0, 3).map((banner, index) => (
          <BannerImage
            key={`mobile-banner-${banner.title}-${index}`}
            banner={banner}
            width={361}
            height={274}
            className='max-h-[274px] rounded-md md:rounded-lg'
          />
        ))}
      </section>
    </>
  );
};

PromotionalBanners.displayName = 'PromotionalBanners';

export default PromotionalBanners;

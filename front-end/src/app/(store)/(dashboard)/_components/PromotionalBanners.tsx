import { BannerResponse } from '@/lib/config/global.config';
import Image from 'next/image';
import Link from 'next/link';
import React, { memo } from 'react';

interface BannerImageProps {
  banner: BannerResponse;
  width: number;
  height: number;
  priority?: boolean;
}

const BannerImage: React.FC<BannerImageProps> = memo(({ banner, width, height, priority = false }) => (
  <Link href={`/${banner.redirect_url}`}>
    <Image
      src={banner.image_url_mid}
      alt={banner.title}
      width={width}
      height={height}
      className="w-full h-full object-cover"
      loading={priority ? "eager" : "lazy"}
      priority={priority}
    />
  </Link>
));

BannerImage.displayName = 'BannerImage';

interface PromotionalBannersProps {
  banners: BannerResponse[];
}

const PromotionalBanners: React.FC<PromotionalBannersProps> = memo(({ banners }) => {
  if (!Array.isArray(banners) || banners.length === 0) {
    return <p className="text-center text-gray-500">No Banners Available</p>;
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
          />
        )}

        <div className="grid grid-cols-1 gap-7">
          {sortedBanners.slice(1, 3).map((banner, index) => (
            <BannerImage
              key={`desktop-banner-${banner.title}-${index}`}
              banner={banner}
              width={662}
              height={274}
            />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 mt-10 md:hidden" role="region" aria-label="Promotional Banners Mobile">
        {sortedBanners.slice(3, 5).map((banner, index) => (
          <BannerImage
            key={`mobile-banner-${banner.title}-${index}`}
            banner={banner}
            width={361}
            height={274}
          />
        ))}
      </section>
    </>
  );
});

PromotionalBanners.displayName = 'PromotionalBanners';

export default PromotionalBanners;

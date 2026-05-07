import React from 'react';
import BannerSlider from './BannerSlider';
import MobileBannerSlider from './MobileBannerSlider';
import EmptyPlaceholder from '@/components/ui/EmptyPlaceholder';
import { cachedGetCarouselList } from '@/lib/cached.server';
import { ServerActionStatus } from '@/lib/config/app.config';

const HomeCarousel = async () => {
  const bannersResponse = await cachedGetCarouselList();

  if (bannersResponse.status !== ServerActionStatus.SUCCESS) {
    return <EmptyPlaceholder title='Uh, oh!' description='Failed to load banners' />;
  }

  const banners = bannersResponse.data
  if (!banners?.length) {
    return <EmptyPlaceholder title='Uh, oh!' description='No banners available' />;
  }

  return (
    <>
      <section className="banner-carousel hidden lg:block">
        <BannerSlider banners={banners}/>
      </section>
      <section className="mobile-banner-carousel lg:hidden">
        <MobileBannerSlider banners={banners}/>
      </section>
    </>
  );
};

export default HomeCarousel;
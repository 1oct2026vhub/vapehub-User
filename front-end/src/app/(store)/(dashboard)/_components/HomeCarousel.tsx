import React from 'react';
import BannerSlider from './BannerSlider';
import MobileBannerSlider from './MobileBannerSlider';
import { CarouselConfig } from '@/lib/config/carousel.config';
import EmptyPlaceholder from '@/components/ui/EmptyPlaceholder';

interface HomeCarouselProps {
  banners: CarouselConfig[];
}

const HomeCarousel: React.FC<HomeCarouselProps> = ({ banners }) => {
  if (!banners?.length) {
    return  <EmptyPlaceholder title='Uh, oh!' description='No banners available' />;
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
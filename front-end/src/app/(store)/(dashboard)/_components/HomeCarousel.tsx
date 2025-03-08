import React from 'react';
import BannerSlider from './BannerSlider';
import MobileBannerSlider from './MobileBannerSlider';
import { CarouselConfig } from '@/lib/config/carousel.config';

interface HomeCarouselProps {
  banners: CarouselConfig[];
}

const HomeCarousel: React.FC<HomeCarouselProps> = ({ banners }) => {
  if (!banners?.length) {
    return null;
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
import React from 'react';
import BannerSlider from './BannerSlider';
import MobileBannerSlider from './MobileBannerSlider';
import { getCarouselList } from '@/lib/server.actions';
import { ServerActionStatus } from '@/lib/config/app.config';
import { toast } from 'sonner'; 

const HomeCarousel: React.FC = async () => {
    const response = await getCarouselList();
    if(response.status === ServerActionStatus.ERROR) {
      toast.error(response.message); 
      return;
    }
        
    return (
        <>
        <section className="banner-carousel hidden lg:block">
          <BannerSlider banners={response.data}/>
        </section>
        <section className="mobile-banner-carousel lg:hidden">
          <MobileBannerSlider banners={response.data}/>
        </section>
        </>
    );
};

export default HomeCarousel;
"use client"
import { CarouselConfig } from "@/lib/config/carousel.config";
import Image from "next/image";
import { FunctionComponent } from "react";
import Slider, { Settings } from "react-slick";

type BannerSliderProps = {
  banners: CarouselConfig[];
};

 const settings: Settings = {
    dots: true,
    infinite: true,
    fade: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,   
    lazyLoad:"progressive", 
  };
   

const MobileBannerSlider: FunctionComponent<BannerSliderProps> = ({banners}) => {
 
  if(banners.length === 0) {
    return null;    
  }
  
  return (
    <Slider {...settings}>
      {banners.map((banner, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-lg"
        >
          <Image
            src={banner?.image_url_low || banner?.image_url}
            alt={banner.title}
            width={361}
            height={382}
            className="w-full rounded-lg min-h-96 !outline-none focus-visible:!outline-none"
            priority
          />
        </div>
      ))}
    </Slider>
  );
};

export default MobileBannerSlider;

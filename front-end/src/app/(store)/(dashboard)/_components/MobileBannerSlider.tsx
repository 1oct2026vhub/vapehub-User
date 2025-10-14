"use client"
import { CarouselConfig } from "@/lib/config/carousel.config";
import Image from "next/image";
import Link from "next/link";
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
    autoplaySpeed: 5000 
  };
   

const MobileBannerSlider: FunctionComponent<BannerSliderProps> = ({banners}) => {
 
  if(banners.length === 0) {
    return null;    
  }
  const sortedBanners:CarouselConfig[] = [...banners].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="carousel-wrapper" style={{ minHeight: '200px' }}>
      <Slider {...settings}>
        {sortedBanners.map((banner, index) => (
          <Link
            key={index}
            className="overflow-hidden rounded-lg block"
            href={banner.redirect_url}
          >
            <Image
              src={banner?.image_url_low || banner?.image_url}
              alt={banner.title}
              width={361}
              height={382}
              className="w-full h-auto rounded-lg object-fill aspect-video !outline-none focus-visible:!outline-none"
              priority
              loading="eager"
              fetchPriority="high"
            />
          </Link>
        ))}
      </Slider>
    </div>
  );
};

export default MobileBannerSlider;

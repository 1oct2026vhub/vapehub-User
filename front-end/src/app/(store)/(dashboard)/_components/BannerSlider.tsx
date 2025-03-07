"use client"
import { CarouselConfig } from "@/lib/config/carousel.config";
import Image from "next/image";
import { FunctionComponent } from "react";
import Slider, { Settings } from "react-slick";

type BannerSliderProps = {
  banners: CarouselConfig[];
};

const settings: Settings = {
  dots: false,
  infinite: true,
  fade: true,
  speed: 700,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 5000
};

const BannerSlider: FunctionComponent<BannerSliderProps> = ({banners}) => {
   
  if(banners.length === 0) {
    return null;
  }
  return (
    <Slider {...settings}>
      {banners.map((banner, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2.5xl min-h-[671px] bg-gray-100"
        >
          <Image
            src={banner?.image_url_mid || banner?.image_url}
            alt={banner?.title}
            width={1340}
            height={671}
            className="w-full rounded-2.5xl min-h-[671px] outline-none focus-visible:!outline-none"
            priority
            loading="eager"
          />
        </div>
      ))}
    </Slider>
  );
};

export default BannerSlider;

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

  // Sort banners by display_order
  const sortedBanners:CarouselConfig[] = [...banners].sort((a, b) => a.display_order - b.display_order);
  
  return (
    <Slider {...settings}>
      {sortedBanners.map((banner, index) => (
        <Link
          key={index}
          className="overflow-hidden rounded-2.5xl min-h-[671px] bg-gray-100"
          href={banner.redirect_url}
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
        </Link>
      ))}
    </Slider>
  );
};

export default BannerSlider;

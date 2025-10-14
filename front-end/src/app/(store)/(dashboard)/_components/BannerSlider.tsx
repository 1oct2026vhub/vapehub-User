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
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 5000,
  arrows: true,
  pauseOnHover: false,
  cssEase: "linear",
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
          className="overflow-hidden rounded-2.5xl bg-gray-100"
          href={banner.redirect_url}
        >
          <Image
            src={banner?.image_url}
            alt={banner?.title}
            width={1340}
            height={671}
            className="w-full h-full object-fill rounded-2.5xl outline-none focus-visible:!outline-none"
            priority
            fetchPriority="high"
            loading="eager"
          />
        </Link>
      ))}
    </Slider>
  );
};

export default BannerSlider;

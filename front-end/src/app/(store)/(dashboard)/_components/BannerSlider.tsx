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
    <div className="carousel-wrapper" style={{ minHeight: '100%' }}>
      <Slider {...settings}>
        {sortedBanners.map((banner, index) => (
          <Link
            key={index}
            className="overflow-hidden rounded-2.5xl bg-gray-100 block"
            href={banner.redirect_url}
          >
            <Image
              src={banner?.image_url}
              alt={banner?.title}
              width={1340}
              height={671}
              className="w-full h-auto object-cover rounded-2.5xl outline-none focus-visible:!outline-none"
              priority
              fetchPriority="high"
              loading="eager"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            />
          </Link>
        ))}
      </Slider>
    </div>
  );
};

export default BannerSlider;

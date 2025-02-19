"use client"
import Image from "next/image";
import React from "react";
import Slider, { Settings } from "react-slick";

const BannerSlider: React.FC = () => {
  const settings: Settings = {
    dots: false,
    infinite: true,
    fade: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  const banners = [
    { src: "/images/banner-1.png", alt: "Banner 1" },
    { src: "/images/banner-1.png", alt: "Banner 2" },
    { src: "/images/banner-1.png", alt: "Banner 3" },
  ];

  return (
    <Slider {...settings}>
      {banners.map((banner, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2.5xl"
        >
          <Image
            src={banner.src}
            alt={banner.alt}
            width={1340}
            height={671}
            className="w-full rounded-2.5xl min-h-[671px]"
            priority
          />
        </div>
      ))}
    </Slider>
  );
};

export default BannerSlider;

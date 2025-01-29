import Image from "next/image";
import React from "react";
import Slider, { Settings } from "react-slick";

const MobileBannerSlider: React.FC = () => {
  const settings: Settings = {
    dots: true,
    infinite: true,
    fade: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const banners = [
    { src: "/images/banner-1.png", alt: "Banner 1" },
    { src: "/images/banner-2.png", alt: "Banner 2" },
    { src: "/images/banner-3.png", alt: "Banner 3" },
  ];

  return (
    <Slider {...settings}>
      {banners.map((banner, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-lg"
        >
          <Image
            src={banner.src}
            alt={banner.alt}
            width={361}
            height={382}
            className="w-full rounded-lg min-h-96"
            priority
          />
        </div>
      ))}
    </Slider>
  );
};

export default MobileBannerSlider;

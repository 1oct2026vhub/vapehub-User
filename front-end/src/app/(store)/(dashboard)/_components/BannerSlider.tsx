"use client"
import { ServerActionStatus } from "@/lib/config/app.config";
import { CarouselConfig } from "@/lib/config/carousel.config";
import { getCarouselList } from "@/lib/server.actions";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Slider, { Settings } from "react-slick";
import { toast } from "sonner";

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
  const [banners, setBanners] = useState<CarouselConfig[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    const fetchCarouselList = async () => {
      setLoading(true);
      try {
        const response = await getCarouselList();
        if(response.status === ServerActionStatus.ERROR) {
          toast.error(response.message); 
          return;
        }
        setBanners(response.data);
      } catch (error) {
        console.error("Error fetching carousel list", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselList();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!banners.length) return <p>No Carousel Available</p>;
  return (
    <Slider {...settings}>
      {banners.map((banner, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2.5xl"
        >
          <Image
            src={banner?.image_url}
            alt={banner?.title}
            width={1340}
            height={671}
            className="w-full rounded-2.5xl min-h-[671px] outline-none focus-visible:!outline-none"
            priority
          />
        </div>
      ))}
    </Slider>
  );
};

export default BannerSlider;

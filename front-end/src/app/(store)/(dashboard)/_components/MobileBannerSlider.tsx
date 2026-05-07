"use client";
import type { Key } from "react";
import { CarouselConfig } from "@/lib/config/carousel.config";
import { resolveCarouselImageUrl } from "@/lib/carousel-image-url";
import Link from "next/link";
import { FunctionComponent } from "react";
import Slider, { Settings } from "react-slick";

type BannerSliderProps = {
  banners: CarouselConfig[];
};

const settings: Settings = {
  dots: true,
  infinite: false,
  fade: true,
  speed: 700,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 5000,
  arrows: true,
};

const MobileBannerSlider: FunctionComponent<BannerSliderProps> = ({ banners }) => {
  if (banners.length === 0) {
    return null;
  }

  const sortedBanners: CarouselConfig[] = [...banners].sort((a, b) => a.display_order - b.display_order);
  const firstBanner = sortedBanners[0];

  const imageSrc = (banner: CarouselConfig) =>
    resolveCarouselImageUrl(banner.image_url_low || banner.image_url);

  const renderSlide = (banner: CarouselConfig, key: Key, linkClassName: string, slideIndex: number) => (
    <Link key={key} className={linkClassName} href={banner.redirect_url || "#"}>
      <img
        src={imageSrc(banner)}
        alt={banner.alt_text ?? banner.title ?? "Banner"}
        width={361}
        height={382}
        className="aspect-video max-h-[90vh] w-full rounded-md object-fill !outline-none focus-visible:!outline-none max-[450px]:!aspect-square"
        loading={slideIndex === 0 ? "eager" : "lazy"}
        decoding="async"
      />
    </Link>
  );

  const renderStaticSlide = (banner: CarouselConfig, index: number) => (
    <div
      className="hero-banner-static-shell hero-banner-static-shell--mobile"
      aria-label="Banner preview"
    >
      <span
        aria-hidden
        className="hero-banner-static-slick-arrow hero-banner-static-prev pointer-events-none"
      />
      <Link href={banner.redirect_url || "#"} className="hero-banner-static-link block overflow-hidden rounded-md">
        <img
          src={imageSrc(banner)}
          alt={banner.alt_text ?? banner.title ?? "Banner"}
          width={361}
          height={382}
          className="hero-banner-static-image hero-banner-static-image--mobile"
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
        />
      </Link>
      <span
        aria-hidden
        className="hero-banner-static-slick-arrow hero-banner-static-next pointer-events-none"
      />
    </div>
  );

  return (
    <>
      <div className="hero-banner-static-fallback">
        {firstBanner ? renderStaticSlide(firstBanner, 0) : null}
      </div>
      <div className="hero-banner-slick-host">
        <Slider {...settings}>
          {sortedBanners.map((banner, index) =>
            renderSlide(banner, `hero-mobile-${banner.id}-${index}`, "overflow-hidden rounded-md", index)
          )}
        </Slider>
      </div>
    </>
  );
};

export default MobileBannerSlider;

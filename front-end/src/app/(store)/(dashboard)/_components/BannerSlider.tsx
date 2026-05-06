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
  dots: false,
  infinite: false,
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

const BannerSlider: FunctionComponent<BannerSliderProps> = ({ banners }) => {
  if (banners.length === 0) {
    return null;
  }

  const sortedBanners: CarouselConfig[] = [...banners].sort((a, b) => a.display_order - b.display_order);
  const firstBanner = sortedBanners[0];

  const bannerSrc = (b: CarouselConfig) =>
    resolveCarouselImageUrl(b.image_url, "/images/no-image.png");

  const renderSlide = (banner: CarouselConfig, key: Key, linkClassName: string, slideIndex: number) => (
    <Link key={key} className={linkClassName} href={banner.redirect_url || "#"}>
      <img
        src={bannerSrc(banner)}
        alt={banner.alt_text ?? banner.title ?? "Banner"}
        width={1340}
        height={671}
        sizes="80vw"
        className="h-full w-full rounded-10 object-fill outline-none focus-visible:!outline-none"
        loading={slideIndex === 0 ? "eager" : "lazy"}
        decoding="async"
      />
    </Link>
  );

  // No-JS: first banner + decorative arrows (match Slick look; not clickable).
  const renderStaticSlide = (banner: CarouselConfig, index: number) => (
    <div className="hero-banner-static-shell" aria-label="Banner preview">
      <span
        aria-hidden
        className="hero-banner-static-slick-arrow hero-banner-static-prev pointer-events-none"
      />
      <Link
        href={banner.redirect_url || "#"}
        className="hero-banner-static-link block overflow-hidden rounded-10 bg-gray-100"
      >
        <img
          src={bannerSrc(banner)}
          alt={banner.alt_text ?? banner.title ?? "Banner"}
          width={1340}
          height={671}
          className="hero-banner-static-image"
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
            renderSlide(
              banner,
              `hero-desktop-${banner.id}-${index}`,
              "overflow-hidden rounded-10 bg-gray-100",
              index
            )
          )}
        </Slider>
      </div>
    </>
  );
};

export default BannerSlider;

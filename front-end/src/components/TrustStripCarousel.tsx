"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Slider, { Settings } from "react-slick";
import type { SitewideTrustBadge } from "@/lib/config/blog-trust-strip.config";

type TrustStripCarouselProps = {
  badges: SitewideTrustBadge[];
};

type BreakpointMode = "mobile" | "tablet" | "desktop" | "wide";

const TrustBadgeIcon = ({ icon }: { icon: SitewideTrustBadge["icon"] }) => {
  switch (icon) {
    case "regulator":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 2.5 4.5 5.75v5.5c0 4.45 3.2 8.6 7.5 9.75 4.3-1.15 7.5-5.3 7.5-9.75v-5.5L12 2.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="m9.25 12.25 1.9 1.9 4.6-4.6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "industry":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4.5 20.25h15M6.75 20.25V9.75l5.25-3 5.25 3v10.5M9.75 20.25v-5.25h4.5v5.25"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "reviews":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3.75 14.53 8.88l5.59.46-4.24 3.67 1.28 5.46L12 15.9l-5.16 3.07 1.28-5.46-4.24-3.67 5.59-.46L12 3.75Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "compliance":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M8.25 4.5h7.5l3 3v12.75H5.25V4.5h3Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M9.75 12h4.5M9.75 15.75h4.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "age":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden>
          <rect
            x="4.5"
            y="6"
            width="15"
            height="12"
            rx="2"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M8.25 10.5h7.5M8.25 14.25h4.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return null;
  }
};

const TrustBadgeCard = ({
  category,
  value,
  icon,
}: SitewideTrustBadge) => (
  <article className="trust-strip-badge">
    <div className="trust-strip-badge__icon">
      <TrustBadgeIcon icon={icon} />
    </div>
    <p className="trust-strip-badge__title">{value}</p>
    <p className="trust-strip-badge__subtitle">{category}</p>
  </article>
);

function getMode(width: number): BreakpointMode {
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  if (width < 1280) return "desktop";
  return "wide";
}

function getSlidesToShow(mode: BreakpointMode, badgeCount: number) {
  const byMode: Record<BreakpointMode, number> = {
    mobile: 1.4,
    tablet: 2.2,
    desktop: 4,
    wide: 4,
  };
  return Math.max(1, Math.min(badgeCount, byMode[mode]));
}

const TrustStripCarousel = ({ badges }: TrustStripCarouselProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<BreakpointMode>("desktop");

  useEffect(() => {
    const updateMode = () => {
      const width =
        viewportRef.current?.clientWidth ||
        window.innerWidth;
      // Prefer window width for breakpoint mode so tablet/desktop
      // matches CSS breakpoints (not the padded carousel inner width).
      setMode(getMode(window.innerWidth || width));
    };

    updateMode();

    const viewport = viewportRef.current;
    const resizeObserver =
      typeof ResizeObserver !== "undefined" && viewport
        ? new ResizeObserver(updateMode)
        : null;

    if (viewport && resizeObserver) {
      resizeObserver.observe(viewport);
    }
    window.addEventListener("resize", updateMode);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateMode);
    };
  }, []);

  const slidesToShow = useMemo(
    () => getSlidesToShow(mode, badges.length),
    [mode, badges.length],
  );
  const needsCarousel = badges.length > slidesToShow;

  const settings: Settings = useMemo(
    () => ({
      dots: false,
      arrows: true,
      infinite: false,
      speed: 400,
      slidesToShow,
      slidesToScroll: 1,
      swipeToSlide: true,
    }),
    [slidesToShow],
  );

  if (!badges.length) {
    return null;
  }

  return (
    <>
      <div className="trust-strip-static-fallback">
        {badges.map((badge) => (
          <TrustBadgeCard key={badge.category} {...badge} />
        ))}
      </div>

      <div
        ref={viewportRef}
        className={[
          "trust-strip-carousel",
          needsCarousel ? "trust-strip-carousel--active" : "",
          mode === "mobile" ? "trust-strip-carousel--mobile" : "",
          mode === "tablet" ? "trust-strip-carousel--tablet" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {needsCarousel ? (
          <Slider key={`${mode}-${slidesToShow}`} {...settings}>
            {badges.map((badge) => (
              <div key={badge.category} className="trust-strip-slide">
                <TrustBadgeCard {...badge} />
              </div>
            ))}
          </Slider>
        ) : (
          <div className="trust-strip-row">
            {badges.map((badge) => (
              <div key={badge.category} className="trust-strip-slide trust-strip-slide--static">
                <TrustBadgeCard {...badge} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default TrustStripCarousel;

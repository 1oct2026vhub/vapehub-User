"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Slider, { Settings } from "react-slick";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/Icons";
import {
  AtbMobileSegment,
  bindTypeCardImageFallbacks,
  splitAtbHtmlForMobile,
} from "./type-cards.utils";

type CategoryAdditionalTextBoxMobileProps = {
  html: string;
};

type AtbCardCarouselProps = {
  cards: string[];
  groupKey: string;
};

/**
 * One-card slick carousel for a nicotine / flavour card group (mobile only).
 * Mirrors Related Collections (CategoryTypeCardsMobile).
 */
const AtbCardCarousel = ({ cards, groupKey }: AtbCardCarouselProps) => {
  const sliderRef = useRef<Slider | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [uniformMinHeight, setUniformMinHeight] = useState<number | null>(null);

  useEffect(() => {
    setActiveIndex(0);
    setUniformMinHeight(null);
  }, [cards]);

  useEffect(() => {
    bindTypeCardImageFallbacks(viewportRef.current);
  }, [cards, uniformMinHeight]);

  const equalizeHeights = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || cards.length === 0) return;

    const list = viewport.querySelector(".slick-list") as HTMLElement | null;
    const width = list?.clientWidth || viewport.clientWidth;
    if (width <= 0) return;

    const probe = document.createElement("div");
    probe.className = "type-cards-mobile-carousel";
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;left:0;top:0;width:${width}px;height:auto;overflow:visible;z-index:-1;`;
    document.body.appendChild(probe);

    let maxHeight = 0;
    try {
      for (const cardHtml of cards) {
        probe.innerHTML = `<div class="type-cards-mobile-slide">${cardHtml}</div>`;
        const slide = probe.firstElementChild as HTMLElement | null;
        if (!slide) continue;
        const card = slide.firstElementChild as HTMLElement | null;
        if (card) {
          card.style.height = "auto";
          card.style.minHeight = "0";
        }
        maxHeight = Math.max(maxHeight, Math.ceil(slide.getBoundingClientRect().height));
      }
    } finally {
      probe.remove();
    }

    if (maxHeight > 0) {
      setUniformMinHeight((prev) => (prev === maxHeight ? prev : maxHeight));
    }
  }, [cards]);

  useEffect(() => {
    if (cards.length === 0) return;

    const run = () => {
      requestAnimationFrame(() => equalizeHeights());
    };

    run();

    const viewport = viewportRef.current;
    const ro =
      typeof ResizeObserver !== "undefined" && viewport
        ? new ResizeObserver(() => run())
        : null;
    if (viewport && ro) ro.observe(viewport);

    const onResize = () => run();
    window.addEventListener("resize", onResize);

    const imgs = viewport?.querySelectorAll("img") ?? [];
    const onImgLoad = () => run();
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener("load", onImgLoad);
    });

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", onResize);
      imgs.forEach((img) => img.removeEventListener("load", onImgLoad));
    };
  }, [cards, equalizeHeights]);

  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < cards.length - 1;

  const settings: Settings = {
    dots: false,
    arrows: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: false,
    beforeChange: (_current, next) => setActiveIndex(next),
  };

  const slideStyle = uniformMinHeight
    ? ({ minHeight: uniformMinHeight } as const)
    : undefined;

  return (
    <div className="type-cards-mobile-carousel">
      <div ref={viewportRef} className="type-cards-mobile-carousel__viewport relative">
        <Slider ref={sliderRef} {...settings}>
          {cards.map((cardHtml, index) => (
            <div key={`${groupKey}-card-${index}`}>
              <div
                className="type-cards-mobile-slide"
                style={slideStyle}
                dangerouslySetInnerHTML={{ __html: cardHtml }}
              />
            </div>
          ))}
        </Slider>

        {cards.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Previous card"
              disabled={!canGoPrev}
              onClick={() => sliderRef.current?.slickPrev()}
              className="type-cards-mobile-arrow type-cards-mobile-arrow--prev"
            >
              <ArrowLeftIcon className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next card"
              disabled={!canGoNext}
              onClick={() => sliderRef.current?.slickNext()}
              className="type-cards-mobile-arrow type-cards-mobile-arrow--next"
            >
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </button>
          </>
        ) : null}
      </div>

      {cards.length > 1 ? (
        <ul className="type-cards-mobile-dots" role="tablist" aria-label="Additional text cards">
          {cards.map((_, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={`${groupKey}-dot-${index}`} role="presentation">
                <button
                  type="button"
                  role="tab"
                  aria-label={`Go to card ${index + 1}`}
                  aria-selected={isActive}
                  className={isActive ? "is-active" : undefined}
                  onClick={() => sliderRef.current?.slickGoTo(index)}
                />
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};

/**
 * Mobile additional_text_box: card grids → Related Collections–style carousel;
 * other HTML (intro, tables) stays as markup. Desktop counterpart is hidden here.
 */
const CategoryAdditionalTextBoxMobile = ({
  html,
}: CategoryAdditionalTextBoxMobileProps) => {
  const [segments, setSegments] = useState<AtbMobileSegment[]>(() =>
    splitAtbHtmlForMobile(html)
  );

  useEffect(() => {
    setSegments(splitAtbHtmlForMobile(html));
  }, [html]);

  const hasCards = segments.some((s) => s.type === "cards");

  if (!hasCards) {
    return (
      <div
        ref={(el) => {
          if (el) bindTypeCardImageFallbacks(el);
        }}
        className="additional-text-box-html w-full lg:hidden"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div className="additional-text-box-mobile w-full space-y-4 lg:hidden">
      {segments.map((segment, index) => {
        if (segment.type === "html") {
          if (!segment.html.trim()) return null;
          return (
            <div
              key={`atb-html-${index}`}
              ref={(el) => {
                if (el) bindTypeCardImageFallbacks(el);
              }}
              className="additional-text-box-html w-full"
              dangerouslySetInnerHTML={{ __html: segment.html }}
            />
          );
        }

        return (
          <AtbCardCarousel
            key={`atb-cards-${index}`}
            groupKey={`atb-${index}`}
            cards={segment.cards}
          />
        );
      })}
    </div>
  );
};

export default CategoryAdditionalTextBoxMobile;

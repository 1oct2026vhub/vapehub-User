"use client";

import { useEffect, useRef, useState } from "react";
import Slider, { Settings } from "react-slick";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/Icons";
import { extractTypeCardHtml, extractTypeCardHtmlFromDom } from "./type-cards.utils";

type CategoryTypeCardsMobileProps = {
  html: string;
};

/**
 * Mobile-only type-card carousel: one card per slide + custom left/right arrows + dots.
 * Parses CKEditor HTML in the browser so card extraction is reliable.
 */
const CategoryTypeCardsMobile = ({ html }: CategoryTypeCardsMobileProps) => {
  const sliderRef = useRef<Slider | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cards, setCards] = useState<string[]>(() => extractTypeCardHtml(html));

  useEffect(() => {
    const parsed = extractTypeCardHtmlFromDom(html);
    if (parsed.length > 0) {
      setCards(parsed);
      setActiveIndex(0);
    }
  }, [html]);

  if (cards.length === 0) {
    return (
      <div
        className="type-cards-html type-cards-html--mobile-fallback w-full lg:hidden"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < cards.length - 1;

  const settings: Settings = {
    dots: false,
    arrows: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    beforeChange: (_current, next) => setActiveIndex(next),
  };

  return (
    <div className="type-cards-mobile-carousel lg:hidden">
      <div className="type-cards-mobile-carousel__viewport relative">
        <Slider ref={sliderRef} {...settings}>
          {cards.map((cardHtml, index) => (
            <div key={`type-card-${index}`} className="px-1">
              <div
                className="type-cards-mobile-slide"
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
        <ul className="type-cards-mobile-dots" role="tablist" aria-label="Type cards">
          {cards.map((_, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={`type-card-dot-${index}`} role="presentation">
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

export default CategoryTypeCardsMobile;

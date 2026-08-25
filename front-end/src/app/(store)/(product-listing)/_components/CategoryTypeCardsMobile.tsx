"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Slider, { Settings } from "react-slick";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/Icons";
import { extractTypeCardHtml, extractTypeCardHtmlFromDom, bindTypeCardImageFallbacks } from "./type-cards.utils";

type CategoryTypeCardsMobileProps = {
  html: string;
};

/**
 * Mobile-only type-card carousel: one card per slide + custom left/right arrows + dots.
 * Parses CKEditor HTML in the browser so card extraction is reliable.
 * Equalizes all slide heights to the tallest card (Slick + inline CKEditor styles
 * prevent pure-CSS stretch from working reliably).
 */
const CategoryTypeCardsMobile = ({ html }: CategoryTypeCardsMobileProps) => {
  const sliderRef = useRef<Slider | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cards, setCards] = useState<string[]>(() => extractTypeCardHtml(html));
  const [uniformMinHeight, setUniformMinHeight] = useState<number | null>(null);

  useEffect(() => {
    const parsed = extractTypeCardHtmlFromDom(html);
    if (parsed.length > 0) {
      setCards(parsed);
      setActiveIndex(0);
      setUniformMinHeight(null);
    }
  }, [html]);

  useEffect(() => {
    bindTypeCardImageFallbacks(viewportRef.current);
  }, [cards, uniformMinHeight]);

  const equalizeHeights = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || cards.length === 0) return;

    const list = viewport.querySelector(".slick-list") as HTMLElement | null;
    const width = list?.clientWidth || viewport.clientWidth;
    if (width <= 0) return;

    // Measure natural card heights at the live carousel width (off-DOM probe),
    // so inactive Slick slides / inline CKEditor styles can't skew results.
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
        // Clear any inline height the CMS may have set so we measure content.
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
      // Wait a frame so Slick has laid out .slick-list width.
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

    // Re-measure when card images finish loading (can change height).
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

  if (cards.length === 0) {
    return (
      <div
        ref={(el) => {
          if (el) bindTypeCardImageFallbacks(el);
        }}
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
    adaptiveHeight: false,
    beforeChange: (_current, next) => setActiveIndex(next),
  };

  const slideStyle = uniformMinHeight
    ? ({ minHeight: uniformMinHeight } as const)
    : undefined;

  return (
    <div className="type-cards-mobile-carousel lg:hidden">
      <div ref={viewportRef} className="type-cards-mobile-carousel__viewport relative">
        <Slider ref={sliderRef} {...settings}>
          {cards.map((cardHtml, index) => (
            <div key={`type-card-${index}`}>
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

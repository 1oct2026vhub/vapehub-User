"use client";

import NoImage from "@/components/NoImage";
import { DownArrowIcon } from "@/components/Icons";
import SectionHeading from "@/components/ui/SectionHeading";
import { useEffect, useId, useState, type ReactNode } from "react";

const ACCORDION_HASH = "#buying-guide-faqs";
const ACCORDION_LABEL = "Buying Guide & FAQs";

type CategoryBuyingGuideAccordionProps = {
  title: string;
  imageUrl?: string;
  imageAlt?: string;
  children: ReactNode;
};

const CategoryBuyingGuideAccordion = ({
  title,
  imageUrl,
  imageAlt,
  children,
}: CategoryBuyingGuideAccordionProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const contentId = useId();

  useEffect(() => {
    const openFromHash = () => {
      if (window.location.hash === ACCORDION_HASH) {
        setIsOpen(true);
      }
    };

    const handleAnchorClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest(`a[href="${ACCORDION_HASH}"]`);
      if (anchor) {
        setIsOpen(true);
      }
    };

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    document.addEventListener("click", handleAnchorClick);

    return () => {
      window.removeEventListener("hashchange", openFromHash);
      document.removeEventListener("click", handleAnchorClick);
    };
  }, []);

  return (
    <div
      id="buying-guide-faqs"
      className="scroll-mt-24 w-full min-w-0 max-w-full overflow-x-clip rounded-2xl bg-skin-white shadow-card"
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex w-full items-center gap-3.5 px-4 pt-4 text-left md:gap-5 md:px-5 md:pt-5 xl:px-6 xl:pt-6 ${
          isOpen ? "pb-0" : "pb-4 md:pb-5 xl:pb-6"
        }`}
      >
        {imageUrl ? (
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg md:h-16 md:w-16">
            <NoImage
              src={imageUrl}
              alt={imageAlt || title}
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-content-2 font-semibold text-skin-neutral-300">
            {ACCORDION_LABEL}
          </p>
          <SectionHeading title={title} className="w-fit" />
        </div>
        <DownArrowIcon
          className={`h-5 w-5 shrink-0 text-skin-neutral-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {isOpen ? (
        <div
          id={contentId}
          className="flex flex-col gap-4 px-4 pb-5 pt-2.5 md:gap-5 md:px-5 md:pb-7 md:pt-4 xl:px-6 xl:pb-10"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
};

export default CategoryBuyingGuideAccordion;

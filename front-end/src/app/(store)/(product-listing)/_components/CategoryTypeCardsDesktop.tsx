"use client";

import { useEffect, useRef } from "react";
import { bindTypeCardImageFallbacks } from "./type-cards.utils";

type CategoryTypeCardsDesktopProps = {
  html: string;
};

/** Desktop type-cards markup with broken-image → no-image fallback. */
const CategoryTypeCardsDesktop = ({ html }: CategoryTypeCardsDesktopProps) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bindTypeCardImageFallbacks(rootRef.current);
  }, [html]);

  return (
    <div
      ref={rootRef}
      className="type-cards-html hidden w-full lg:block"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default CategoryTypeCardsDesktop;

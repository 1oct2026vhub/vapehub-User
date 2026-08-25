"use client";

import { useEffect, useRef } from "react";
import { bindTypeCardImageFallbacks } from "./type-cards.utils";

type CategoryAdditionalTextBoxDesktopProps = {
  html: string;
};

/** Desktop additional_text_box markup (grid / tables) with image fallbacks. */
const CategoryAdditionalTextBoxDesktop = ({
  html,
}: CategoryAdditionalTextBoxDesktopProps) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bindTypeCardImageFallbacks(rootRef.current);
  }, [html]);

  return (
    <div
      ref={rootRef}
      className="additional-text-box-html hidden w-full lg:block"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default CategoryAdditionalTextBoxDesktop;

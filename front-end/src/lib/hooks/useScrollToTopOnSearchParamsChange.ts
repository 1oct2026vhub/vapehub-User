"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Scrolls the window to the top when URL search params change (e.g. pagination,
 * sort, filters). Skips scrolling on initial mount so the page doesn't jump on first load.
 * Use this on filter/listing pages so changing page or filters scrolls to the first results.
 */
export function useScrollToTopOnSearchParamsChange(): void {
  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [searchParams.toString()]);
}

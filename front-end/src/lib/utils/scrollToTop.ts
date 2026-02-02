/** ID on the product listing start element (sort controls + first product row). Scroll here so the first products are in view. */
export const PRODUCT_LISTING_START_ID = 'product-listing-start';

const RETRY_INTERVAL_MS = 50;
const MAX_RETRIES = 10;

/**
 * Scroll to the first product area (product listing start) if present, otherwise to the top of the page.
 * Use when changing pagination/filter/sort so the user sees the product grid.
 * When retryIfMissing is true, retries until the element appears (e.g. after navigation) so we only scroll once to the product area.
 */
export function scrollToProductListingStart(options?: {
  behavior?: ScrollBehavior;
  /** If true, retry when element is missing so we don't scroll to top first and then to element (avoids double scroll on slower pages). */
  retryIfMissing?: boolean;
}): void {
  const behavior = options?.behavior ?? 'smooth';
  const retryIfMissing = options?.retryIfMissing ?? false;

  const doScroll = (): boolean => {
    const el = document.getElementById(PRODUCT_LISTING_START_ID);
    if (el) {
      el.scrollIntoView({ behavior, block: 'start' });
      return true;
    }
    return false;
  };

  if (doScroll()) return;

  if (!retryIfMissing) {
    window.scrollTo({ top: 0, left: 0, behavior });
    return;
  }

  let attempts = 0;
  const id = window.setInterval(() => {
    attempts++;
    if (doScroll() || attempts >= MAX_RETRIES) {
      window.clearInterval(id);
      if (attempts >= MAX_RETRIES) {
        window.scrollTo({ top: 0, left: 0, behavior });
      }
    }
  }, RETRY_INTERVAL_MS);
}

/**
 * Utility function to scroll to the top of the page with smooth behavior
 * @param delay - Optional delay in milliseconds before scrolling (default: 100ms)
 */
export const scrollToTop = (delay: number = 100): void => {
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, delay);
};

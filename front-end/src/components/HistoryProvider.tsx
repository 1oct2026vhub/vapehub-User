"use client";
import { usePathname, useSearchParams } from 'next/navigation';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { scrollToProductListingStart } from '@/lib/utils/scrollToTop';

/** Key used to skip scroll restore when user explicitly changed page/filter/sort (e.g. pagination). */
export const SCROLL_TO_TOP_NEXT_KEY = 'scrollToTopNext';

/** Pathnames where we never restore scroll – user should always land at top / first product section. */
const PRODUCT_FILTER_PAGE_PATHS = ['/shop', '/new-products', '/product-deals'] as const;
const PRODUCT_FILTER_PAGE_PREFIX = '/brand/';
/** Single-segment paths that are NOT product filter pages (category listing is under single segment e.g. /disposables). */
const NON_FILTER_FIRST_SEGMENTS = new Set([
  'blogs', 'brands', 'contact', 'faq', 'checkout', 'shopping-cart', 'my-account', 'payment-success',
  'payment-failed', 'order-details', 'refer-a-friend', 'delivery-information', 'loyalty-points',
  'privacy-policy', 'returns-policy', 'terms-conditions', 'social-media', 'vapehub-deals', 'not-found'
]);

function isProductFilterPage(pathname: string): boolean {
  if (PRODUCT_FILTER_PAGE_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) return true;
  if (pathname.startsWith(PRODUCT_FILTER_PAGE_PREFIX)) return true;
  const segment = pathname.replace(/^\//, '').split('/')[0];
  if (segment && pathname.match(/^\/[^/]+(\/[^/]+)*$/) && !NON_FILTER_FIRST_SEGMENTS.has(segment)) return true;
  return false;
}

function hasListingSearchParams(searchParams: ReadonlyURLSearchParams): boolean {
  // When the URL includes listing params, treat it as a product filter/listing page even if pathname detection fails.
  if (searchParams.has('offset')) return true;
  if (searchParams.has('sort_by') || searchParams.has('order')) return true;
  if (searchParams.has('price_range') || searchParams.has('categories') || searchParams.has('brand') || searchParams.has('deal_id')) return true;
  if (searchParams.has('keyword')) return true;
  // attribute_* params (variants)
  for (const key of searchParams.keys()) {
    if (key.startsWith('attribute_')) return true;
  }
  return false;
}

/** Call before navigating (e.g. pagination, filter, sort) so the next page load scrolls to top instead of restoring position. */
export function setScrollToTopOnNextNavigation(): void {
  try {
    sessionStorage.setItem(SCROLL_TO_TOP_NEXT_KEY, '1');
  } catch {
    // Ignore storage errors
  }
}

function HistoryProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isRestoringRef = useRef(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Create a unique key for this page (pathname + search params)
  const pageKey = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const isFilterContext = isProductFilterPage(pathname) || hasListingSearchParams(searchParams);

  // Save scroll position to sessionStorage (throttled) – skip on product filter pages (new-products, shop, brand, category, deal)
  useEffect(() => {
    const saveScrollPosition = () => {
      if (isRestoringRef.current) return;
      if (isFilterContext) return;
      try {
        sessionStorage.setItem(`scrollPos_${pageKey}`, window.scrollY.toString());
      } catch (e) {
        console.log(e);
        // Ignore storage errors (e.g., quota exceeded)
      }
    };

    const handleScroll = () => {
      if (isRestoringRef.current) return;
      
      // Clear existing timer
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      
      // Throttle: save after user stops scrolling for 100ms
      saveTimerRef.current = setTimeout(() => {
        saveScrollPosition();
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Save on beforeunload (when navigating away)
    const handleBeforeUnload = () => {
      saveScrollPosition();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Save immediately when clicking on links (to catch navigation before beforeunload)
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]');
      if (link && link.getAttribute('href')?.startsWith('/')) {
        // Save immediately when clicking internal links
        saveScrollPosition();
      }
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleClick, true);
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [pageKey]);

  // Restore scroll position when page loads
  useEffect(() => {
    isRestoringRef.current = true;

    // FILTER PAGES RULES (no position save/restore):
    // - Every visit: stay at TOP of page
    // - Only when user changes page/sort/filter (flag set): scroll to FIRST PRODUCT section (by id)
    if (isFilterContext) {
      try {
        sessionStorage.removeItem(`scrollPos_${pageKey}`);
        const flagged = sessionStorage.getItem(SCROLL_TO_TOP_NEXT_KEY);
        if (flagged) {
          sessionStorage.removeItem(SCROLL_TO_TOP_NEXT_KEY);
          // Deals listing page should go to top; product listings should go to first product section
          if (pathname === '/product-deals') {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
          } else {
            scrollToProductListingStart({ behavior: 'instant', retryIfMissing: true });
          }
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        }
      } catch (e) {
        console.log(e);
      }
      isRestoringRef.current = false;
      return;
    }

    const restoreScroll = () => {
      try {
        // Check if we're navigating to landing page from logo click
        const skipRestore = sessionStorage.getItem('skipScrollRestore_/');
        if (skipRestore && pathname === '/') {
          // Clear the flag and ensure we're at top
          sessionStorage.removeItem('skipScrollRestore_/');
          window.scrollTo({ top: 0, behavior: 'instant' });
          isRestoringRef.current = false;
          return;
        }

        const savedPosition = sessionStorage.getItem(`scrollPos_${pageKey}`);
        if (savedPosition) {
          const position = parseInt(savedPosition, 10);
          if (!isNaN(position) && position > 0) {
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
              window.scrollTo({
                top: position,
                behavior: 'instant' as ScrollBehavior
              });

              // Try again after a short delay in case content is still loading
              setTimeout(() => {
                window.scrollTo({
                  top: position,
                  behavior: 'instant' as ScrollBehavior
                });
                isRestoringRef.current = false;
              }, 150);
            });
            return;
          }
        }
      } catch (e) {
        console.log(e);
      }
      isRestoringRef.current = false;
    };

    // Try to restore immediately
    restoreScroll();

    // Also try after delays to handle async content loading
    const timers = [
      setTimeout(() => restoreScroll(), 100),
      setTimeout(() => restoreScroll(), 300),
      setTimeout(() => {
        restoreScroll();
        isRestoringRef.current = false;
      }, 500)
    ];

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [pageKey, pathname]);

  return <>{children}</>;
}

export default HistoryProvider;

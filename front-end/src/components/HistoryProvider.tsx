"use client";
import { usePathname, useSearchParams } from 'next/navigation';
import type { ReadonlyURLSearchParams } from 'next/navigation';
import { Suspense, useEffect, useLayoutEffect, useRef } from 'react';
import { PRODUCT_LISTING_START_ID, scrollToProductListingStart } from '@/lib/utils/scrollToTop';

/** Key used to skip scroll restore when user explicitly changed page/filter/sort (e.g. pagination). */
export const SCROLL_TO_TOP_NEXT_KEY = 'scrollToTopNext';

/** Known listing routes. Category listing is detected by DOM id presence. */
const PRODUCT_FILTER_PAGE_PATHS = ['/shop', '/new-products', '/product-deals'] as const;
const PRODUCT_FILTER_PAGE_PREFIX = '/brand/';

function isKnownProductFilterPath(pathname: string): boolean {
  if (PRODUCT_FILTER_PAGE_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))) return true;
  if (pathname.startsWith(PRODUCT_FILTER_PAGE_PREFIX)) return true;
  return false;
}

function hasListingSearchParams(searchParams: ReadonlyURLSearchParams): boolean {
  // When the URL includes listing params, treat it as a product filter/listing page even if pathname detection fails.
  if (searchParams.has('offset')) return true;
  if (searchParams.has('sort_by') || searchParams.has('order')) return true;
  if (searchParams.has('price_range') || searchParams.has('categories') || searchParams.has('brand') || searchParams.has('deal_id')) return true;
  if (searchParams.has('keyword')) return true;
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

/** trailingSlash: true may store keys as `/blogs?x` or `/blogs/?x`. */
function withTrailingSlashKeyVariants(pageKey: string): string[] {
  const q = pageKey.indexOf('?');
  const path = q === -1 ? pageKey : pageKey.slice(0, q);
  const query = q === -1 ? '' : pageKey.slice(q);
  const withSlash = path.endsWith('/') ? path : `${path}/`;
  const withoutSlash = path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path;
  return Array.from(new Set([pageKey, `${withSlash}${query}`, `${withoutSlash}${query}`]));
}

function readSessionFlag(prefix: string, pageKey: string): string | null {
  for (const key of withTrailingSlashKeyVariants(pageKey)) {
    const value = sessionStorage.getItem(`${prefix}${key}`);
    if (value != null) return value;
  }
  return null;
}

function removeSessionKeys(prefix: string, pageKey: string): void {
  withTrailingSlashKeyVariants(pageKey).forEach((key) => {
    sessionStorage.removeItem(`${prefix}${key}`);
  });
}

function HistoryScrollManager() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isRestoringRef = useRef(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFilterContextRef = useRef(false);

  // Create a unique key for this page (pathname + search params)
  const pageKey = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  // Compute whether this page is a product filter/listing page.
  // Category pages are detected by the presence of the listing start element id.
  useLayoutEffect(() => {
    try {
      const hasListingAnchor = Boolean(document.getElementById(PRODUCT_LISTING_START_ID));
      isFilterContextRef.current =
        isKnownProductFilterPath(pathname) || hasListingSearchParams(searchParams) || hasListingAnchor;
    } catch {
      isFilterContextRef.current = isKnownProductFilterPath(pathname) || hasListingSearchParams(searchParams);
    }
  }, [pageKey, pathname, searchParams]);

  // Before paint: honor explicit “scroll to top” navigations (e.g. author articles link).
  // With history.scrollRestoration = 'manual', client navigations keep the previous scrollY.
  // From a deep article scroll that lands on a shorter page, that looks like the footer.
  useLayoutEffect(() => {
    if (isFilterContextRef.current) return;
    try {
      const skipHome = pathname === '/' && sessionStorage.getItem('skipScrollRestore_/');
      const skipPage = readSessionFlag('skipScrollRestore_', pageKey);
      if (!skipHome && !skipPage) return;
      isRestoringRef.current = true;
      removeSessionKeys('scrollPos_', pageKey);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    } catch {
      // Ignore storage errors
    }
  }, [pageKey, pathname]);

  // Save scroll position to sessionStorage (throttled) – skip on product filter pages (new-products, shop, brand, category, deal)
  useEffect(() => {
    const saveScrollPosition = () => {
      if (isRestoringRef.current) return;
      if (isFilterContextRef.current) return;
      try {
        sessionStorage.setItem(`scrollPos_${pageKey}`, window.scrollY.toString());
      } catch (e) {
        console.error(e);
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
    if (isFilterContextRef.current) {
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
        console.error(e);
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

        // Explicit “scroll to top” navigations (e.g. author articles link). Do not restore a saved
        // position, and do not keep the previous page’s scrollY (manual restoration leaves it in place).
        // Keep the flag until delayed restore attempts finish so they cannot re-apply a saved offset.
        const skipRestorePage = readSessionFlag('skipScrollRestore_', pageKey);
        if (skipRestorePage) {
          removeSessionKeys('scrollPos_', pageKey);
          window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
          return;
        }

        const savedPosition = readSessionFlag('scrollPos_', pageKey);
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
        console.error(e);
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
        try {
          removeSessionKeys('skipScrollRestore_', pageKey);
        } catch {
          // Ignore storage errors
        }
        isRestoringRef.current = false;
      }, 500)
    ];

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [pageKey, pathname]);

  return null;
}

function HistoryProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <HistoryScrollManager />
      </Suspense>
      {children}
    </>
  );
}

export default HistoryProvider;

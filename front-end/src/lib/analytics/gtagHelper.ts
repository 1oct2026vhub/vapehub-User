declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * Sends a route-based page view event to GA4.
 * Uses only pathname to avoid query-string report fragmentation.
 */
export const GATagPageView = (pathname: string) => {
  if (typeof window === "undefined" || typeof window.gtag !== "function" || !pathname) {
    return;
  }

  window.gtag("event", "page_view", {
    page_path: pathname,
  });
};
  
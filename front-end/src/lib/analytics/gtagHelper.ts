declare global {
  interface Window {
    gtag: (command: string, id: string, config?: { page_path: string }) => void;
  }
}

/**
 * Sends a page view event to Google Analytics using the provided measurement ID and URL.
 * @param {string} GA_MEASUREMENT_ID The Google Analytics measurement ID.
 * @param {string} url The URL of the page being tracked.
 */
export const GATagPageView = (GA_MEASUREMENT_ID: string, url: string) => {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  };
  
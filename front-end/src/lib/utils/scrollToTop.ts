/**
 * Utility function to scroll to the top of the page with smooth behavior
 * @param delay - Optional delay in milliseconds before scrolling (default: 100ms)
 */
export const scrollToTop = (delay: number = 100): void => {
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, delay);
};

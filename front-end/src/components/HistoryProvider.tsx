"use client";
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

function HistoryProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isRestoringRef = useRef(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Create a unique key for this page (pathname + search params)
  const pageKey = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  // Save scroll position to sessionStorage (throttled)
  useEffect(() => {
    const saveScrollPosition = () => {
      if (isRestoringRef.current) return;
      try {
        sessionStorage.setItem(`scrollPos_${pageKey}`, window.scrollY.toString());
      } catch (e) {
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
    
    const restoreScroll = () => {
      try {
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
        // Ignore storage errors
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
  }, [pageKey]);

  return <>{children}</>;
}

export default HistoryProvider;

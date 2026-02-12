import { useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname, key } = useLocation();
  const navigationType = useNavigationType();
  const scrollPositions = useRef<Map<string, number>>(new Map());
  const currentKey = useRef<string>('');
  const lastScrollY = useRef<number>(0);

  // Disable browser's automatic scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  // Continuously track scroll position so we always have the latest value
  const handleScroll = useCallback(() => {
    lastScrollY.current = window.scrollY;
    if (currentKey.current) {
      scrollPositions.current.set(currentKey.current, window.scrollY);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    // Save the scroll position of the PREVIOUS page using the continuously tracked value
    if (currentKey.current && currentKey.current !== key) {
      scrollPositions.current.set(currentKey.current, lastScrollY.current);
    }
    currentKey.current = key;

    // POP = Back/Forward browser navigation
    if (navigationType === 'POP') {
      const savedPosition = scrollPositions.current.get(key);
      if (savedPosition !== undefined && savedPosition > 0) {
        const tryScroll = () => {
          window.scrollTo({ top: savedPosition, behavior: 'instant' });
        };

        // Try immediately
        tryScroll();

        // If page already has enough height, we're done
        if (document.body.scrollHeight >= savedPosition + window.innerHeight) {
          return;
        }

        // Otherwise, observe DOM mutations until page is tall enough
        const observer = new MutationObserver(() => {
          if (document.body.scrollHeight >= savedPosition + window.innerHeight) {
            tryScroll();
            observer.disconnect();
            clearTimeout(fallbackTimeout);
          }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Fallback: stop observing after 5s
        const fallbackTimeout = setTimeout(() => {
          tryScroll();
          observer.disconnect();
        }, 5000);

        return () => {
          observer.disconnect();
          clearTimeout(fallbackTimeout);
        };
      }
    }

    // PUSH/REPLACE = new navigation - scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, key, navigationType]);

  return null;
}

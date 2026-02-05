import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname, key } = useLocation();
  const navigationType = useNavigationType();
  const scrollPositions = useRef<Map<string, number>>(new Map());
  const prevKey = useRef<string>('');

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

  useEffect(() => {
    // Save current scroll position before navigating
    if (prevKey.current) {
      scrollPositions.current.set(prevKey.current, window.scrollY);
    }
    prevKey.current = key;

    // POP = Back/Forward browser navigation
    if (navigationType === 'POP') {
      const savedPosition = scrollPositions.current.get(key);
      if (savedPosition !== undefined) {
        // Multiple attempts with increasing delays to ensure content is loaded
        const attempts = [0, 50, 100, 200, 350, 500];
        attempts.forEach((delay) => {
          setTimeout(() => {
            window.scrollTo({ top: savedPosition, behavior: 'instant' });
          }, delay);
        });
        return;
      }
    }

    // PUSH/REPLACE = new navigation - scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, key, navigationType]);

  return null;
}

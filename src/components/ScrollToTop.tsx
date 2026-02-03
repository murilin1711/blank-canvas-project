import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname, key } = useLocation();
  const navigationType = useNavigationType();
  const scrollPositions = useRef<Map<string, number>>(new Map());
  const prevKey = useRef<string>('');

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
        // Small delay to ensure content has loaded
        requestAnimationFrame(() => {
          window.scrollTo(0, savedPosition);
        });
        return;
      }
    }

    // PUSH/REPLACE = new navigation - scroll to top
    window.scrollTo(0, 0);
  }, [pathname, key, navigationType]);

  return null;
}

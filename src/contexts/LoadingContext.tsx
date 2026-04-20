import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoadingScreen } from '@/components/LoadingScreen';

interface LoadingContextType {
  navigateWithLoading: (to: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

const SESSION_KEY = 'gm_anim_shown';
const ANIMATE_PATHS = ['/', '/escolas/colegio-militar'];

function getShownSet(): Set<string> {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function markShown(path: string) {
  try {
    const set = getShownSet();
    set.add(path);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...set]));
  } catch {}
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [showLoading, setShowLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const prevPathname = useRef(location.pathname);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tryShow = useCallback((path: string) => {
    if (!ANIMATE_PATHS.includes(path)) return;
    if (getShownSet().has(path)) return;
    markShown(path);
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowLoading(true);
    timerRef.current = setTimeout(() => setShowLoading(false), 2000);
  }, []);

  // Animação no carregamento inicial
  useEffect(() => {
    tryShow(location.pathname);
  }, []);

  // Animação em navegações subsequentes
  useEffect(() => {
    if (prevPathname.current !== location.pathname) {
      prevPathname.current = location.pathname;
      tryShow(location.pathname);
    }
  }, [location.pathname, tryShow]);

  const navigateWithLoading = useCallback((to: string) => {
    navigate(to);
  }, [navigate]);

  return (
    <LoadingContext.Provider value={{ navigateWithLoading }}>
      {children}
      <LoadingScreen isVisible={showLoading} />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

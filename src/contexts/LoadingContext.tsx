import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoadingScreen } from '@/components/LoadingScreen';

interface LoadingContextType {
  navigateWithLoading: (to: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [showLoading, setShowLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const prevPathname = useRef(location.pathname);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Rotas de produto onde a animação de loading não deve aparecer
  const isProductRoute = (path: string) =>
    /\/produto\/\d+/.test(path) || /\/produto\d+/.test(path);

  // Dispara automaticamente em qualquer troca de rota (exceto produtos)
  useEffect(() => {
    if (prevPathname.current !== location.pathname) {
      prevPathname.current = location.pathname;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (!isProductRoute(location.pathname)) {
        setShowLoading(true);
        timerRef.current = setTimeout(() => setShowLoading(false), 2000);
      }
    }
  }, [location.pathname]);

  // Mantém compatibilidade com quem já usa navigateWithLoading
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

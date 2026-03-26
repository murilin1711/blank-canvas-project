import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingScreen } from '@/components/LoadingScreen';

interface LoadingContextType {
  navigateWithLoading: (to: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [showLoading, setShowLoading] = useState(false);
  const navigate = useNavigate();

  const navigateWithLoading = useCallback((to: string) => {
    // 1. Mostrar a tela de carregamento instantaneamente
    setShowLoading(true);

    // 2. Esperar exatos 2000 milissegundos para realizar a navegação no React Router
    // Isso ocorrerá no exato instante (80% de 2.5s) em que a logo começa a dar o super zoom final na fase de saída.
    // O React Router muda a página invisivelmente no fundo, e o AnimatePresence da LoadingScreen ativa o exit={{opacity: 0}}
    setTimeout(() => {
      navigate(to);
      setShowLoading(false);
    }, 2000);
    
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

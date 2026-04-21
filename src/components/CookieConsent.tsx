import { useState, useEffect } from 'react';
import { X, Shield } from 'lucide-react';

const STORAGE_KEY = 'gm_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, 'essential');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 md:p-6">
        <div className="flex gap-4">
          <div className="hidden sm:flex w-10 h-10 bg-[#2e3091]/10 rounded-full items-center justify-center flex-shrink-0 mt-0.5">
            <Shield className="w-5 h-5 text-[#2e3091]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">
              Sua privacidade é importante para nós
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Usamos cookies para melhorar sua experiência, analisar o tráfego do site e personalizar conteúdo.
              Ao continuar navegando, você concorda com nossa{' '}
              <button
                onClick={() => {/* footer abre política */}}
                className="text-[#2e3091] underline hover:no-underline"
              >
                Política de Privacidade
              </button>
              {' '}em conformidade com a LGPD.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={accept}
                className="flex-1 sm:flex-none bg-[#2e3091] text-white px-5 py-2.5 rounded-full text-xs font-medium hover:bg-[#252a7a] transition-colors"
              >
                Aceitar todos
              </button>
              <button
                onClick={decline}
                className="flex-1 sm:flex-none border border-gray-200 text-gray-600 px-5 py-2.5 rounded-full text-xs font-medium hover:bg-gray-50 transition-colors"
              >
                Apenas essenciais
              </button>
            </div>
          </div>
          <button
            onClick={decline}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors -mt-1 -mr-1"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

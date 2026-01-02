import { useState } from "react";
import { CreditCard, X } from "lucide-react";

const BolsaUniformeBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-[240px]">
      <div className="bg-[#2e3091] text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <CreditCard className="w-4 h-4 flex-shrink-0" />
        <span className="text-xs font-medium leading-tight flex-1">
          Aceitamos pagamento pelo Bolsa Uniforme
        </span>
        <button
          onClick={() => setIsVisible(false)}
          className="p-0.5 hover:bg-white/20 rounded transition-colors flex-shrink-0"
          aria-label="Fechar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default BolsaUniformeBanner;

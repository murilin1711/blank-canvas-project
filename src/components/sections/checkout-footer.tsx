import { Wallet } from "lucide-react";

export default function CheckoutFooter() {
  return (
    <footer className="bg-background-primary py-8 border-t border-border-light mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center gap-6">
          {/* Formas de Pagamento */}
          <div className="text-center">
            <p className="text-caption font-medium text-text-primary uppercase tracking-wider mb-4">
              Formas de Pagamento:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {/* Visa */}
              <span className="text-text-secondary font-bold text-lg tracking-wider">VISA</span>
              
              {/* Mastercard */}
              <div className="flex">
                <div className="w-5 h-5 rounded-full bg-red-500 -mr-2"></div>
                <div className="w-5 h-5 rounded-full bg-yellow-500"></div>
              </div>
              
              {/* American Express */}
              <span className="text-[10px] font-bold text-text-secondary border border-text-secondary px-1.5 py-0.5 leading-tight">AMERICAN<br/>EXPRESS</span>
              
              {/* Diners */}
              <div className="w-7 h-7 rounded-full border-2 border-text-secondary flex items-center justify-center">
                <div className="w-2 h-4 bg-text-secondary rounded-sm"></div>
              </div>
              
              {/* Elo */}
              <span className="text-text-secondary font-bold text-lg">eLO</span>
              
              {/* Hipercard */}
              <span className="text-text-secondary font-bold text-sm">Hipercard</span>
              
              {/* Pix */}
              <div className="flex items-center gap-1">
                <svg className="w-5 h-5 text-text-secondary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.8 5.5L12 11.3 6.2 5.5c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4l5.8 5.8-5.8 5.8c-.4.4-.4 1 0 1.4s1 .4 1.4 0l5.8-5.8 5.8 5.8c.4.4 1 .4 1.4 0s.4-1 0-1.4l-5.8-5.8 5.8-5.8c.4-.4.4-1 0-1.4s-1-.4-1.4 0z"/>
                </svg>
                <span className="text-text-secondary font-medium text-sm">Pix</span>
              </div>
              
              {/* Google Pay */}
              <span className="text-text-secondary font-medium text-sm">G Pay</span>
              
              {/* Apple Pay */}
              <span className="text-text-secondary font-medium text-sm"> Pay</span>
              
              {/* Bolsa Uniforme */}
              <div className="flex items-center gap-1.5 bg-[#2e3091]/10 px-3 py-1.5 rounded-full">
                <Wallet className="w-4 h-4 text-[#2e3091]" />
                <span className="text-[#2e3091] font-medium text-sm">Bolsa Uniforme</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

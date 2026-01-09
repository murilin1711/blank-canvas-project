import { Wallet } from "lucide-react";
import visaLogo from "@/assets/payment/visa.png";
import mastercardLogo from "@/assets/payment/mastercard.webp";
import amexLogo from "@/assets/payment/amex.png";
import hipercardLogo from "@/assets/payment/hipercard.png";
import eloLogo from "@/assets/payment/elo.png";
import applepayLogo from "@/assets/payment/applepay.png";
import gpayLogo from "@/assets/payment/gpay.webp";
import pixLogo from "@/assets/payment/pix.png";

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
              <img src={visaLogo} alt="Visa" className="h-6 object-contain" />
              
              {/* Mastercard */}
              <img src={mastercardLogo} alt="Mastercard" className="h-8 object-contain" />
              
              {/* American Express */}
              <img src={amexLogo} alt="American Express" className="h-6 object-contain" />
              
              {/* Hipercard */}
              <img src={hipercardLogo} alt="Hipercard" className="h-6 object-contain" />
              
              {/* Elo */}
              <img src={eloLogo} alt="Elo" className="h-6 object-contain" />
              
              {/* Pix */}
              <div className="flex items-center gap-1.5">
                <img src={pixLogo} alt="Pix" className="h-5 object-contain" />
                <span className="text-text-secondary font-medium text-sm">Pix</span>
              </div>
              
              {/* Google Pay */}
              <img src={gpayLogo} alt="Google Pay" className="h-6 object-contain" />
              
              {/* Apple Pay */}
              <img src={applepayLogo} alt="Apple Pay" className="h-6 object-contain" />
              
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

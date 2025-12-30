import { CreditCard } from "lucide-react";

const BolsaUniformeBanner = () => {
  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-[200px]">
      <div className="bg-[#2e3091] text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <CreditCard className="w-4 h-4 flex-shrink-0" />
        <span className="text-xs font-medium leading-tight">
          Aceitamos Bolsa Uniforme
        </span>
      </div>
    </div>
  );
};

export default BolsaUniformeBanner;

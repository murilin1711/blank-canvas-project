import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

interface LoginRequiredModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginRequiredModal({ open, onClose }: LoginRequiredModalProps) {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate("/auth", { state: { from: window.location.pathname } });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-red-500" />
          </div>
          <DialogTitle className="text-center">Faça login para favoritar</DialogTitle>
          <DialogDescription className="text-center">
            Para adicionar produtos aos seus favoritos, você precisa estar logado na sua conta.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={handleLogin}
            className="w-full bg-[#2e3091] text-white py-3 rounded-lg font-semibold hover:bg-[#252a7a] transition-colors"
          >
            Fazer login
          </button>
          <button
            onClick={onClose}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Continuar navegando
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

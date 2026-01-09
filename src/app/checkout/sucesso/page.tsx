import { useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Package, ArrowRight, ShoppingBag, Home } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import CheckoutFooter from "@/components/sections/checkout-footer";

export default function CheckoutSucessoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    // Clear cart on successful payment
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen flex flex-col bg-background-tertiary">
      <main className="flex-1 flex items-center justify-center px-4 py-16 pt-[120px]">
        <div className="max-w-lg w-full">
          {/* Success Card */}
          <div className="bg-background-primary rounded-2xl p-8 md:p-12 text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#2e3091]/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-[#2e3091]" />
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-semibold text-text-primary mb-3">
              Pagamento Confirmado!
            </h1>

            <p className="text-body-regular text-text-secondary mb-8">
              Seu pedido foi realizado com sucesso. Você receberá um e-mail de
              confirmação em breve com todos os detalhes.
            </p>

            {/* Order Info */}
            <div className="bg-background-secondary rounded-xl p-5 mb-8">
              <div className="flex items-center justify-center gap-3 text-body-sm text-text-secondary">
                <Package className="w-5 h-5 text-[#2e3091]" />
                <span>Acompanhe seu pedido em "Meus Pedidos"</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={() => navigate("/meus-pedidos")}
                className="w-full py-4 bg-[#2e3091] text-white font-medium rounded-full hover:bg-[#252a7a] transition-colors flex items-center justify-center gap-2"
              >
                Ver Meus Pedidos
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/escolas/colegio-militar"
                className="w-full py-4 border-2 border-border-light text-text-primary font-medium rounded-full hover:bg-background-secondary transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Continuar Comprando
              </Link>

              <Link
                to="/"
                className="w-full py-3 text-body-sm font-medium text-text-muted hover:text-text-primary transition-colors flex items-center justify-center gap-2 underline underline-offset-4"
              >
                <Home className="w-4 h-4" />
                Voltar para a página inicial
              </Link>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-caption text-text-muted">
              Dúvidas sobre seu pedido? Entre em contato pelo WhatsApp:{" "}
              <a href="tel:+5562999999999" className="text-[#2e3091] hover:underline">
                (62) 99999-9999
              </a>
            </p>
          </div>
        </div>
      </main>
      <CheckoutFooter />
    </div>
  );
}

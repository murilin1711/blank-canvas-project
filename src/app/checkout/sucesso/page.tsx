import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import Footer from "@/components/sections/footer";

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
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground">
            Pagamento Confirmado!
          </h1>

          <p className="text-muted-foreground">
            Seu pedido foi realizado com sucesso. Você receberá um e-mail de
            confirmação em breve.
          </p>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Package className="w-4 h-4" />
              <span>Acompanhe seu pedido em "Meus Pedidos"</span>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              onClick={() => navigate("/meus-pedidos")}
              className="w-full"
              size="lg"
            >
              Ver Meus Pedidos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              onClick={() => navigate("/escolas/colegio-militar")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Continuar Comprando
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

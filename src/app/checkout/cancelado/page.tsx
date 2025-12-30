import { useNavigate } from "react-router-dom";
import { XCircle, ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/sections/footer";

export default function CheckoutCanceladoPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground">
            Pagamento Cancelado
          </h1>

          <p className="text-muted-foreground">
            Seu pagamento foi cancelado. Não se preocupe, seus itens ainda estão
            no carrinho.
          </p>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Se você teve algum problema durante o pagamento, entre em contato
              conosco.
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              onClick={() => navigate("/checkout")}
              className="w-full"
              size="lg"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Voltar ao Checkout
            </Button>

            <Button
              onClick={() => navigate("/escolas/colegio-militar")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continuar Comprando
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

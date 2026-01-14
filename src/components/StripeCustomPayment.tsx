import { useState, useEffect } from "react";
import { loadStripe, Appearance } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Lock, CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_51OxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxSvE");

interface CartItem {
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  size: string;
  quantity: number;
  schoolSlug: string;
}

interface StripeCustomPaymentProps {
  items: CartItem[];
  customerEmail: string;
  customerName: string;
  shippingAddress: {
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  shipping: number;
  userId: string;
  total: number;
}

// Appearance configuration for Stripe Elements
const appearance: Appearance = {
  theme: "flat",
  variables: {
    colorPrimary: "#2e3091",
    colorBackground: "#ffffff",
    colorText: "#222222",
    colorDanger: "#ef4444",
    fontFamily: '"Suisse Int\'l", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    borderRadius: "9999px",
    spacingUnit: "4px",
    fontSizeBase: "14px",
  },
  rules: {
    ".Input": {
      border: "1px solid #dbdbdb",
      padding: "16px 20px",
      borderRadius: "9999px",
      fontSize: "13px",
      boxShadow: "none",
      transition: "border-color 0.2s ease",
    },
    ".Input:focus": {
      border: "1px solid #2e3091",
      boxShadow: "none",
      outline: "none",
    },
    ".Input:hover": {
      border: "1px solid #868686",
    },
    ".Input--invalid": {
      border: "1px solid #ef4444",
    },
    ".Label": {
      color: "#000000",
      fontWeight: "400",
      fontSize: "13px",
      marginBottom: "8px",
    },
    ".Tab": {
      borderRadius: "9999px",
      border: "1px solid #dbdbdb",
      padding: "12px 16px",
    },
    ".Tab--selected": {
      backgroundColor: "#2e3091",
      borderColor: "#2e3091",
      color: "#ffffff",
    },
    ".Tab:hover": {
      borderColor: "#2e3091",
    },
    ".TabIcon--selected": {
      fill: "#ffffff",
    },
    ".Error": {
      color: "#ef4444",
      fontSize: "12px",
      marginTop: "4px",
    },
  },
};

// Payment Form Component
function PaymentForm({ 
  total, 
  onSuccess 
}: { 
  total: number; 
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/sucesso`,
        },
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Ocorreu um erro no pagamento.");
        toast.error(error.message || "Erro no pagamento");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        toast.success("Pagamento realizado com sucesso!");
        onSuccess();
      } else if (paymentIntent && paymentIntent.status === "processing") {
        toast.info("Seu pagamento está sendo processado...");
        onSuccess();
      } else if (paymentIntent && paymentIntent.status === "requires_action") {
        // Payment requires additional action (like 3D Secure)
        // Stripe will handle this automatically
      }
    } catch (err) {
      console.error("Payment error:", err);
      setErrorMessage("Ocorreu um erro inesperado.");
      toast.error("Erro no pagamento");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement 
        options={{
          layout: {
            type: "tabs",
            defaultCollapsed: false,
          },
        }}
      />

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-body-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-[#2e3091] text-white py-4 rounded-full font-medium hover:bg-[#252a7a] transition-colors text-btn uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Pagar R$ {total.toFixed(2).replace(".", ",")}
          </>
        )}
      </button>

      {/* Security badges */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <div className="flex items-center gap-1.5 text-text-muted">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-caption">Pagamento Seguro</span>
        </div>
        <div className="flex items-center gap-1.5 text-text-muted">
          <CreditCard className="w-4 h-4" />
          <span className="text-caption">Dados Protegidos</span>
        </div>
      </div>
    </form>
  );
}

// Main Component
export function StripeCustomPayment({
  items,
  customerEmail,
  customerName,
  shippingAddress,
  shipping,
  userId,
  total,
}: StripeCustomPaymentProps) {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fnError } = await supabase.functions.invoke("create-payment-intent", {
          body: {
            items,
            customerEmail,
            customerName,
            shippingAddress,
            shipping,
            userId,
          },
        });

        if (fnError || !data?.clientSecret) {
          console.error("Error creating payment intent:", fnError);
          setError("Não foi possível iniciar o pagamento. Tente novamente.");
          return;
        }

        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error("Error:", err);
        setError("Erro ao conectar com o servidor de pagamentos.");
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [items, customerEmail, customerName, shippingAddress, shipping, userId]);

  const handlePaymentSuccess = () => {
    clearCart();
    navigate("/checkout/sucesso");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#2e3091]" />
        <p className="text-body-sm text-text-secondary">Preparando pagamento seguro...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-body-sm text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-body-sm text-[#2e3091] underline hover:no-underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  return (
    <div className="w-full">
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance,
          locale: "pt-BR",
        }}
      >
        <PaymentForm total={total} onSuccess={handlePaymentSuccess} />
      </Elements>
    </div>
  );
}

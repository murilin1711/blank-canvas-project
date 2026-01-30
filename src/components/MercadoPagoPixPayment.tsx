import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Check, Clock, X, QrCode, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import pixLogo from "@/assets/payment/pix.png";

interface CartItem {
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  size: string;
  quantity: number;
  schoolSlug: string;
}

interface MercadoPagoPixPaymentProps {
  items: CartItem[];
  customerEmail: string;
  customerName: string;
  cpf: string;
  total: number;
  userId: string;
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
  onBack: () => void;
}

export function MercadoPagoPixPayment({
  items,
  customerEmail,
  customerName,
  cpf,
  total,
  userId,
  shippingAddress,
  shipping,
  onBack,
}: MercadoPagoPixPaymentProps) {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<{
    paymentId: string;
    qrCodeBase64: string;
    qrCode: string;
    expirationDate: string;
    orderId?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(30 * 60); // 30 minutes
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  // Create Pix payment
  const createPixPayment = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke("create-mercadopago-pix", {
        body: {
          items,
          customerEmail,
          customerName,
          cpf,
          total,
          userId,
          shippingAddress,
          shipping,
        },
      });

      if (error) {
        throw new Error(error.message || "Erro ao criar pagamento Pix");
      }

      if (!data?.qrCodeBase64 || !data?.qrCode) {
        throw new Error("Dados do QR Code não disponíveis");
      }

      setPaymentData(data);
      
      // Calculate time remaining based on expiration date
      // Mercado Pago returns 24h expiration, but we cap at 30min for better UX
      if (data.expirationDate) {
        const expirationTime = new Date(data.expirationDate).getTime();
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((expirationTime - now) / 1000));
        // Cap at 30 minutes (1800 seconds) for display purposes
        setTimeRemaining(Math.min(remaining, 30 * 60));
      }
    } catch (err) {
      console.error("Error creating Pix payment:", err);
      setError(err instanceof Error ? err.message : "Erro ao criar pagamento");
    } finally {
      setIsLoading(false);
    }
  }, [items, customerEmail, customerName, cpf, total, userId, shippingAddress, shipping]);

  useEffect(() => {
    createPixPayment();
  }, [createPixPayment]);

  // Countdown timer
  useEffect(() => {
    if (!paymentData || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentData]);

  // Poll for payment status
  useEffect(() => {
    if (!paymentData?.paymentId) return;

    const checkPayment = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("check-pix-payment", {
          body: { paymentId: paymentData.paymentId },
        });

        if (error) {
          console.error("Error checking payment:", error);
          return;
        }

        if (data?.approved) {
          toast.success("Pagamento confirmado!");
          clearCart();
          navigate("/checkout/sucesso");
        }
      } catch (err) {
        console.error("Error checking payment status:", err);
      }
    };

    // Check every 5 seconds
    const pollInterval = setInterval(checkPayment, 5000);

    return () => clearInterval(pollInterval);
  }, [paymentData?.paymentId, clearCart, navigate]);

  const copyToClipboard = async () => {
    if (!paymentData?.qrCode) return;

    try {
      await navigator.clipboard.writeText(paymentData.qrCode);
      setCopied(true);
      toast.success("Código Pix copiado!");
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast.error("Erro ao copiar código");
    }
  };

  const handleManualCheck = async () => {
    if (!paymentData?.paymentId || isCheckingPayment) return;

    setIsCheckingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-pix-payment", {
        body: { paymentId: paymentData.paymentId },
      });

      if (error) {
        toast.error("Erro ao verificar pagamento");
        return;
      }

      if (data?.approved) {
        toast.success("Pagamento confirmado!");
        clearCart();
        navigate("/checkout/sucesso");
      } else {
        toast.info("Pagamento ainda não confirmado. Aguarde alguns instantes.");
      }
    } catch (err) {
      toast.error("Erro ao verificar pagamento");
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="bg-background-primary rounded-2xl p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2e3091] border-t-transparent mb-4" />
          <p className="text-body-sm text-text-secondary">Gerando QR Code Pix...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background-primary rounded-2xl p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-body-regular font-medium text-text-primary mb-2">
            Erro ao gerar Pix
          </h3>
          <p className="text-body-sm text-text-secondary mb-6">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-6 py-3 border border-border-light rounded-full text-body-sm font-medium text-text-primary hover:bg-background-secondary transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={createPixPayment}
              className="px-6 py-3 bg-[#2e3091] text-white rounded-full text-body-sm font-medium hover:bg-[#252a7a] transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (timeRemaining <= 0) {
    return (
      <div className="bg-background-primary rounded-2xl p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <h3 className="text-body-regular font-medium text-text-primary mb-2">
            QR Code expirado
          </h3>
          <p className="text-body-sm text-text-secondary mb-6">
            O tempo para pagamento expirou. Gere um novo QR Code para continuar.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="px-6 py-3 border border-border-light rounded-full text-body-sm font-medium text-text-primary hover:bg-background-secondary transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={createPixPayment}
              className="px-6 py-3 bg-[#2e3091] text-white rounded-full text-body-sm font-medium hover:bg-[#252a7a] transition-colors"
            >
              Gerar novo QR Code
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-primary rounded-2xl p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src={pixLogo} alt="Pix" className="h-6" />
          <h2 className="text-h3 font-medium text-text-primary">Pague com Pix</h2>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="w-4 h-4" />
          Voltar
        </button>
      </div>

      {/* Timer */}
      <div className="flex items-center justify-center gap-2 bg-yellow-50 text-yellow-800 py-3 px-4 rounded-xl mb-6">
        <Clock className="w-5 h-5" />
        <span className="text-body-sm font-medium">
          Expira em: <span className="font-bold">{formatTime(timeRemaining)}</span>
        </span>
      </div>

      {/* QR Code Section */}
      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
        {/* QR Code Image */}
        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-border-light">
            {paymentData?.qrCodeBase64 && (
              <img
                src={`data:image/png;base64,${paymentData.qrCodeBase64}`}
                alt="QR Code Pix"
                className="w-64 h-64 md:w-72 md:h-72"
              />
            )}
          </div>
          <p className="text-caption text-text-muted mt-3 text-center">
            Escaneie o QR Code com o app do seu banco
          </p>
        </div>

        {/* Instructions */}
        <div className="flex-1 space-y-6">
          {/* Total */}
          <div className="bg-[#2e3091]/5 rounded-xl p-4">
            <p className="text-caption text-text-muted uppercase tracking-wider mb-1">
              Valor a pagar
            </p>
            <p className="text-h2 font-bold text-[#2e3091]">{formatCurrency(total)}</p>
          </div>

          {/* Copy and Paste Code */}
          <div>
            <p className="text-body-sm font-medium text-text-primary mb-3">
              Ou copie o código Pix:
            </p>
            <div className="relative">
              <div className="bg-background-secondary rounded-xl p-4 pr-20 overflow-hidden">
                <p className="text-body-sm text-text-secondary break-all font-mono">
                  {paymentData?.qrCode?.substring(0, 80)}...
                </p>
              </div>
              <button
                onClick={copyToClipboard}
                className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  copied
                    ? "bg-green-100 text-green-700"
                    : "bg-[#2e3091] text-white hover:bg-[#252a7a]"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="text-sm">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="text-sm">Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* How to pay */}
          <div className="bg-background-secondary rounded-xl p-4">
            <p className="text-body-sm font-medium text-text-primary mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Como pagar:
            </p>
            <ol className="space-y-2 text-body-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-[#2e3091]/10 rounded-full flex items-center justify-center text-xs text-[#2e3091] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <span>Abra o aplicativo do seu banco</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-[#2e3091]/10 rounded-full flex items-center justify-center text-xs text-[#2e3091] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <span>Escolha pagar via Pix</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-[#2e3091]/10 rounded-full flex items-center justify-center text-xs text-[#2e3091] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <span>Escaneie o QR Code ou cole o código copiado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-[#2e3091]/10 rounded-full flex items-center justify-center text-xs text-[#2e3091] font-bold shrink-0 mt-0.5">
                  4
                </span>
                <span>Confirme o pagamento</span>
              </li>
            </ol>
          </div>

          {/* Check Payment Button */}
          <button
            onClick={handleManualCheck}
            disabled={isCheckingPayment}
            className="w-full py-4 bg-[#2e3091] text-white rounded-full font-medium hover:bg-[#252a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCheckingPayment ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Verificando...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Já fiz o pagamento
              </>
            )}
          </button>

          <p className="text-caption text-text-muted text-center">
            O pagamento é processado automaticamente. Após a confirmação, você será redirecionado.
          </p>
        </div>
      </div>
    </div>
  );
}

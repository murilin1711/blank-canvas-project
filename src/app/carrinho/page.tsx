import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Heart, Plus, Minus, ShoppingBag, Truck, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import CheckoutFooter from "@/components/sections/checkout-footer";

export default function CarrinhoPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  
  const [cep, setCep] = useState("");
  const [shippingOptions, setShippingOptions] = useState<{
    juma: { price: number; duration: string; distance: string } | null;
    melhorEnvio: Array<{ id: number; name: string; company: string; companyLogo: string; price: number; deliveryDays: number; deliveryRange: { min: number; max: number } | null }>;
  } | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showProducts, setShowProducts] = useState(true);

  const getSelectedShippingPrice = () => {
    if (!selectedShipping || !shippingOptions) return 0;
    if (selectedShipping === "juma") return shippingOptions.juma?.price || 0;
    const meOption = shippingOptions.melhorEnvio.find(o => `me-${o.id}` === selectedShipping);
    return meOption?.price || 0;
  };
  const shipping = getSelectedShippingPrice();
  const total = subtotal + shipping;

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{3})/, "$1-$2");
    }
    return value;
  };

  const calculateShipping = async () => {
    if (cep.replace(/\D/g, "").length !== 8) {
      toast.error("Digite um CEP válido");
      return;
    }

    setIsCalculating(true);
    setShippingOptions(null);
    setSelectedShipping(null);

    try {
      // Fetch address from ViaCEP to get city/state
      const cleanCep = cep.replace(/\D/g, "");
      const viaCepRes = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const viaCepData = await viaCepRes.json();

      if (viaCepData.erro) {
        toast.error("CEP não encontrado");
        setIsCalculating(false);
        return;
      }

      const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const cityNormalized = normalize(viaCepData.localidade || "");
      const isAnapolis = cityNormalized === "anapolis" && viaCepData.uf === "GO";

      let jumaOption = null;
      let melhorEnvioOptions: any[] = [];

      // Juma only for Anápolis
      if (isAnapolis) {
        try {
          const { data, error } = await supabase.functions.invoke("juma-quote", {
            body: {
              address: {
                street: viaCepData.logradouro || "",
                number: "S/N",
                neighborhood: viaCepData.bairro || "",
                city: viaCepData.localidade || "",
                state: viaCepData.uf || "",
              },
            },
          });

          if (!error && data?.success) {
            jumaOption = {
              price: data.cost,
              duration: data.durationInfo || "~30 min",
              distance: data.distanceInfo || "",
            };
          }
        } catch (e) {
          console.error("Juma quote error:", e);
        }
      }

      // Melhor Envio via backend
      let melhorEnvioBlocked = false;
      let melhorEnvioFailed = false;
      try {
        const { data: meData, error: meError } = await supabase.functions.invoke("melhor-envio-quote", {
          body: {
            destCep: cleanCep,
            items: items.map((i) => ({ price: i.price, quantity: i.quantity })),
          },
        });

        if (meError) {
          const message = String(meError.message || "");
          if (message.includes("MELHOR_ENVIO_WAF_BLOCKED")) {
            melhorEnvioBlocked = true;
          } else {
            melhorEnvioFailed = true;
          }
        } else if (meData?.success && meData.options?.length > 0) {
          melhorEnvioOptions = meData.options;
        }
      } catch (e) {
        console.error("Melhor Envio quote error:", e);
        melhorEnvioFailed = true;
      }

      if (!jumaOption && melhorEnvioOptions.length === 0) {
        if (melhorEnvioBlocked) {
          toast.error("Frete nacional indisponível no momento (bloqueio regional do provedor)");
        } else if (melhorEnvioFailed) {
          toast.error("Não foi possível consultar o frete nacional agora");
        } else {
          toast.error("Nenhuma opção de frete disponível para este CEP");
        }
      }

      setShippingOptions({
        juma: jumaOption,
        melhorEnvio: melhorEnvioOptions,
      });
    } catch (error) {
      console.error("Shipping calc error:", error);
      toast.error("Erro ao calcular frete. Tente novamente.");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (user) {
      navigate("/checkout");
    } else {
      toast.info("Faça login para continuar com a compra");
      navigate("/auth", { state: { from: "/checkout" } });
    }
  };

  const handleFavorite = (item: typeof items[0]) => {
    if (!user) {
      toast.info("Faça login para adicionar aos favoritos");
      navigate("/auth", { state: { from: "/carrinho" } });
      return;
    }
    toggleFavorite(item.productId, item.schoolSlug);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background-tertiary">
        <main className="flex-1 pt-[120px]">
          <div className="max-w-4xl mx-auto px-4 py-16 text-center">
            <div className="bg-background-primary rounded-2xl p-12">
              <ShoppingBag className="w-24 h-24 text-gray-200 mx-auto mb-6" />
              <h1 className="font-suisse text-2xl font-medium text-text-primary mb-3">
                Sua sacola está vazia
              </h1>
              <p className="text-text-muted mb-8">
                Adicione produtos para continuar comprando
              </p>
              <Link 
                to="/escolas/colegio-militar"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#2e3091] text-white font-medium rounded-full hover:bg-[#252a7a] transition-colors"
              >
                Ver produtos
              </Link>
            </div>
          </div>
        </main>
        <CheckoutFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-tertiary">
      <main className="flex-1 pt-[100px]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          {/* Header with collapse toggle */}
          <div className="bg-background-primary rounded-2xl p-6 mb-6">
            <button
              onClick={() => setShowProducts(!showProducts)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <h1 className="font-suisse text-xl md:text-2xl font-medium text-text-primary uppercase tracking-wide">
                  MINHA SACOLA
                </h1>
                <span className="text-text-muted text-lg">({itemCount} {itemCount === 1 ? "ITEM" : "ITENS"})</span>
              </div>
              {showProducts ? (
                <ChevronUp className="w-6 h-6 text-text-muted" />
              ) : (
                <ChevronDown className="w-6 h-6 text-text-muted" />
              )}
            </button>

            {/* Collapsible Products Section */}
            <AnimatePresence>
              {showProducts && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-0 divide-y divide-border-light mt-6">
                    {items.map((item) => (
                      <div
                        key={`${item.productId}-${item.size}`}
                        className="py-6 first:pt-0"
                      >
                        <div className="flex gap-4 md:gap-6">
                          {/* Product Image */}
                          <Link 
                            to={`/escolas/${item.schoolSlug}/produto${item.productId}`}
                            className="flex-shrink-0"
                          >
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-[100px] h-[130px] md:w-[140px] md:h-[180px] object-cover bg-background-secondary"
                            />
                          </Link>

                          {/* Product Details */}
                          <div className="flex-1 flex flex-col">
                            <div className="flex-1">
                              <Link to={`/escolas/${item.schoolSlug}/produto${item.productId}`}>
                                <h3 className="font-suisse text-sm md:text-base font-medium text-text-primary mb-1 hover:underline">
                                  {item.productName}
                                </h3>
                              </Link>
                              <p className="font-suisse text-base md:text-lg font-semibold text-text-primary mb-1">
                                R$ {item.price.toFixed(2).replace(".", ",")}
                              </p>
                              
                              {/* Embroidery Info */}
                              {item.embroideryName && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3">
                                  <p className="text-xs text-amber-800">
                                    <strong>Bordado:</strong> {item.embroideryName}
                                  </p>
                                  <p className="text-xs text-amber-600">
                                    + R$ {(item.embroideryPrice || 0).toFixed(2).replace(".", ",")}
                                  </p>
                                </div>
                              )}

                              {/* Size Selector */}
                              <div className="flex items-center gap-3 mb-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border-light rounded-md text-sm">
                                  <span className="text-text-muted">Tam:</span>
                                  <span className="font-medium">{item.size}</span>
                                </div>

                                {/* Quantity Controls */}
                                <div className="inline-flex items-center gap-3 border border-border-light rounded-md">
                                  <button 
                                    onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                                    className="p-2 hover:bg-background-secondary transition-colors"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-6 text-center font-medium">{item.quantity}</span>
                                  <button 
                                    onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                                    className="p-2 hover:bg-background-secondary transition-colors"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Item Total - Desktop */}
                            <div className="hidden md:block text-right">
                              <span className="font-suisse text-lg font-semibold text-text-primary">
                                R$ {((item.price + (item.embroideryPrice || 0)) * item.quantity).toFixed(2).replace(".", ",")}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-6 text-sm text-text-muted mt-2">
                              <button 
                                onClick={() => removeItem(item.productId, item.size)}
                                className="flex items-center gap-1.5 hover:text-text-primary transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Remover</span>
                              </button>
                              <button 
                                onClick={() => handleFavorite(item)}
                                className={`flex items-center gap-1.5 transition-colors ${
                                  isFavorite(item.productId, item.schoolSlug) 
                                    ? "text-red-500" 
                                    : "hover:text-text-primary"
                                }`}
                              >
                                <Heart className={`w-4 h-4 ${isFavorite(item.productId, item.schoolSlug) ? "fill-current" : ""}`} />
                                <span>Favoritar</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:flex lg:gap-6">
            {/* Left Column - Shipping Calculator */}
            <div className="lg:flex-1">
              <div className="bg-background-primary rounded-2xl p-6 mb-6">
                <h3 className="font-suisse text-sm font-medium text-text-primary mb-4">Calcular frete:</h3>
                
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => setCep(formatCEP(e.target.value))}
                    placeholder="Insira seu CEP"
                    maxLength={9}
                    className="flex-1 px-4 py-3 border border-border-light rounded-md text-sm focus:outline-none focus:border-[#2e3091] bg-background-primary"
                  />
                  <button
                    onClick={calculateShipping}
                    disabled={isCalculating}
                    className="px-6 py-3 bg-[#2e3091] text-white text-sm font-medium rounded-md hover:bg-[#252a7a] transition-colors disabled:opacity-50"
                  >
                    {isCalculating ? "..." : "Consultar"}
                  </button>
                </div>

                <button className="text-body-sm text-text-primary underline mb-4">
                  Não sei meu CEP
                </button>

                {/* Shipping Options */}
                {shippingOptions && (
                  <div className="space-y-3 pt-4 border-t border-border-light">
                    {shippingOptions.juma && (
                      <button
                        onClick={() => setSelectedShipping("juma")}
                        className={`w-full flex items-center gap-4 p-4 border rounded-lg transition-all ${
                          selectedShipping === "juma" 
                            ? "border-[#2e3091] bg-[#2e3091]/5" 
                            : "border-border-light hover:border-text-muted"
                        }`}
                      >
                        <Zap className="w-5 h-5 text-amber-500" />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-sm text-text-primary">ENTREGA RÁPIDA (Juma)</p>
                          <p className="text-xs text-text-muted">
                            {shippingOptions.juma.duration} • {shippingOptions.juma.distance}
                          </p>
                        </div>
                        <span className="font-semibold text-sm text-text-primary">
                          R$ {shippingOptions.juma.price.toFixed(2).replace(".", ",")}
                        </span>
                      </button>
                    )}

                    {shippingOptions.melhorEnvio.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSelectedShipping(`me-${option.id}`)}
                        className={`w-full flex items-center gap-4 p-4 border rounded-lg transition-all ${
                          selectedShipping === `me-${option.id}` 
                            ? "border-[#2e3091] bg-[#2e3091]/5" 
                            : "border-border-light hover:border-text-muted"
                        }`}
                      >
                        {option.companyLogo ? (
                          <img src={option.companyLogo} alt={option.company} className="w-8 h-8 object-contain rounded" />
                        ) : (
                          <Truck className="w-5 h-5 text-text-muted" />
                        )}
                        <div className="flex-1 text-left">
                          <p className="font-medium text-sm text-text-primary">{option.company} - {option.name}</p>
                          <p className="text-xs text-text-muted">
                            {option.deliveryRange 
                              ? `${option.deliveryRange.min}-${option.deliveryRange.max} dias úteis`
                              : `${option.deliveryDays} dias úteis`
                            }
                          </p>
                        </div>
                        <span className="font-semibold text-sm text-text-primary">
                          R$ {option.price.toFixed(2).replace(".", ",")}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:w-[380px]">
              <div className="bg-background-primary rounded-2xl p-6 lg:sticky lg:top-[120px]">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Subtotal</span>
                    <span className="font-medium text-text-primary">R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                  </div>
                  {selectedShipping && (
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">Frete</span>
                      <span className="font-medium text-text-primary">R$ {shipping.toFixed(2).replace(".", ",")}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-border-light mb-6">
                  <span className="font-suisse text-lg font-semibold text-text-primary">Total</span>
                  <div className="text-right">
                    <span className="font-suisse text-xl font-bold text-text-primary">
                      R$ {total.toFixed(2).replace(".", ",")}
                    </span>
                    <p className="text-xs text-text-muted">
                      Em até 3x de R$ {(total / 3).toFixed(2).replace(".", ",")} s/ juros
                    </p>
                  </div>
                </div>

                {/* Checkout Button - Blue */}
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-4 bg-[#2e3091] text-white font-medium uppercase tracking-wide rounded-full hover:bg-[#252a7a] transition-colors"
                >
                  CONCLUIR COMPRA
                </button>

                {/* Continue Shopping */}
                <Link
                  to="/escolas/colegio-militar"
                  className="block w-full text-center py-3 text-sm font-medium text-text-primary underline underline-offset-4 mt-3 hover:text-text-secondary transition-colors"
                >
                  ADICIONAR MAIS ITENS
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <CheckoutFooter />
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, Heart, Plus, Minus, ArrowLeft, ShoppingBag, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function CarrinhoPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, subtotal, itemCount } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { user } = useAuth();
  
  const [cep, setCep] = useState("");
  const [shippingOptions, setShippingOptions] = useState<{
    economico: { price: number; date: string } | null;
    expresso: { price: number; date: string } | null;
  } | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<"economico" | "expresso" | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const shipping = selectedShipping === "expresso" ? 26.90 : selectedShipping === "economico" ? 13.90 : 0;
  const total = subtotal + shipping;

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{3})/, "$1-$2");
    }
    return value;
  };

  const calculateShipping = () => {
    if (cep.replace(/\D/g, "").length !== 8) {
      toast.error("Digite um CEP válido");
      return;
    }

    setIsCalculating(true);
    
    // Simula cálculo de frete
    setTimeout(() => {
      const today = new Date();
      const economicoDate = new Date(today);
      economicoDate.setDate(today.getDate() + 10);
      const expressoDate = new Date(today);
      expressoDate.setDate(today.getDate() + 5);
      
      setShippingOptions({
        economico: {
          price: 13.90,
          date: economicoDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
        },
        expresso: {
          price: 26.90,
          date: expressoDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
        }
      });
      setIsCalculating(false);
    }, 800);
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
      <main className="min-h-screen bg-white pt-[120px]">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-24 h-24 text-gray-200 mx-auto mb-6" />
          <h1 className="font-suisse text-2xl font-medium text-gray-900 mb-3">
            Sua sacola está vazia
          </h1>
          <p className="text-gray-500 mb-8">
            Adicione produtos para continuar comprando
          </p>
          <Link 
            to="/escolas/colegio-militar"
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            Ver produtos
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-[100px]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <h1 className="font-suisse text-xl md:text-2xl font-medium text-black uppercase tracking-wide">
            MINHA SACOLA
          </h1>
          <span className="text-gray-500 text-lg">({itemCount} {itemCount === 1 ? "ITEM" : "ITENS"})</span>
        </div>

        <div className="lg:flex lg:gap-12">
          {/* Left Column - Cart Items */}
          <div className="lg:flex-1">
            <div className="space-y-0 divide-y divide-gray-100">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={`${item.productId}-${item.size}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
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
                          className="w-[100px] h-[130px] md:w-[140px] md:h-[180px] object-cover bg-gray-50"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 flex flex-col">
                        <div className="flex-1">
                          <Link to={`/escolas/${item.schoolSlug}/produto${item.productId}`}>
                            <h3 className="font-suisse text-sm md:text-base font-medium text-black mb-1 hover:underline">
                              {item.productName}
                            </h3>
                          </Link>
                          <p className="font-suisse text-base md:text-lg font-semibold text-black mb-3">
                            R$ {item.price.toFixed(2).replace(".", ",")}
                          </p>

                          {/* Size Selector */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-md text-sm">
                              <span className="text-gray-500">Tam:</span>
                              <span className="font-medium">{item.size}</span>
                            </div>

                            {/* Quantity Controls */}
                            <div className="inline-flex items-center gap-3 border border-gray-200 rounded-md">
                              <button 
                                onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                                className="p-2 hover:bg-gray-50 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center font-medium">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                                className="p-2 hover:bg-gray-50 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Item Total - Desktop */}
                        <div className="hidden md:block text-right">
                          <span className="font-suisse text-lg font-semibold text-black">
                            R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-6 text-sm text-gray-600 mt-2">
                          <button 
                            onClick={() => removeItem(item.productId, item.size)}
                            className="flex items-center gap-1.5 hover:text-black transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Remover</span>
                          </button>
                          <button 
                            onClick={() => handleFavorite(item)}
                            className={`flex items-center gap-1.5 transition-colors ${
                              isFavorite(item.productId, item.schoolSlug) 
                                ? "text-red-500" 
                                : "hover:text-black"
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${isFavorite(item.productId, item.schoolSlug) ? "fill-current" : ""}`} />
                            <span>Favoritar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:w-[380px] mt-8 lg:mt-0">
            <div className="lg:sticky lg:top-[120px] space-y-6">
              {/* Shipping Calculator */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-suisse text-sm font-medium text-black mb-4">Calcular frete:</h3>
                
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={cep}
                    onChange={(e) => setCep(formatCEP(e.target.value))}
                    placeholder="00000-000"
                    maxLength={9}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#2e3091]"
                  />
                  <button
                    onClick={calculateShipping}
                    disabled={isCalculating}
                    className="px-6 py-3 bg-[#2e3091] text-white text-sm font-medium rounded-md hover:bg-[#252a7a] transition-colors disabled:opacity-50"
                  >
                    {isCalculating ? "..." : "Consultar"}
                  </button>
                </div>

                {/* Shipping Options */}
                {shippingOptions && (
                  <div className="space-y-3">
                    <button
                      onClick={() => setSelectedShipping("economico")}
                      className={`w-full flex items-center gap-4 p-4 border rounded-lg transition-all ${
                        selectedShipping === "economico" 
                          ? "border-[#2e3091] bg-[#2e3091]/5" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Truck className="w-5 h-5 text-gray-400" />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm text-black">ECONÔMICO</p>
                        <p className="text-xs text-gray-500">Receba até {shippingOptions.economico?.date}</p>
                      </div>
                      <span className="font-semibold text-sm text-black">
                        R$ {shippingOptions.economico?.price.toFixed(2).replace(".", ",")}
                      </span>
                    </button>

                    <button
                      onClick={() => setSelectedShipping("expresso")}
                      className={`w-full flex items-center gap-4 p-4 border rounded-lg transition-all ${
                        selectedShipping === "expresso" 
                          ? "border-[#2e3091] bg-[#2e3091]/5" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Truck className="w-5 h-5 text-gray-400" />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm text-black">EXPRESSO</p>
                        <p className="text-xs text-gray-500">Receba até {shippingOptions.expresso?.date}</p>
                      </div>
                      <span className="font-semibold text-sm text-black">
                        R$ {shippingOptions.expresso?.price.toFixed(2).replace(".", ",")}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-black">R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                  </div>
                  {selectedShipping && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Frete</span>
                      <span className="font-medium text-black">R$ {shipping.toFixed(2).replace(".", ",")}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 mb-6">
                  <span className="font-suisse text-lg font-semibold text-black">Total</span>
                  <div className="text-right">
                    <span className="font-suisse text-xl font-bold text-black">
                      R$ {total.toFixed(2).replace(".", ",")}
                    </span>
                    <p className="text-xs text-gray-500">
                      Em até 3x de R$ {(total / 3).toFixed(2).replace(".", ",")} s/ juros
                    </p>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-4 bg-black text-white font-medium uppercase tracking-wide rounded-full hover:bg-gray-800 transition-colors"
                >
                  CONCLUIR COMPRA
                </button>

                {/* Continue Shopping */}
                <Link
                  to="/escolas/colegio-militar"
                  className="block w-full text-center py-3 text-sm font-medium text-[#2e3091] underline underline-offset-4 mt-3 hover:text-[#252a7a] transition-colors"
                >
                  ADICIONAR MAIS ITENS
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

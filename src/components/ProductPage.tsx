import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/sections/footer";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { LoginRequiredModal } from "@/components/LoginRequiredModal";
import { toast } from "sonner";
import ectomorphImg from "@/assets/body-types/ectomorph.png";
import mesomorphImg from "@/assets/body-types/mesomorph.png";
import endomorphImg from "@/assets/body-types/endomorph.png";
interface ProductPageProps {
  schoolName: string;
  productName: string;
  productDescription: string;
  price: string;
  images: string[];
  sizes?: string[];
  productId?: number;
}

export default function ProductPage({
  schoolName,
  productName,
  productDescription,
  price,
  images,
  sizes = ["PP", "P", "M", "G", "GG"],
  productId = 1,
}: ProductPageProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [openFitFinder, setOpenFitFinder] = useState(false);
  const [fitStep, setFitStep] = useState(1);
  const [altura, setAltura] = useState(175);
  const [peso, setPeso] = useState(74);
  const [sexo, setSexo] = useState<"m" | "f" | null>(null);
  const [caimento, setCaimento] = useState<"justo" | "regular" | "oversize" | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const schoolSlug = "colegio-militar";
  const isFav = isFavorite(productId, schoolSlug);

  const handleFavorite = async () => {
    const success = await toggleFavorite(productId, schoolSlug);
    if (!success) {
      setShowLoginModal(true);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Selecione um tamanho");
      return;
    }
    const priceNum = parseFloat(price.replace("R$ ", "").replace(".", "").replace(",", "."));
    addItem({
      productId,
      productName,
      productImage: images[0],
      price: priceNum,
      size: selectedSize,
      quantity: 1,
      schoolSlug,
    });
  };

  const computeRecommendedSize = (): string => {
    const h = altura / 100;
    const bmi = peso / (h * h);
    const adjust = sexo === "f" ? -0.2 : 0;
    const score = bmi + adjust;
    if (score < 20) return "P";
    if (score < 24.5) return "M";
    if (score < 29) return "G";
    return "GG";
  };

  const recommended = computeRecommendedSize();
  const nextImage = () => setActiveIndex((s) => (s + 1) % images.length);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Voltar */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#2e3091] hover:text-[#252a7a] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-body-regular font-medium">Voltar</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* ===== GALERIA ===== */}
          <div className="space-y-4">
            {/* Mobile Gallery - infinite scroll style, no borders */}
            <div className="md:hidden relative w-full aspect-[3/4] bg-white overflow-hidden">
              <div
                className="w-full h-full relative touch-pan-x"
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  (e.currentTarget as any)._touchStartX = touch.clientX;
                }}
                onTouchEnd={(e) => {
                  const startX = (e.currentTarget as any)._touchStartX || 0;
                  const endX = e.changedTouches[0].clientX;
                  const diff = startX - endX;
                  if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                      setActiveIndex((prev) => (prev + 1) % images.length);
                    } else {
                      setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
                    }
                  }
                }}
              >
                {images.map((img, i) => (
                  <img
                    key={img + i}
                    src={img}
                    alt={`${productName} - ${i + 1}`}
                    className={`w-full h-full object-cover absolute inset-0 transition-all duration-300 ${
                      i === activeIndex
                        ? "translate-x-0 opacity-100"
                        : i < activeIndex
                        ? "-translate-x-full opacity-0"
                        : "translate-x-full opacity-0"
                    }`}
                    draggable={false}
                  />
                ))}
              </div>
              
              {/* Mobile indicators - minimalist lines */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      className={`h-[2px] rounded-full transition-all ${
                        i === activeIndex
                          ? "bg-[#2e3091] w-6"
                          : "bg-gray-300 w-4"
                      }`}
                      aria-label={`Ir para imagem ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Gallery - with thumbnails */}
            <div className="hidden md:block">
              <div
                className="relative w-full aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden cursor-pointer border border-gray-100"
                onClick={nextImage}
                role="button"
                aria-label="Avançar imagem"
              >
                <img
                  src={images[activeIndex]}
                  alt="Imagem principal do produto"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                {images.map((img, i) => (
                  <div
                    key={img + i}
                    onClick={() => setActiveIndex(i)}
                    className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all ${
                      activeIndex === i
                        ? "scale-105 ring-2 ring-[#2e3091]"
                        : "hover:scale-[1.03] border border-gray-100"
                    }`}
                    role="button"
                    aria-label={`Mostrar imagem ${i + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Imagem ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ===== INFORMAÇÕES ===== */}
          <div className="flex flex-col">
            <span className="uppercase text-xs tracking-widest text-[#2e3091] mb-2 font-medium">
              {schoolName}
            </span>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">
              {productName}
            </h1>
            <p className="mt-4 text-xl font-bold text-gray-900">{price}</p>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              {productDescription}
            </p>

            {/* ===== TAMANHOS ===== */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Escolha o tamanho
                </span>
                <button
                  onClick={() => {
                    setOpenFitFinder(true);
                    setFitStep(1);
                  }}
                  className="text-sm text-[#2e3091] underline font-medium hover:text-[#252a7a]"
                >
                  Qual meu tamanho ideal?
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((size) => {
                  const selected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-md text-sm transition-all ${
                        selected
                          ? "bg-[#2e3091] text-white font-semibold shadow-md"
                          : "bg-white text-gray-800 border border-gray-200 hover:shadow-md hover:border-[#2e3091]"
                      }`}
                      aria-pressed={selected}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {/* Botões de ação */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    if (!selectedSize) {
                      toast.error("Selecione um tamanho");
                      return;
                    }
                    const priceNum = parseFloat(price.replace("R$ ", "").replace(".", "").replace(",", "."));
                    addItem({
                      productId,
                      productName,
                      productImage: images[0],
                      price: priceNum,
                      size: selectedSize,
                      quantity: 1,
                      schoolSlug,
                    });
                    navigate("/checkout");
                  }}
                  className="flex-1 bg-[#2e3091] text-white py-3 px-6 rounded-lg text-sm font-semibold hover:bg-[#252a7a] hover:shadow-lg transition-all"
                >
                  Comprar Agora
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 border-2 border-[#2e3091] text-[#2e3091] py-3 px-6 rounded-lg text-sm font-semibold hover:bg-[#2e3091] hover:text-white transition-all"
                >
                  Adicionar ao carrinho
                </button>
              </div>

              {/* Favoritar */}
              <button
                onClick={handleFavorite}
                className="mt-4 flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition-colors"
              >
                <Heart className={`w-5 h-5 ${isFav ? "fill-red-500 text-red-500" : ""}`} />
                {isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              </button>
            </div>

            <div className="mt-6 text-sm text-gray-500 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              Frete grátis a partir de R$ 200 · Troca ou devolução grátis
            </div>
          </div>
        </div>
      </div>

      {/* =========================
         FIT FINDER (PAINEL LATERAL)
      ========================= */}
      <AnimatePresence>
        {openFitFinder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.36 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setOpenFitFinder(false)}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.38, ease: "easeInOut" }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 p-6 flex flex-col shadow-2xl overflow-y-auto"
              role="dialog"
              aria-modal="true"
            >
              {/* Progresso */}
              <div className="h-1 w-full bg-gray-100 rounded mb-6 overflow-hidden">
                <div
                  className="h-full bg-[#2e3091] transition-all"
                  style={{ width: `${(fitStep / 3) * 100}%` }}
                />
              </div>

              {/* ETAPA 1: perfil (altura, peso, sexo) */}
              {fitStep === 1 && (
                <div className="flex flex-col gap-6 flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Seu perfil
                  </h2>
                  <div>
                    <label className="text-sm block mb-2 text-gray-700">
                      Altura:{" "}
                      <span className="font-medium text-gray-900">
                        {altura} cm
                      </span>
                    </label>
                    <input
                      type="range"
                      min={150}
                      max={200}
                      value={altura}
                      onChange={(e) => setAltura(Number(e.target.value))}
                      className="w-full accent-[#2e3091]"
                    />
                  </div>
                  <div>
                    <label className="text-sm block mb-2 text-gray-700">
                      Peso:{" "}
                      <span className="font-medium text-gray-900">
                        {peso} kg
                      </span>
                    </label>
                    <input
                      type="range"
                      min={45}
                      max={140}
                      value={peso}
                      onChange={(e) => setPeso(Number(e.target.value))}
                      className="w-full accent-[#2e3091]"
                    />
                  </div>
                  
                  {/* Sexo - Apenas texto Homem/Mulher */}
                  <div>
                    <label className="text-sm block mb-3 text-gray-700">
                      Gênero
                    </label>
                    <div className="flex gap-4 justify-center">
                      <button
                        onClick={() => setSexo("m")}
                        className={`flex items-center justify-center px-8 py-4 border-2 rounded-xl transition text-base font-medium ${
                          sexo === "m"
                            ? "border-[#2e3091] bg-blue-50 text-[#2e3091]"
                            : "border-gray-200 hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        Homem
                      </button>
                      <button
                        onClick={() => setSexo("f")}
                        className={`flex items-center justify-center px-8 py-4 border-2 rounded-xl transition text-base font-medium ${
                          sexo === "f"
                            ? "border-[#2e3091] bg-blue-50 text-[#2e3091]"
                            : "border-gray-200 hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        Mulher
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button
                      onClick={() => setOpenFitFinder(false)}
                      className="flex-1 border border-gray-200 py-3 rounded-lg text-sm hover:shadow-sm text-gray-700"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => setFitStep(2)}
                      disabled={!sexo}
                      className="flex-1 bg-[#2e3091] text-white py-3 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-[#252a7a] hover:shadow-lg transition-all"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {/* ETAPA 2: Tipo de corpo */}
              {fitStep === 2 && (
                <div className="flex flex-col gap-6 flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Qual seu tipo de corpo?
                  </h2>
                  
                  {/* Mensagem de atenção */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
                    <span className="text-amber-500 text-lg flex-shrink-0">⚠️</span>
                    <p className="text-sm text-amber-800">
                      <strong>Atenção:</strong> escolha de acordo com a imagem que mais se parece com o seu corpo atual.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {/* Ectomorfo */}
                    <button
                      onClick={() => setCaimento("justo")}
                      className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition aspect-square ${
                        caimento === "justo"
                          ? "border-[#2e3091] bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <img 
                        src={ectomorphImg} 
                        alt="Ectomorfo" 
                        className="w-12 h-20 object-contain mb-2"
                      />
                      <span className={`text-xs font-medium ${caimento === "justo" ? "text-[#2e3091]" : "text-gray-600"}`}>
                        Ectomorfo
                      </span>
                    </button>

                    {/* Mesomorfo */}
                    <button
                      onClick={() => setCaimento("regular")}
                      className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition aspect-square ${
                        caimento === "regular"
                          ? "border-[#2e3091] bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <img 
                        src={mesomorphImg} 
                        alt="Mesomorfo" 
                        className="w-12 h-20 object-contain mb-2"
                      />
                      <span className={`text-xs font-medium ${caimento === "regular" ? "text-[#2e3091]" : "text-gray-600"}`}>
                        Mesomorfo
                      </span>
                    </button>

                    {/* Endomorfo */}
                    <button
                      onClick={() => setCaimento("oversize")}
                      className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition aspect-square ${
                        caimento === "oversize"
                          ? "border-[#2e3091] bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <img 
                        src={endomorphImg} 
                        alt="Endomorfo" 
                        className="w-12 h-20 object-contain mb-2"
                      />
                      <span className={`text-xs font-medium ${caimento === "oversize" ? "text-[#2e3091]" : "text-gray-600"}`}>
                        Endomorfo
                      </span>
                    </button>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button
                      onClick={() => setFitStep(1)}
                      className="flex-1 border border-gray-200 py-3 rounded-lg text-sm hover:shadow-sm text-gray-700"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={() => setFitStep(3)}
                      disabled={!caimento}
                      className="flex-1 bg-[#2e3091] text-white py-3 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-[#252a7a] hover:shadow-lg transition-all"
                    >
                      Ver resultado
                    </button>
                  </div>
                </div>
              )}

              {/* ETAPA 3: Resultado Premium */}
              {fitStep === 3 && (
                <div className="flex flex-col gap-4 flex-1">
                  {/* Card de resultado premium */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-bold text-green-700 uppercase tracking-wider">
                        Resultado Premium
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Caimento ideal identificado
                    </h3>
                    
                    <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Tamanho recomendado:</p>
                      <p className="text-3xl font-bold text-[#2e3091]">{recommended}</p>
                    </div>
                    
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Desenvolvido para sua altura e proporção corporal.
                    </p>
                  </div>

                  {/* Observação de alerta */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-amber-500 text-lg">⚠️</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-800">Observação</p>
                      <p className="text-sm text-amber-700 mt-1">
                        O tamanho G pode ficar desajustado ao seu corpo!
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button
                      onClick={() => setFitStep(2)}
                      className="flex-1 border border-gray-200 py-3 rounded-lg text-sm hover:shadow-sm text-gray-700"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSize(recommended);
                        setOpenFitFinder(false);
                      }}
                      className="flex-1 bg-[#2e3091] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#252a7a] hover:shadow-lg transition-all"
                    >
                      Usar tamanho {recommended}
                    </button>
                  </div>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <LoginRequiredModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />

      <Footer />
    </main>
  );
}

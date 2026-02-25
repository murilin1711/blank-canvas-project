import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/sections/footer";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { LoginRequiredModal } from "@/components/LoginRequiredModal";
import { toast } from "sonner";
import SimilarProducts from "@/components/sections/SimilarProducts";
import { getOptimizedImageUrl } from "@/lib/utils";
import ectomorphImg from "@/assets/body-types/ectomorph.png";
import mesomorphImg from "@/assets/body-types/mesomorph.png";
import endomorphImg from "@/assets/body-types/endomorph.png";

// Tipos para variação com preço
interface VariationOption {
  value: string;
  price: number | null;
  image?: string | null; // URL da foto associada (opcional)
}

interface Variation {
  id: string;
  name: string;
  options: (string | VariationOption)[];
}

interface ProductPageProps {
  schoolName: string;
  productName: string;
  productDescription: string;
  price: string;
  images: string[];
  sizes?: string[];
  productId?: number;
  similarProductIds?: number[];
  variations?: Variation[];
  basePrice?: number;
  allowsEmbroidery?: boolean;
}

const EMBROIDERY_PRICE = 15.00;

export default function ProductPage({
  schoolName,
  productName,
  productDescription,
  price,
  images,
  sizes = ["PP", "P", "M", "G", "GG"],
  productId = 1,
  similarProductIds = [],
  variations = [],
  basePrice,
  allowsEmbroidery = false,
}: ProductPageProps) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [openFitFinder, setOpenFitFinder] = useState(false);

  // Derive selectedSize for backward compat (Fit Finder, etc.)
  const selectedSize = selectedVariations["Tamanho"] || selectedVariations["Tamanhos"] || null;
  const setSelectedSize = (size: string) => {
    // Determine the key used for sizes
    const sizeKey = variations.find(v => v.name.toLowerCase() === 'tamanhos') ? 'Tamanhos' 
      : 'Tamanho';
    setSelectedVariations(prev => ({ ...prev, [sizeKey]: size }));
  };

  // Separate size variation from other variations
  const sizeVariation = variations.find(v => 
    v.name.toLowerCase() === 'tamanho' || v.name.toLowerCase() === 'tamanhos'
  );
  const otherVariations = variations.filter(v => 
    v.name.toLowerCase() !== 'tamanho' && v.name.toLowerCase() !== 'tamanhos'
  );
  const [fitStep, setFitStep] = useState(1);
  const [altura, setAltura] = useState(175);
  const [peso, setPeso] = useState(74);
  const [sexo, setSexo] = useState<"m" | "f" | null>(null);
  const [caimento, setCaimento] = useState<"justo" | "regular" | "oversize" | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Embroidery states
  const [wantsEmbroidery, setWantsEmbroidery] = useState(false);
  const [embroideryName, setEmbroideryName] = useState("");
  const [showEmbroideryConfirm, setShowEmbroideryConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState<"cart" | "buy" | null>(null);

  const schoolSlug = "colegio-militar";
  const isFav = isFavorite(productId, schoolSlug);

  // Helper para extrair valor de opção
  const getOptionValue = (option: string | VariationOption): string => {
    return typeof option === 'string' ? option : option.value;
  };

  // Helper para extrair preço de opção
  const getOptionPrice = (option: string | VariationOption): number | null => {
    return typeof option === 'string' ? null : option.price;
  };

  // Helper para extrair imagem de opção
  const getOptionImage = (option: string | VariationOption): string | null => {
    return typeof option === 'string' ? null : (option.image || null);
  };

  // Calcular preço efetivo baseado na variação selecionada
  const effectivePrice = useMemo(() => {
    const parsedBasePrice = basePrice ?? parseFloat(price.replace("R$ ", "").replace(".", "").replace(",", "."));
    
    if (variations.length === 0) return parsedBasePrice;

    let finalPrice = parsedBasePrice;
    for (const variation of variations) {
      const selectedVal = selectedVariations[variation.name];
      if (!selectedVal) continue;
      const opt = variation.options.find(o => getOptionValue(o) === selectedVal);
      if (opt) {
        const optPrice = getOptionPrice(opt);
        if (optPrice !== null) finalPrice = optPrice;
      }
    }
    return finalPrice;
  }, [selectedVariations, variations, price, basePrice]);

  // Formatar preço para exibição
  const displayPrice = `R$ ${effectivePrice.toFixed(2).replace('.', ',')}`;

  const handleFavorite = async () => {
    const success = await toggleFavorite(productId, schoolSlug);
    if (!success) {
      setShowLoginModal(true);
    }
  };

  // Validate embroidery name (max 3 names)
  const validateEmbroideryName = (name: string): boolean => {
    const words = name.trim().split(/\s+/).filter(w => w.length > 0);
    return words.length <= 3 && words.length > 0;
  };

  // Build composite size label for cart
  const buildSizeLabel = (): string => {
    const parts: string[] = [];
    if (selectedSize) parts.push(selectedSize);
    otherVariations.forEach(v => {
      const sel = selectedVariations[v.name];
      if (sel) parts.push(`${v.name}: ${sel}`);
    });
    return parts.join(" | ") || "";
  };

  const handleAddToCart = (goToCheckout: boolean = false) => {
    if (sizes && sizes.length > 0 && !selectedSize) {
      toast.error("Selecione um tamanho");
      return;
    }
    // Validate other variations
    for (const v of otherVariations) {
      if (!selectedVariations[v.name]) {
        toast.error(`Selecione: ${v.name}`);
        return;
      }
    }
    
    const sizeLabel = buildSizeLabel();
    
    // If embroidery is enabled and user wants it, validate and confirm
    if (allowsEmbroidery && wantsEmbroidery) {
      if (!embroideryName.trim()) {
        toast.error("Digite o nome para bordado");
        return;
      }
      if (!validateEmbroideryName(embroideryName)) {
        toast.error("O nome pode ter no máximo 3 palavras");
        return;
      }
      setPendingAction(goToCheckout ? "buy" : "cart");
      setShowEmbroideryConfirm(true);
      return;
    }
    
    // Add to cart without embroidery
    addItem({
      productId,
      productName,
      productImage: images[0],
      price: effectivePrice,
      size: sizeLabel,
      quantity: 1,
      schoolSlug,
    });
    
    if (goToCheckout) {
      navigate("/checkout");
    }
  };

  const confirmEmbroideryAndAdd = () => {
    if (!selectedSize) return;
    
    const sizeLabel = buildSizeLabel();
    
    addItem({
      productId,
      productName,
      productImage: images[0],
      price: effectivePrice,
      size: sizeLabel,
      quantity: 1,
      schoolSlug,
      embroideryName: embroideryName.trim(),
      embroideryPrice: EMBROIDERY_PRICE,
    });
    
    setShowEmbroideryConfirm(false);
    
    if (pendingAction === "buy") {
      navigate("/checkout");
    }
    
    setPendingAction(null);
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
  const prevImage = () => setActiveIndex((s) => (s - 1 + images.length) % images.length);

  // Touch swipe refs
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchDirection = useRef<'horizontal' | 'vertical' | null>(null);
  const swipeDirection = useRef<'left' | 'right'>('left');
  const swiped = useRef(false);
  const swipeLocked = useRef(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Native touch event listeners with passive: false so preventDefault() works
  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchDirection.current = null;
      swiped.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchDirection.current === 'vertical' || swiped.current) return;
      const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
      const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
      if (!touchDirection.current && (dx > 10 || dy > 10)) {
        touchDirection.current = dx > dy ? 'horizontal' : 'vertical';
      }
      if (touchDirection.current === 'horizontal') {
        e.preventDefault();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (touchDirection.current !== 'horizontal' || swiped.current || swipeLocked.current) return;
      const diff = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 60) {
        swiped.current = true;
        swipeLocked.current = true;
        setTimeout(() => { swipeLocked.current = false; }, 400);
        if (diff > 0) {
          swipeDirection.current = 'left';
          setActiveIndex((prev) => (prev + 1) % images.length);
        } else {
          swipeDirection.current = 'right';
          setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
        }
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [images.length]);

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
                ref={galleryRef}
                className="w-full h-full relative"
                style={{ touchAction: 'pan-y' }}
              >
                {images.map((img, i) => {
                  const isNear = i === activeIndex || i === activeIndex - 1 || i === activeIndex + 1 ||
                    (activeIndex === 0 && i === images.length - 1) ||
                    (activeIndex === images.length - 1 && i === 0);
                  if (!isNear) return <div key={img + i} className="absolute inset-0" />;
                  
                  let translateClass = "translate-x-0 opacity-100";
                  if (i !== activeIndex) {
                    // Determine position based on swipe direction for smooth animation
                    const isNext = (i === (activeIndex + 1) % images.length) || 
                                   (activeIndex === images.length - 1 && i === 0);
                    const isPrev = (i === (activeIndex - 1 + images.length) % images.length) ||
                                   (activeIndex === 0 && i === images.length - 1);
                    if (isNext) translateClass = "translate-x-full opacity-0";
                    else if (isPrev) translateClass = "-translate-x-full opacity-0";
                    else translateClass = swipeDirection.current === 'left' ? "translate-x-full opacity-0" : "-translate-x-full opacity-0";
                  }
                  
                  return (
                  <img
                    key={img + i}
                    src={getOptimizedImageUrl(img, 750)}
                    alt={`${productName} - ${i + 1}`}
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : "low"}
                    decoding={i === 0 ? "sync" : "async"}
                    className={`w-full h-full object-cover absolute inset-0 transition-all duration-300 ${translateClass}`}
                    draggable={false}
                  />
                  );
                })}
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
                className="relative w-full aspect-[3/4] bg-gray-50 rounded-2xl overflow-hidden group border border-gray-100"
              >
                <img
                  src={getOptimizedImageUrl(images[activeIndex], 800)}
                  alt="Imagem principal do produto"
                  className="w-full h-full object-cover"
                  fetchPriority="high"
                  decoding="sync"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-md"
                      aria-label="Imagem anterior"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-md"
                      aria-label="Próxima imagem"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </>
                )}
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
                      src={getOptimizedImageUrl(img, 200)}
                      alt={`Imagem ${i + 1}`}
                      loading="lazy"
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
            <p className="mt-4 text-xl font-bold text-gray-900">{displayPrice}</p>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              {productDescription}
            </p>

            {/* ===== TAMANHOS ===== */}
            {sizes && sizes.length > 0 && (
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
                  
                  const sizeOption = sizeVariation?.options.find(opt => getOptionValue(opt) === size);
                  const optionImg = sizeOption ? getOptionImage(sizeOption) : null;
                  
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        if (optionImg) {
                          const idx = images.findIndex(img => img === optionImg);
                          if (idx >= 0) setActiveIndex(idx);
                        }
                      }}
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
            </div>
            )}

              {/* ===== OUTRAS VARIAÇÕES ===== */}
              {otherVariations.map((variation) => (
                <div key={variation.id} className="mt-4">
                  <span className="text-sm font-medium text-gray-900 mb-2 block">
                    {variation.name}
                  </span>
                  <div className="flex gap-2 flex-wrap">
                    {variation.options.map((opt) => {
                      const value = getOptionValue(opt);
                      const selected = selectedVariations[variation.name] === value;
                      const optionImg = getOptionImage(opt);
                      return (
                        <button
                          key={value}
                          onClick={() => {
                            setSelectedVariations(prev => ({ ...prev, [variation.name]: value }));
                            if (optionImg) {
                              const idx = images.findIndex(img => img === optionImg);
                              if (idx >= 0) setActiveIndex(idx);
                            }
                          }}
                          className={`px-4 py-2 rounded-md text-sm transition-all ${
                            selected
                              ? "bg-[#2e3091] text-white font-semibold shadow-md"
                              : "bg-white text-gray-800 border border-gray-200 hover:shadow-md hover:border-[#2e3091]"
                          }`}
                          aria-pressed={selected}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Embroidery Section */}
              {allowsEmbroidery && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="font-medium text-gray-900 mb-2">
                    Deseja bordar sua peça com seu nome?
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-amber-800">
                      ⚠️ <strong>Observação:</strong> O cartão Bolsa Uniforme não cobre o bordado. O valor é cobrado à parte.
                    </p>
                  </div>
                  
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => setWantsEmbroidery(false)}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        !wantsEmbroidery
                          ? "bg-[#2e3091] text-white"
                          : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Não, obrigado
                    </button>
                    <button
                      onClick={() => setWantsEmbroidery(true)}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        wantsEmbroidery
                          ? "bg-[#2e3091] text-white"
                          : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      Sim, quero bordar
                    </button>
                  </div>
                  
                  {wantsEmbroidery && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-700 mb-1 block">
                          Nome para bordado (máx. 3 nomes)
                        </label>
                        <input
                          type="text"
                          value={embroideryName}
                          onChange={(e) => setEmbroideryName(e.target.value)}
                          placeholder="Ex: João Pedro Silva"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2e3091]"
                          maxLength={50}
                        />
                      </div>
                      <p className="text-sm text-green-600 font-medium">
                        + R$ {EMBROIDERY_PRICE.toFixed(2).replace('.', ',')} (valor do bordado)
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Botões de ação */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleAddToCart(true)}
                  className="flex-1 bg-[#2e3091] text-white py-3 px-6 rounded-lg text-sm font-semibold hover:bg-[#252a7a] hover:shadow-lg transition-all"
                >
                  Comprar Agora
                </button>
                <button
                  onClick={() => handleAddToCart(false)}
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

      {/* Embroidery Confirmation Modal */}
      <AnimatePresence>
        {showEmbroideryConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50"
              onClick={() => setShowEmbroideryConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">⚠️</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Confirmação de Bordado
                  </h3>
                  <p className="text-gray-600 mb-4">
                    O nome a seguir será bordado na sua peça:
                  </p>
                  <p className="text-2xl font-bold text-[#2e3091] bg-gray-50 py-3 px-4 rounded-lg">
                    "{embroideryName.trim()}"
                  </p>
                  <p className="text-sm text-amber-600 mt-4">
                    Esta ação não pode ser desfeita após a confirmação do pedido.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowEmbroideryConfirm(false);
                      setPendingAction(null);
                    }}
                    className="flex-1 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmEmbroideryAndAdd}
                    className="flex-1 py-3 bg-[#2e3091] text-white rounded-lg font-semibold hover:bg-[#252a7a] transition-colors"
                  >
                    Confirmar Bordado
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Similar Products Section */}
      {similarProductIds.length > 0 && (
        <SimilarProducts
          productIds={similarProductIds}
          schoolSlug={schoolSlug}
          currentProductId={productId}
        />
      )}

      <Footer />
    </main>
  );
}

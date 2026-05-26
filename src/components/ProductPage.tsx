import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { recommendSize, estimateBody, DEFAULT_ADJUSTMENTS, type BodyAdjustments, type FitStatus, type BodyDominance } from "@/lib/sizeFinder";
import { AvatarBody } from "@/components/AvatarBody";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Heart, ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/sections/footer";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { LoginRequiredModal } from "@/components/LoginRequiredModal";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import SimilarProducts from "@/components/sections/SimilarProducts";
import { getOptimizedImageUrl } from "@/lib/utils";
import { ShoeSizeTable } from "@/components/ShoeSizeTable";
import { BoinaSizeTable } from "@/components/BoinaSizeTable";
import maleIconImg from "@/assets/icons/male-icon.png";
import femaleIconImg from "@/assets/icons/female-icon.png";

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
  freeShipping?: boolean;
  showSizeFinder?: boolean;
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
  freeShipping = false,
  showSizeFinder = true,
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
  // Estoque por tamanho
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [stockLoaded, setStockLoaded] = useState(false);

  useEffect(() => {
    if (!productId) { setStockLoaded(true); return; }
    (supabase as any)
      .from("product_stock")
      .select("size, quantity")
      .eq("product_id", productId)
      .then(({ data }: { data: any[] | null }) => {
        if (data) {
          const map: Record<string, number> = {};
          data.forEach((row) => { map[row.size] = row.quantity; });
          setStockMap(map);
        }
        setStockLoaded(true);
      });
  }, [productId]);

  const stockOf = (size: string): number | null =>
    stockLoaded && size in stockMap ? stockMap[size] : null;

  const isOutOfStock = (size: string) => {
    const s = stockOf(size);
    return s !== null && s === 0;
  };

  const isLowStock = (size: string) => {
    const s = stockOf(size);
    return s !== null && s > 0 && s <= 3;
  };

  const [fitStep, setFitStep] = useState(1);
  const [altura, setAltura] = useState(175);
  const [peso, setPeso] = useState(74);
  const [idade, setIdade] = useState(25);
  const [sexo, setSexo] = useState<"m" | "f" | null>(null);
  const [adjustments, setAdjustments] = useState<BodyAdjustments>(DEFAULT_ADJUSTMENTS);
  const [dominance, setDominance] = useState<BodyDominance>("equilibrado");
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
    if (selectedSize && isOutOfStock(selectedSize)) {
      toast.error("Tamanho esgotado");
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
      freeShipping,
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
      freeShipping,
    });
    
    setShowEmbroideryConfirm(false);
    
    if (pendingAction === "buy") {
      navigate("/checkout");
    }
    
    setPendingAction(null);
  };

  const sizeResult = useMemo(
    () => recommendSize(productName, sexo, altura, peso, sizes, adjustments, dominance),
    [productName, sexo, altura, peso, sizes, adjustments, dominance]
  );
  const recommended = sizeResult.primary;
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
                {showSizeFinder && (
                <button
                  onClick={() => {
                    setOpenFitFinder(true);
                    setFitStep(1);
                    setAdjustments(DEFAULT_ADJUSTMENTS);
                  }}
                  className="text-sm text-[#2e3091] underline font-medium hover:text-[#252a7a]"
                >
                  Qual meu tamanho ideal?
                </button>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((size) => {
                  const selected = selectedSize === size;
                  const outOfStock = isOutOfStock(size);
                  const lowStock = isLowStock(size);
                  const sizeOption = sizeVariation?.options.find(opt => getOptionValue(opt) === size);
                  const optionImg = sizeOption ? getOptionImage(sizeOption) : null;

                  return (
                    <div key={size} className="relative">
                      <button
                        onClick={() => {
                          if (outOfStock) return;
                          setSelectedSize(size);
                          if (optionImg) {
                            const idx = images.findIndex(img => img === optionImg);
                            if (idx >= 0) setActiveIndex(idx);
                          }
                        }}
                        disabled={outOfStock}
                        aria-pressed={selected}
                        className={`px-4 py-2 rounded-md text-sm transition-all relative ${
                          outOfStock
                            ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed line-through"
                            : selected
                            ? "bg-[#2e3091] text-white font-semibold shadow-md"
                            : "bg-white text-gray-800 border border-gray-200 hover:shadow-md hover:border-[#2e3091]"
                        }`}
                      >
                        {size}
                      </button>
                      {lowStock && !outOfStock && (
                        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[9px] font-bold px-1 rounded-full leading-4">
                          {stockOf(size)}
                        </span>
                      )}
                    </div>
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

              {/* Tabela de Medidas Condicional */}
              <ShoeSizeTable productName={productName} />
              <BoinaSizeTable productName={productName} />

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

      {/* =========================
         FIT FINDER (PAINEL LATERAL)
      ========================= */}
      <AnimatePresence>
        {showSizeFinder && openFitFinder && (
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
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
              role="dialog"
              aria-modal="true"
            >
              {/* Barra de progresso */}
              <div className="h-1 w-full bg-gray-100 flex-shrink-0">
                <div
                  className="h-full bg-[#2e3091] transition-all duration-500"
                  style={{ width: `${(fitStep / 4) * 100}%` }}
                />
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col">

              {/* ── ETAPA 1: Sexo ── */}
              {fitStep === 1 && (
                <div className="flex flex-col gap-6 flex-1">
                  <div>
                    <p className="text-xs font-semibold text-[#2e3091] uppercase tracking-widest mb-1">
                      Provador Virtual
                    </p>
                    <h2 className="text-xl font-bold text-gray-900">
                      Descubra o tamanho ideal da peça
                    </h2>
                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                      Preencha as informações do Provador Virtual que a gente te ajuda a escolher o melhor tamanho pra você.
                    </p>
                  </div>

                  <div className="flex gap-4 mt-2">
                    <button
                      onClick={() => setSexo("m")}
                      className={`flex-1 flex flex-col items-center gap-3 py-6 border-2 rounded-2xl transition-all ${
                        sexo === "m"
                          ? "border-[#2e3091] bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <img src={maleIconImg} alt="Masculino" className="w-14 h-14 object-contain" />
                      <span className={`text-sm font-semibold ${sexo === "m" ? "text-[#2e3091]" : "text-gray-700"}`}>
                        Masculino
                      </span>
                    </button>
                    <button
                      onClick={() => setSexo("f")}
                      className={`flex-1 flex flex-col items-center gap-3 py-6 border-2 rounded-2xl transition-all ${
                        sexo === "f"
                          ? "border-[#2e3091] bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <img src={femaleIconImg} alt="Feminino" className="w-14 h-14 object-contain" />
                      <span className={`text-sm font-semibold ${sexo === "f" ? "text-[#2e3091]" : "text-gray-700"}`}>
                        Feminino
                      </span>
                    </button>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button
                      onClick={() => setOpenFitFinder(false)}
                      className="flex-1 border border-gray-200 py-3 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => setFitStep(2)}
                      disabled={!sexo}
                      className="flex-1 bg-[#2e3091] text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-40 hover:bg-[#252a7a] transition-all"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}

              {/* ── ETAPA 2: Dados básicos ── */}
              {fitStep === 2 && (
                <div className="flex flex-col gap-6 flex-1">
                  <div>
                    <p className="text-xs font-semibold text-[#2e3091] uppercase tracking-widest mb-1">
                      Etapa 1 de 3
                    </p>
                    <h2 className="text-xl font-bold text-gray-900">Seus dados</h2>
                  </div>

                  {/* Altura */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-3">
                      Altura <span className="text-gray-400 font-normal">— cm</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setAltura(v => Math.max(140, v - 1))}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <div className="flex-1 text-center">
                        <span className="text-3xl font-bold text-[#2e3091]">{altura}</span>
                        <span className="text-sm text-gray-500 ml-1">cm</span>
                      </div>
                      <button
                        onClick={() => setAltura(v => Math.min(210, v + 1))}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <input
                      type="range" min={140} max={210} value={altura}
                      onChange={e => setAltura(Number(e.target.value))}
                      className="w-full accent-[#2e3091] mt-2"
                    />
                  </div>

                  {/* Peso */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-3">
                      Peso <span className="text-gray-400 font-normal">— kg</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setPeso(v => Math.max(40, v - 1))}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <div className="flex-1 text-center">
                        <span className="text-3xl font-bold text-[#2e3091]">{peso}</span>
                        <span className="text-sm text-gray-500 ml-1">kg</span>
                      </div>
                      <button
                        onClick={() => setPeso(v => Math.min(180, v + 1))}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <input
                      type="range" min={40} max={180} value={peso}
                      onChange={e => setPeso(Number(e.target.value))}
                      className="w-full accent-[#2e3091] mt-2"
                    />
                  </div>

                  {/* Idade */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-3">
                      Idade <span className="text-gray-400 font-normal">— anos</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIdade(v => Math.max(10, v - 1))}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <div className="flex-1 text-center">
                        <span className="text-3xl font-bold text-[#2e3091]">{idade}</span>
                        <span className="text-sm text-gray-500 ml-1">anos</span>
                      </div>
                      <button
                        onClick={() => setIdade(v => Math.min(80, v + 1))}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Distribuição corporal */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Onde acumula mais volume?
                    </label>
                    <div className="flex gap-2">
                      {(["tronco", "equilibrado", "inferior"] as BodyDominance[]).map((d) => {
                        const labels: Record<BodyDominance, string> = {
                          tronco: "Parte de cima",
                          equilibrado: "Equilibrado",
                          inferior: "Parte de baixo",
                        };
                        return (
                          <button
                            key={d}
                            onClick={() => setDominance(d)}
                            className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all ${
                              dominance === d
                                ? "border-[#2e3091] bg-blue-50 text-[#2e3091]"
                                : "border-gray-200 text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {labels[d]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button
                      onClick={() => setFitStep(1)}
                      className="flex-1 border border-gray-200 py-3 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={() => {
                        setAdjustments(DEFAULT_ADJUSTMENTS);
                        setFitStep(3);
                      }}
                      className="flex-1 bg-[#2e3091] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#252a7a] transition-all"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}

              {/* ── ETAPA 3: Ajuste Visual Corporal ── */}
              {fitStep === 3 && (() => {
                const body = estimateBody(altura, peso, sexo, adjustments, dominance);
                const isFemale = sexo === "f";
                const toraxLabel = isFemale ? "Busto" : "Tórax";

                type AdjKey = keyof BodyAdjustments;
                const MAX_ADJ = 3;

                const applyClick = (key: AdjKey, delta: 1 | -1) => {
                  setAdjustments(prev => ({
                    ...prev,
                    [key]: Math.max(-MAX_ADJ, Math.min(MAX_ADJ, prev[key] + delta)),
                  }));
                };

                const AdjRow = ({
                  label,
                  measurement,
                  adjKey,
                }: {
                  label: string;
                  measurement: number;
                  adjKey: AdjKey;
                }) => (
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{label}</p>
                      <p className="text-xs text-gray-400">~{Math.round(measurement)} cm</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => applyClick(adjKey, -1)}
                        disabled={adjustments[adjKey] <= -MAX_ADJ}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-colors"
                      >
                        <Minus className="w-3 h-3 text-gray-600" />
                      </button>
                      <span className="w-6 text-center text-xs font-semibold text-gray-600">
                        {adjustments[adjKey] > 0 ? `+${adjustments[adjKey]}` : adjustments[adjKey] === 0 ? "•" : adjustments[adjKey]}
                      </span>
                      <button
                        onClick={() => applyClick(adjKey, 1)}
                        disabled={adjustments[adjKey] >= MAX_ADJ}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-colors"
                      >
                        <Plus className="w-3 h-3 text-gray-600" />
                      </button>
                    </div>
                  </div>
                );

                return (
                  <div className="flex flex-col gap-4 flex-1">
                    <div>
                      <p className="text-xs font-semibold text-[#2e3091] uppercase tracking-widest mb-1">
                        Etapa 2 de 3
                      </p>
                      <h2 className="text-xl font-bold text-gray-900">Ajuste a forma do corpo</h2>
                      <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                        Reconhecemos que o seu corpo possui essas medidas aproximadas. Mas você pode ajustá-las se quiser.
                      </p>
                    </div>

                    {/* Avatar volumétrico */}
                    <div className="bg-gray-50 rounded-2xl p-4">
                      {sexo ? (
                        <AvatarBody
                          altura={altura}
                          peso={peso}
                          sex={sexo}
                          dominance={dominance}
                          adjustments={adjustments}
                        />
                      ) : (
                        <div className="flex gap-4 items-center">
                          <img
                            src={isFemale ? femaleIconImg : maleIconImg}
                            alt=""
                            className="w-16 h-auto object-contain opacity-70"
                          />
                          <div className="text-xs text-gray-600 space-y-1">
                            <p><span className="font-medium text-gray-800">{toraxLabel}:</span> ~{Math.round(body.torax)} cm</p>
                            <p><span className="font-medium text-gray-800">Cintura:</span> ~{Math.round(body.cintura)} cm</p>
                            <p><span className="font-medium text-gray-800">Quadril:</span> ~{Math.round(body.quadril)} cm</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Controles de ajuste */}
                    <div className="bg-white border border-gray-100 rounded-2xl px-4 divide-y divide-gray-100">
                      <AdjRow label={toraxLabel} measurement={body.torax} adjKey="toraxAdj" />
                      <AdjRow label="Cintura" measurement={body.cintura} adjKey="cinturaAdj" />
                      <AdjRow label="Quadril" measurement={body.quadril} adjKey="quadrilAdj" />
                      <AdjRow label="Glúteo" measurement={body.quadril} adjKey="gluteoAdj" />
                      <AdjRow label="Coxa" measurement={body.coxa} adjKey="coxaAdj" />
                    </div>

                    <div className="flex gap-3 mt-auto">
                      <button
                        onClick={() => setFitStep(2)}
                        className="flex-1 border border-gray-200 py-3 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Voltar
                      </button>
                      <button
                        onClick={() => setFitStep(4)}
                        className="flex-1 bg-[#2e3091] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#252a7a] transition-all"
                      >
                        Ver resultado
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* ── ETAPA 4: Resultado ── */}
              {fitStep === 4 && (() => {
                const statusColor: Record<FitStatus, string> = {
                  'ideal':            'bg-green-100 text-green-700 border-green-200',
                  'levemente-justo':  'bg-yellow-100 text-yellow-700 border-yellow-200',
                  'apertado':         'bg-red-100 text-red-700 border-red-200',
                  'levemente-folgado':'bg-gray-100 text-gray-500 border-gray-200',
                  'folgado':          'bg-gray-100 text-gray-400 border-gray-200',
                };
                const statusLabel: Record<FitStatus, string> = {
                  'ideal':            'Ideal',
                  'levemente-justo':  'Levemente justo',
                  'apertado':         'Apertado',
                  'levemente-folgado':'Levemente folgado',
                  'folgado':          'Folgado',
                };

                return (
                  <div className="flex flex-col gap-4 flex-1">
                    <div>
                      <p className="text-xs font-semibold text-[#2e3091] uppercase tracking-widest mb-1">
                        Etapa 3 de 3
                      </p>
                      <h2 className="text-xl font-bold text-gray-900">Seu tamanho ideal</h2>
                    </div>

                    {/* Card principal */}
                    <div className="bg-gradient-to-br from-[#2e3091]/5 to-blue-50 border-2 border-[#2e3091]/20 rounded-2xl p-6 text-center">
                      <p className="text-sm text-gray-500 mb-2">Tamanho recomendado</p>
                      <p className="text-6xl font-black text-[#2e3091] leading-none mb-3">
                        {sizeResult.primary}
                      </p>
                      {sizeResult.bodyMeasurement && (
                        <p className="text-xs text-gray-400">{sizeResult.bodyMeasurement}</p>
                      )}
                    </div>

                    {/* Feedback regional */}
                    {sizeResult.fits && sizeResult.fits.length > 0 && (
                      <div className="bg-white border border-gray-100 rounded-2xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                          Vestibilidade por região
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {sizeResult.fits.map(fit => (
                            <span
                              key={fit.label}
                              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${statusColor[fit.status]}`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 flex-shrink-0" />
                              {fit.label}: {statusLabel[fit.status]}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Legenda */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                        Verde = ideal
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                        Amarelo = levemente justo
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                        Vermelho = apertado
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                        Cinza = folgado
                      </div>
                    </div>

                    <div className="flex gap-3 mt-auto">
                      <button
                        onClick={() => setFitStep(3)}
                        className="flex-1 border border-gray-200 py-3 rounded-xl text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Ajustar
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSize(sizeResult.primary);
                          setOpenFitFinder(false);
                        }}
                        className="flex-1 bg-[#2e3091] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#252a7a] transition-all"
                      >
                        Usar tamanho {sizeResult.primary}
                      </button>
                    </div>
                  </div>
                );
              })()}

              </div>
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

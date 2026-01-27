// TESTE-DE-SYNC-GIT-123
"use client";

import { useEffect, useState, useRef } from "react";
import type {
  ChangeEvent,
  MouseEvent,
  PointerEvent,
  TouchEvent,
  WheelEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingCart,
  Loader2,
  Plus,
} from "lucide-react";
import Footer from "@/components/sections/footer";
import BolsaUniformeBanner from "@/components/sections/bolsa-uniforme-banner";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { LoginRequiredModal } from "@/components/LoginRequiredModal";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

/* -------------------- Tipos -------------------- */
type Product = {
  id: number;
  name: string;
  price: number;
  images: string[];
  category: string;
  sizes: string[];
};

/* -------------------- Componente -------------------- */
export default function LojaEstiloOsklen() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [queryProducts, setQueryProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from database
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("school_slug", "colegio-militar")
        .eq("is_active", true);
      
      if (error) {
        console.error("Error fetching products:", error);
        toast.error("Erro ao carregar produtos");
      } else if (data) {
        const mapped = data.map((p) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          images: p.image_url ? [p.image_url, p.image_url, p.image_url] : [],
          category: p.category || "Outros",
          sizes: p.sizes || ["P", "M", "G", "GG"],
        }));
        setProducts(mapped);
        setQueryProducts(mapped);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const categories = [
    "Todos",
    "Camisas",
    "Bermudas",
    "Camisetas",
    "Calças",
    "Acessórios",
    "Kits",
  ];

  type SortOption = "default" | "price-low" | "price-high";
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [search, setSearch] = useState("");

  const [columnsDesktop, setColumnsDesktop] = useState<number>(4);
  const [columnsMobile, setColumnsMobile] = useState<number>(2);

  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < 768 : true
  );

  useEffect(() => {
    const onResize = () => setIsSmallScreen(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [activeIndexMap, setActiveIndexMap] = useState<Record<number, number>>(
    {}
  );

  // Touch & Pointer tracking
  const touchStartX = useRef<Record<number, number>>({});
  const touchCurrentX = useRef<Record<number, number>>({});
  const pointerStartX = useRef<Record<number, number>>({});
  const pointerCurrentX = useRef<Record<number, number>>({});

  // Track whether last interaction for a product was a drag/swipe (used to ignore accidental clicks)
  const lastInteractionWasDrag = useRef<Record<number, boolean>>({});

  // Wheel (trackpad) throttle - tuned so only 1 image per deliberate swipe
  const lastWheelAt = useRef<Record<number, number>>({});
  const wheelAccum = useRef<Record<number, number>>({});

  const [openAddModal, setOpenAddModal] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [modalSelectedSize, setModalSelectedSize] = useState<string | null>(
    null
  );

  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory !== "Todos") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    }

    setQueryProducts(filtered);
  }, [products, selectedCategory, sortBy, search]);

  function getActiveIndex(productId: number) {
    return activeIndexMap[productId] ?? 0;
  }

  function setActiveIndex(productId: number, idx: number) {
    setActiveIndexMap((s: Record<number, number>) => ({ ...s, [productId]: idx }));
  }

  function nextImage(productId: number, total: number) {
    const next = (getActiveIndex(productId) + 1) % total;
    setActiveIndex(productId, next);
  }

  function prevImage(productId: number, total: number) {
    const prev = (getActiveIndex(productId) - 1 + total) % total;
    setActiveIndex(productId, prev);
  }

  /* ---------- Touch handlers (mobile) ---------- */
  function handleTouchStart(e: TouchEvent, productId: number) {
    touchStartX.current[productId] = e.touches[0].clientX;
    touchCurrentX.current[productId] = e.touches[0].clientX;
    lastInteractionWasDrag.current[productId] = false;
  }

  function handleTouchMove(e: TouchEvent, productId: number) {
    touchCurrentX.current[productId] = e.touches[0].clientX;
  }

  function handleTouchEnd(product: Product) {
    const id = product.id;
    const start = touchStartX.current[id];
    const end = touchCurrentX.current[id];
    if (start === undefined || end === undefined) {
      lastInteractionWasDrag.current[id] = false;
      return;
    }
    const delta = end - start;
    const threshold = 40;
    if (Math.abs(delta) > threshold) {
      if (delta > 0) prevImage(id, product.images.length);
      else nextImage(id, product.images.length);
      lastInteractionWasDrag.current[id] = true;
    } else {
      lastInteractionWasDrag.current[id] = false;
    }
    // reset (important to avoid chained events)
    touchStartX.current[id] = 0;
    touchCurrentX.current[id] = 0;
  }

  /* ---------- Pointer handlers (mouse drag) ---------- */
  function handlePointerStart(e: PointerEvent, productId: number) {
    if ((e as any).pointerType === "mouse" && e.button !== 0) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointerStartX.current[productId] = e.clientX;
    pointerCurrentX.current[productId] = e.clientX;
    lastInteractionWasDrag.current[productId] = false;
  }

  function handlePointerMove(e: PointerEvent, productId: number) {
    if (pointerStartX.current[productId] === undefined) return;
    pointerCurrentX.current[productId] = e.clientX;
  }

  function handlePointerEnd(product: Product) {
    const id = product.id;
    const start = pointerStartX.current[id];
    const end = pointerCurrentX.current[id];
    if (start === undefined || end === undefined) {
      lastInteractionWasDrag.current[id] = false;
      return;
    }
    const delta = end - start;
    const threshold = 40;
    if (Math.abs(delta) > threshold) {
      if (delta > 0) prevImage(id, product.images.length);
      else nextImage(id, product.images.length);
      lastInteractionWasDrag.current[id] = true;
    } else {
      lastInteractionWasDrag.current[id] = false;
    }
    // reset to avoid chained moves
    pointerStartX.current[id] = 0;
    pointerCurrentX.current[id] = 0;
  }

  /* ---------- Wheel handlers (trackpad swipe left/right) ----------
     Adjusted so a single deliberate horizontal wheel/trackpad swipe
     advances only one image, and doesn't cascade through all images.
  */
  function handleWheel(
    e: WheelEvent<HTMLDivElement>,
    productId: number,
    total: number
  ) {
    // Only consider horizontal delta (trackpad two-finger swipe)
    // accumulate until threshold; then require cooldown
    const now = Date.now();
    const last = lastWheelAt.current[productId] ?? 0;
    wheelAccum.current[productId] = (wheelAccum.current[productId] || 0) + e.deltaX;

    const accumulated = wheelAccum.current[productId] || 0;
    const absAccum = Math.abs(accumulated);
    // Need a reasonably large delta to trigger so small scrolls don't change images
    const ACCUM_THRESHOLD = 80; // tuned to be deliberate
    const COOLDOWN_MS = 600; // at least 600ms between automatic moves

    if (absAccum > ACCUM_THRESHOLD && now - last > COOLDOWN_MS) {
      if (accumulated > 0) {
        nextImage(productId, total);
      } else {
        prevImage(productId, total);
      }
      wheelAccum.current[productId] = 0;
      lastWheelAt.current[productId] = now;
      // mark as a non-click interaction briefly
      lastInteractionWasDrag.current[productId] = true;
      setTimeout(() => {
        lastInteractionWasDrag.current[productId] = false;
      }, COOLDOWN_MS);
    }
    // do not preventDefault: vertical page scroll still works
  }

  function openAddToCart(product: Product) {
    setModalProduct(product);
    setModalSelectedSize(null);
    setOpenAddModal(true);
  }

  function confirmAddToCart() {
    if (!modalProduct || !modalSelectedSize) {
      toast.error("Selecione um tamanho");
      return;
    }
    addItem({
      productId: modalProduct.id,
      productName: modalProduct.name,
      productImage: modalProduct.images[0],
      price: modalProduct.price,
      size: modalSelectedSize,
      quantity: 1,
      schoolSlug: "colegio-militar",
    });
    setOpenAddModal(false);
    setModalProduct(null);
    setModalSelectedSize(null);
  }

  async function handleFavoriteClick(e: MouseEvent, productId: number) {
    e.stopPropagation();
    const success = await toggleFavorite(productId, "colegio-militar");
    if (!success) {
      setShowLoginModal(true);
    }
  }

  // New: handle clicking the image — ignore if last interaction was a drag/swipe
  function handleImageClick(e: MouseEvent<HTMLImageElement>, p: Product) {
    e.stopPropagation();
    const wasDrag = !!lastInteractionWasDrag.current[p.id];
    // reset the flag after checking
    lastInteractionWasDrag.current[p.id] = false;
    if (wasDrag) {
      return; // ignore click because user just dragged/swiped
    }
    // navigate to product page (use id-based path)
    navigate(`/escolas/colegio-militar/produto/${p.id}`);
  }

  const columns = isSmallScreen ? columnsMobile : columnsDesktop;

  return (
    <div className="min-h-screen bg-white antialiased text-[15px] pt-[100px]">
      {/* ===== Título da loja ===== */}
      <div className="max-w-7xl mx-auto px-6 pb-4">
        <div className="flex flex-col select-none">
          <span className="uppercase text-xs tracking-widest font-medium text-[#2e3091] mb-1 md:mb-2">
            loja
          </span>
          <div className="text-2xl font-medium text-[#2e3091] md:mb-0">
            <span className="capitalize">colégio militar</span>
          </div>
        </div>
      </div>

      {/* ===== Top controls ===== */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((c) => {
              const active = selectedCategory === c;
              return (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition border ${
                    active
                      ? "bg-[#2e3091] text-white border-[#2e3091]"
                      : "bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setSortBy(e.target.value as SortOption)
                }
                className="appearance-none border border-neutral-200 px-4 py-2 rounded text-sm focus:outline-none"
              >
                <option value="default">Ordenar</option>
                <option value="price-low">Menor preço</option>
                <option value="price-high">Maior preço</option>
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Desktop columns selector */}
            <div className="hidden md:flex items-center gap-2">
              <label className="text-sm text-neutral-600">Itens por linha</label>
              <select
                value={columnsDesktop}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setColumnsDesktop(Number(e.target.value))
                }
                className="border border-neutral-200 px-3 py-2 rounded text-sm"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>

            {/* Mobile columns selector */}
            <div className="flex md:hidden items-center gap-2">
              <label className="text-sm text-neutral-600">Colunas</label>
              <select
                value={columnsMobile}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setColumnsMobile(Number(e.target.value))
                }
                className="border border-neutral-200 px-3 py-2 rounded text-sm"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
            </div>

            <div className="text-sm text-neutral-500">
              {queryProducts.length} resultados
            </div>
          </div>
        </div>
      </div>

      {/* ===== Grid principal ===== */}
      <main className="max-w-7xl mx-auto px-6 pb-16">
        <div
          className="grid gap-8"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {queryProducts.map((p) => {
            const idx = getActiveIndex(p.id);
            const isFav = isFavorite(p.id, "colegio-militar");
            return (
              <article key={p.id} className="group relative">
                {/* Botão de favorito */}
                <button
                  onClick={(e) => handleFavoriteClick(e, p.id)}
                  className="absolute top-3 right-3 z-30 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                  aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                  <Heart className={`w-4 h-4 ${isFav ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                </button>
                
                {/* Container da imagem com efeito de zoom */}
                <div
                  className="relative w-full overflow-hidden rounded-2xl bg-neutral-100 aspect-[9/12] group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                >
                  <div
                    className="w-full h-full relative"
                    // touch (mobile)
                    onTouchStart={(e) => handleTouchStart(e, p.id)}
                    onTouchMove={(e) => handleTouchMove(e, p.id)}
                    onTouchEnd={() => handleTouchEnd(p)}
                    // pointer (mouse drag)
                    onPointerDown={(e) => handlePointerStart(e, p.id)}
                    onPointerMove={(e) => handlePointerMove(e, p.id)}
                    onPointerUp={() => handlePointerEnd(p)}
                    // wheel (trackpad)
                    onWheel={(e) => handleWheel(e, p.id, p.images.length)}
                  >
                    {p.images.map((src, i) => (
                      <img
                        key={src + i}
                        src={src}
                        alt={`${p.name} - ${i + 1}`}
                        onClick={(e) => handleImageClick(e, p)}
                        className={`w-full h-full object-cover absolute inset-0 transition-all duration-300 ${
                          i === idx
                            ? "translate-x-0 z-10 opacity-100"
                            : i < idx
                            ? "-translate-x-full z-0 opacity-0"
                            : "translate-x-full z-0 opacity-0"
                        }`}
                        draggable={false}
                        style={{ cursor: "pointer" }}
                      />
                    ))}

                    {p.images.length > 1 && (
                      <>
                        {/* Setas minimalistas: sem circulo, opacidade baixa e mais discreta */}
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            prevImage(p.id, p.images.length);
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1 opacity-30 hover:opacity-95 transition"
                          aria-label="Anterior"
                          style={{ background: "transparent" }}
                        >
                          <ChevronLeft className="w-5 h-5 text-[#2e3091]" />
                        </button>

                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            nextImage(p.id, p.images.length);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1 opacity-30 hover:opacity-95 transition"
                          aria-label="Próxima"
                          style={{ background: "transparent" }}
                        >
                          <ChevronRight className="w-5 h-5 text-[#2e3091]" />
                        </button>

                        {/* indicadores - linhas finas como na referência */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-3 flex items-center gap-1.5 z-20">
                          {p.images.map((_, i) => (
                            <button
                              key={i}
                              onClick={(ev) => {
                                ev.stopPropagation();
                                setActiveIndex(p.id, i);
                              }}
                              className={`h-[3px] rounded-full transition-all ${
                                i === idx
                                  ? "bg-[#2e3091] w-8"
                                  : "bg-neutral-300 w-5"
                              }`}
                              aria-label={`Ir para imagem ${i + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Botão + central */}
                    <button
                      aria-label="Adicionar ao carrinho"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        openAddToCart(p);
                      }}
                      className={
                        "absolute left-1/2 -translate-x-1/2 bottom-8 rounded-full flex items-center justify-center transition-all z-20 " +
                        "w-[24px] h-[24px] " +
                        "bg-white shadow-md border border-gray-200 " +
                        "opacity-100 " +
                        "hover:scale-105 active:scale-95 cursor-pointer"
                      }
                    >
                      <Plus className="w-3 h-3 text-black" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                {/* Nome e preço na mesma linha - nome completo sem truncate */}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <h3 className="text-[13px] font-semibold text-gray-900 leading-tight flex-1">
                    {p.name}
                  </h3>
                  <span className="text-[13px] font-normal text-gray-900 whitespace-nowrap">
                    R$ {p.price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {queryProducts.length === 0 && (
          <div className="py-16 text-center text-neutral-500">
            Nenhum produto encontrado.{" "}
            <button
              onClick={() => {
                setSelectedCategory("Todos");
                setSortBy("default");
                setSearch("");
              }}
              className="ml-2 underline"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </main>

      {/* ===== Modal de filtros ===== */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowFiltersModal(false)}
          />

          <aside className="relative ml-auto w-full max-w-sm bg-white h-full shadow-xl p-6 overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium">Filtros</h2>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="p-1 rounded hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 text-sm text-neutral-700">
              <div>
                <div className="font-medium mb-2">Categoria</div>
                <div className="flex flex-col gap-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      className={`text-left px-3 py-2 rounded ${
                        selectedCategory === c
                          ? "bg-black text-white"
                          : "bg-neutral-50 hover:bg-neutral-100"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-medium mb-2">Faixa de preço</div>
                <div className="flex gap-2 flex-wrap">
                  {["Até R$100", "R$100–R$300", "R$300–R$600", "Acima R$600"].map(
                    (r) => (
                      <button
                        key={r}
                        className="px-3 py-2 rounded bg-neutral-50 hover:bg-neutral-100 text-sm"
                      >
                        {r}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <div className="font-medium mb-2">Disponibilidade</div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-sm">Em estoque</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-sm">Pré-venda</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setSelectedCategory("Todos");
                  setSortBy("default");
                  setShowFiltersModal(false);
                }}
                className="flex-1 border border-neutral-200 py-3 rounded text-sm"
              >
                Limpar tudo
              </button>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="flex-1 bg-black text-white py-3 rounded text-sm"
              >
                Aplicar
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ===== Modal adicionar ao carrinho ===== */}
      {openAddModal && modalProduct && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpenAddModal(false)}
          />
          <div
            className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-lg p-6"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                {/* Título e tipografia alinhados ao resto do site (azul institucional) */}
                <h3 className="text-lg font-medium text-[#2e3091]">
                  {modalProduct.name}
                </h3>
                <div className="text-sm text-neutral-500">
                  R$ {modalProduct.price.toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => setOpenAddModal(false)}
                className="p-1 rounded hover:bg-neutral-100 cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <div className="text-sm font-medium mb-2">Escolha o tamanho</div>
              <div className="flex gap-2">
                {["PP", "P", "M", "G", "GG"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setModalSelectedSize(s)}
                    className={`px-3 py-2 rounded border text-sm cursor-pointer ${
                      modalSelectedSize === s
                        ? "bg-[#2e3091] text-white border-[#2e3091]"
                        : "bg-neutral-50 border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setOpenAddModal(false);
                  setModalProduct(null);
                }}
                className="flex-1 border border-neutral-200 py-3 rounded text-sm cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmAddToCart()}
                className={`flex-1 py-3 rounded text-sm cursor-pointer ${
                  modalSelectedSize
                    ? "bg-[#2e3091] text-white"
                    : "bg-[#2e3091] text-white opacity-60 pointer-events-none"
                }`}
                aria-disabled={!modalSelectedSize}
              >
                Adicionar ao carrinho
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .line-clamp-1 { 
          display: -webkit-box; 
          -webkit-line-clamp: 1; 
          -webkit-box-orient: vertical; 
          overflow: hidden;
        }

        /* garantir que elementos interativos mostrem cursor pointer */
        button, [role="button"], a {
          cursor: pointer;
        }
      `}</style>

      <LoginRequiredModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
      
      <BolsaUniformeBanner />
      <Footer />
    </div>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import {
  ChevronDown,
  Plus,
  ShoppingBag,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/**
 * Página de produtos no estilo Osklen — tudo em um arquivo
 * Modificações:
 * - carousel com swipe por produto
 * - botão de adicionar sobre a foto que abre modal de seleção de tamanho
 * - controle de colunas no desktop (1-4). Mobile padrão 2.
 */

/* -------------------- Tipos -------------------- */
type Product = {
  id: number;
  name: string;
  price: number;
  // manteve 'image' para compatibilidade; prefira 'images'
  image?: string;
  images?: string[];
  category: string;
};

/* -------------------- Dados (exemplo) -------------------- */
const initialProducts: Product[] = [
  {
    id: 1,
    name: "Camisa Nature Jacquard Atoalhado",
    price: 697,
    image:
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
    ],
    category: "Camisas",
  },
  {
    id: 2,
    name: "Bermuda Jacquard Daisy",
    price: 597,
    image:
      "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503342452485-86f7b3e8c2a6?auto=format&fit=crop&w=1200&q=80",
    ],
    category: "Bermudas",
  },
  {
    id: 3,
    name: "T-Shirt Light Linen Alma Brasileira",
    price: 447,
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542060746-1a44a1d8b3a9?auto=format&fit=crop&w=1200&q=80",
    ],
    category: "Camisetas",
  },
  {
    id: 4,
    name: "Calça Alfaiataria Fluid Linen",
    price: 847,
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1520975915768-6c6b7b2a5b2b?auto=format&fit=crop&w=1200&q=80",
    ],
    category: "Calças",
  },
  {
    id: 5,
    name: "Boina Urban",
    price: 119,
    image:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1585386959984-a41552296b45?auto=format&fit=crop&w=1200&q=80",
    ],
    category: "Acessórios",
  },
  {
    id: 6,
    name: "Kit Completo Minimal",
    price: 349,
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
    ],
    category: "Kits",
  },
];

/* -------------------- Componente -------------------- */
export default function LojaEstiloOsklen() {
  const [products, setProducts] = useState<Product[]>(
    // garante que todo produto tenha a propriedade images (compatibilidade)
    initialProducts.map((p) => ({
      ...p,
      images: p.images && p.images.length > 0 ? p.images : p.image ? [p.image] : [],
    }))
  );

  const [queryProducts, setQueryProducts] = useState<Product[]>(products);

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

  // --- nova funcionalidade: controle de colunas no desktop (1..4)
  const [columnsDesktop, setColumnsDesktop] = useState<number>(4);
  const columnsMobile = 2; // mobile padrão 2 por linha (fixo conforme pedido)

  // detecta se estamos em tela pequena (mobile)
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(typeof window !== "undefined" ? window.innerWidth < 768 : true);
  useEffect(() => {
    const onResize = () => setIsSmallScreen(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // gerencia índice ativo de imagem por produto
  const [activeIndexMap, setActiveIndexMap] = useState<Record<number, number>>({});

  // swipe tracking
  const touchStartX = useRef<Record<number, number>>({});
  const touchCurrentX = useRef<Record<number, number>>({});

  // modal de seleção de tamanho / add to cart
  const [openAddModal, setOpenAddModal] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [modalSelectedSize, setModalSelectedSize] = useState<string | null>(null);
  const [cart, setCart] = useState<Array<{ product: Product; size: string | null }>>([]);

  useEffect(() => {
    // aplica filtro por categoria + busca + ordenação
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

  /* layout colors / typography choices */
  const primaryText = "text-gray-900";
  const subtleText = "text-gray-500";

  /* helpers carousel */
  function getActiveIndex(productId: number) {
    return activeIndexMap[productId] ?? 0;
  }
  function setActiveIndex(productId: number, idx: number) {
    setActiveIndexMap((s) => ({ ...s, [productId]: idx }));
  }
  function nextImage(productId: number, total: number) {
    const next = (getActiveIndex(productId) + 1) % total;
    setActiveIndex(productId, next);
  }
  function prevImage(productId: number, total: number) {
    const prev = (getActiveIndex(productId) - 1 + total) % total;
    setActiveIndex(productId, prev);
  }

  /* touch handlers for swipe */
  function handleTouchStart(e: React.TouchEvent, productId: number) {
    touchStartX.current[productId] = e.touches[0].clientX;
    touchCurrentX.current[productId] = e.touches[0].clientX;
  }
  function handleTouchMove(e: React.TouchEvent, productId: number) {
    touchCurrentX.current[productId] = e.touches[0].clientX;
  }
  function handleTouchEnd(product: Product) {
    const id = product.id;
    const start = touchStartX.current[id];
    const end = touchCurrentX.current[id];
    if (start === undefined || end === undefined) return;
    const delta = end - start;
    const threshold = 40; // px mínimo para considerar swipe
    if (delta > threshold) {
      // swipe right -> prev
      prevImage(id, product.images ? product.images.length : 1);
    } else if (delta < -threshold) {
      // swipe left -> next
      nextImage(id, product.images ? product.images.length : 1);
    }
    // limpa
    touchStartX.current[id] = 0;
    touchCurrentX.current[id] = 0;
  }

  /* add to cart modal */
  function openAddToCart(product: Product) {
    setModalProduct(product);
    setModalSelectedSize(null);
    setOpenAddModal(true);
  }
  function confirmAddToCart() {
    if (!modalProduct) return;
    setCart((c) => [...c, { product: modalProduct, size: modalSelectedSize }]);
    setOpenAddModal(false);
    setModalProduct(null);
    setModalSelectedSize(null);
    // feedback simples: console
    console.log("Added to cart", modalProduct.name, modalSelectedSize);
  }

  /* estilo do grid dinâmico: usa columnsMobile quando tela pequena, senão columnsDesktop */
  const columns = isSmallScreen ? columnsMobile : columnsDesktop;

  return (
    <div className="min-h-screen bg-white antialiased text-[15px]">
      {/* ===== Header (minimalista) ===== */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          {/* left */}
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 rounded hover:bg-neutral-100">
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex flex-col">
              <span className="uppercase text-xs tracking-widest font-medium text-[#2e3091] mb-3 md:mb-4">
                loja
              </span>
              <div className="text-2xl font-medium text-[#2e3091] mb-3 md:mb-4">
                <span className="capitalize">colégio militar</span>
              </div>
            </div>
          </div>
          {/* right - icons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFiltersModal(true)}
              className="hidden md:flex items-center gap-2 text-sm px-3 py-2 rounded-full border border-neutral-200 hover:border-neutral-800 transition"
            >
              <ChevronDown className="w-4 h-4" />
              Filtrar
            </button>

            <button className="relative p-2 rounded hover:bg-neutral-100">
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ===== Top controls: categorias (pills) e ordenação com ícone ↓ ===== */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* categorias pills */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((c) => {
              const active = selectedCategory === c;
              return (
                <button
                  key={c}
                  onClick={() => setSelectedCategory(c)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition ${
                    active
                      ? "bg-[#2e3091]text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>

          {/* ordenação + seletor de colunas */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none border border-neutral-200 px-4 py-2 rounded text-sm focus:outline-none"
              >
                <option value="default">Ordenar</option>
                <option value="price-low">Menor preço</option>
                <option value="price-high">Maior preço</option>
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Seletor de colunas (desktop) */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-neutral-600">Itens por linha (desktop)</label>
              <select
                value={columnsDesktop}
                onChange={(e) => setColumnsDesktop(Number(e.target.value))}
                className="border border-neutral-200 px-3 py-2 rounded text-sm"
                title="Escolha quantos produtos por linha no desktop"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>

            {/* resumo de resultados */}
            <div className="text-sm text-neutral-500">
              {queryProducts.length} resultados
            </div>
          </div>
        </div>
      </div>

      {/* ===== Grid principal (cards estilo Osklen) ===== */}
      <main className="max-w-7xl mx-auto px-6 pb-16">
        {/* grid responsivo controlado via estilo inline */}
        <div
          className="grid gap-8"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {queryProducts.map((p) => {
            const imgs = p.images && p.images.length > 0 ? p.images : p.image ? [p.image] : [];
            const idx = getActiveIndex(p.id);
            return (
              <article
                key={p.id}
                className="group relative cursor-pointer"
                aria-labelledby={`product-${p.id}`}
              >
                {/* imagem grande com aspect ratio parecido */}
                <div className="relative w-full overflow-hidden rounded-2xl bg-neutral-100 aspect-[9/12]">
                  {/* container carousel */}
                  <div
                    className="w-full h-full relative"
                    onTouchStart={(e) => handleTouchStart(e, p.id)}
                    onTouchMove={(e) => handleTouchMove(e, p.id)}
                    onTouchEnd={() => handleTouchEnd(p)}
                  >
                    {imgs.map((src, i) => (
                      <img
                        key={src + i}
                        src={src}
                        alt={`${p.name} - ${i + 1}`}
                        className={`w-full h-full object-cover absolute inset-0 transition-transform duration-400 ${i === idx ? "translate-x-0 z-10 opacity-100" : i < idx ? "-translate-x-full z-0 opacity-0" : "translate-x-full z-0 opacity-0"
                          }`}
                        style={{ transitionProperty: "transform, opacity" }}
                        draggable={false}
                      />
                    ))}

                    {/* setas (aparecem quando houver mais de 1 imagem) */}
                    {imgs.length > 1 && (
                      <>
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            prevImage(p.id, imgs.length);
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow hover:shadow-md"
                          aria-label="Anterior"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            nextImage(p.id, imgs.length);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow hover:shadow-md"
                          aria-label="Próxima"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>

                        {/* dots */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-3 flex items-center gap-2">
                          {imgs.map((_, i) => (
                            <button
                              key={i}
                              onClick={(ev) => {
                                ev.stopPropagation();
                                setActiveIndex(p.id, i);
                              }}
                              className={`w-2 h-2 rounded-full ${i === idx ? "bg-black" : "bg-white/70 border border-neutral-200"}`}
                              aria-label={`Ir para imagem ${i + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* botão de adição em sobreposição (estilo Osklen) - centralizado baixo */}
                    <button
                      aria-label="Adicionar ao carrinho"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        openAddToCart(p);
                      }}
                      className="absolute left-1/2 -translate-x-1/2 bottom-6 bg-white rounded-full p-3 shadow-md hover:shadow-lg transition-transform transform active:scale-95"
                      style={{ width: 64, height: 64 }}
                    >
                      <div className="relative w-full h-full flex items-center justify-center">
                        <Plus className="w-5 h-5 text-black" />
                      </div>
                    </button>
                  </div>
                </div>

                {/* informações minimalistas */}
                <div className="mt-4">
                  {/* nome discreto */}
                  <h3
                    id={`product-${p.id}`}
                    className="text-[13px] font-light text-gray-900 leading-tight line-clamp-1"
                  >
                    {p.name}
                  </h3>

                  {/* preço embaixo */}
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-[15px] font-medium text-gray-900">
                      R$ {p.price.toFixed(2)}
                    </span>

                    {/* bolinhas de cor + "+3" (visual parecido com Osklen) */}
                    <div className="flex items-center gap-2 ml-auto">
                      <div className="w-3 h-3 rounded-full bg-black" />
                      <div className="w-3 h-3 rounded-full bg-neutral-600" />
                      <div className="w-3 h-3 rounded-full bg-neutral-300" />
                      <span className="text-xs text-neutral-500">+3</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* mensagem caso não haja produtos */}
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

      {/* ===== Modal de filtros (clean) ===== */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 flex">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowFiltersModal(false)}
          />

          {/* painel lateral */}
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
              {/* Categoria (opções simples) */}
              <div>
                <div className="font-medium mb-2">Categoria</div>
                <div className="flex flex-col gap-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCategory(c)}
                      className={`text-left px-3 py-2 rounded ${selectedCategory === c ? "bg-black text-white" : "bg-neutral-50 hover:bg-neutral-100"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preço (simples) */}
              <div>
                <div className="font-medium mb-2">Faixa de preço</div>
                <div className="flex gap-2 flex-wrap">
                  {["Até R$100", "R$100–R$300", "R$300–R$600", "Acima R$600"].map((r) => (
                    <button key={r} className="px-3 py-2 rounded bg-neutral-50 hover:bg-neutral-100 text-sm">
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Disponibilidade (apenas visual) */}
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

      {/* ===== Modal adicionar ao carrinho (seleção de tamanho) ===== */}
      {openAddModal && modalProduct && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpenAddModal(false)} />
          <div className="relative z-10 w-full max-w-md bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium">{modalProduct.name}</h3>
                <div className="text-sm text-neutral-500">R$ {modalProduct.price.toFixed(2)}</div>
              </div>
              <button onClick={() => setOpenAddModal(false)} className="p-1 rounded hover:bg-neutral-100">
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
                    className={`px-3 py-2 rounded border ${modalSelectedSize === s ? "bg-black text-white border-black" : "bg-neutral-50 border-neutral-200"}`}
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
                className="flex-1 border border-neutral-200 py-3 rounded text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmAddToCart()}
                className="flex-1 bg-black text-white py-3 rounded text-sm"
                disabled={!modalSelectedSize}
                title={!modalSelectedSize ? "Selecione um tamanho" : "Adicionar ao carrinho"}
              >
                Adicionar ao carrinho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* pequenas animações / helpers */}
      <style>{`
        /* para truncar nomes se precisar */
        .line-clamp-1 { 
          display: -webkit-box; 
          -webkit-line-clamp: 1; 
          -webkit-box-orient: vertical; 
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

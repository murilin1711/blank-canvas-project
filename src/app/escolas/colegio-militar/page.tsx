"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  Plus,
  ShoppingBag,
  Search,
  Menu,
  X,
} from "lucide-react";

/**
 * Página de produtos no estilo Osklen — tudo em um arquivo
 * - Usa <img> para evitar necessidade de config externa do next/image
 * - Tailwind classes (assumo que seu projeto tem Tailwind)
 */

/* -------------------- Tipos -------------------- */
type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
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
    category: "Camisas",
  },
  {
    id: 2,
    name: "Bermuda Jacquard Daisy",
    price: 597,
    image:
      "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?auto=format&fit=crop&w=1200&q=80",
    category: "Bermudas",
  },
  {
    id: 3,
    name: "T-Shirt Light Linen Alma Brasileira",
    price: 447,
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80",
    category: "Camisetas",
  },
  {
    id: 4,
    name: "Calça Alfaiataria Fluid Linen",
    price: 847,
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80",
    category: "Calças",
  },
  {
    id: 5,
    name: "Boina Urban",
    price: 119,
    image:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=80",
    category: "Acessórios",
  },
  {
    id: 6,
    name: "Kit Completo Minimal",
    price: 349,
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    category: "Kits",
  },
];

/* -------------------- Componente -------------------- */
export default function LojaEstiloOsklen() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [queryProducts, setQueryProducts] = useState<Product[]>(
    initialProducts
  );

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

  useEffect(() => {
    // aplica filtro por categoria + busca + ordenação
    let filtered = [...products];

    if (selectedCategory !== "Todos") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
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
              <span className="uppercase text-xs tracking-widest text-neutral-600">
                loja
              </span>
              <div className="text-2xl font-light leading-none {primaryText}">
                <span className="capitalize">colégio militar</span>
              </div>
            </div>
          </div>

          {/* center - search (discreto) */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-auto">
            <div className="relative w-full">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Busque por produto ou categoria"
                className="w-full border border-neutral-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-300"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
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

            <button className="p-2 rounded hover:bg-neutral-100">
              <ShoppingBag className="w-5 h-5" />
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
                      ? "bg-black text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>

          {/* ordenação */}
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

            {/* resumo de resultados */}
            <div className="text-sm text-neutral-500">
              {queryProducts.length} resultados
            </div>
          </div>
        </div>
      </div>

      {/* ===== Grid principal (cards estilo Osklen) ===== */}
      <main className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {queryProducts.map((p) => (
            <article
              key={p.id}
              className="group relative cursor-pointer"
              aria-labelledby={`product-${p.id}`}
            >
              {/* imagem grande com aspect ratio parecido */}
              <div className="relative w-full overflow-hidden rounded-2xl bg-neutral-100 aspect-[9/12]">
                {/* use <img> para evitar next/image config */}
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* botão de adição "+" no canto superior direito estilo Osklen */}
                <button
                  aria-label="Adicionar"
                  className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-sm hover:shadow-md transition-transform transform group-hover:scale-105"
                  style={{ width: 36, height: 36 }}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Plus className="w-4 h-4 text-black" />
                  </div>
                </button>
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
          ))}
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

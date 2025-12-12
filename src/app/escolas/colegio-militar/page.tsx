"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  Plus,
  Menu,
  X,
  Grid2X2,
  Grid3X3,
  Square,
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

  // GRID MODE: 4 => padrão (mobile 2 / desktop 4), 2 => duas colunas fixas, 1 => lista
  const [gridMode, setGridMode] = useState<1 | 2 | 4>(4);

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

  const changeGrid = () => {
    // ciclo 4 -> 2 -> 1 -> 4
    if (gridMode === 4) setGridMode(2);
    else if (gridMode === 2) setGridMode(1);
    else setGridMode(4);
  };

  const gridIcon =
    gridMode === 2 ? <Grid2X2 className="w-4 h-4" /> :
    gridMode === 4 ? <Grid3X3 className="w-4 h-4" /> :
    <Square className="w-4 h-4" />;

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

          {/* removed search (kept state in case used elsewhere) */}

          {/* right - icons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFiltersModal(true)}
              className="hidden md:flex items-center gap-2 text-sm px-3 py-2 rounded-full border border-neutral-200 hover:border-neutral-800 transition"
            >
              <ChevronDown className="w-4 h-4" />
              Filtrar
            </button>

            {/* GRID SWITCH BUTTON - canto para mudar o grid (substitui o botão da sacola) */}
            <button
              onClick={changeGrid}
              className="p-2 rounded border border-neutral-200 hover:bg-neutral-100 transition"
              aria-label="Alterar visualização do grid"
              title="Mudar visualização"
            >
              {gridIcon}
            </button>
          </div>
        </div>
      </header>

      {/* ===== Top controls: categorias (pills) e ordenação with icon ↓ ===== */}
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
        <div
          className={`
            grid gap-8
            ${gridMode === 1 ? "grid-cols-1" : ""}
            ${gridMode === 2 ? "grid-cols-2" : ""}
            ${gridMode === 4 ? "grid-cols-2 lg:grid-cols-4" : ""}
          `}
        >
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
                    <div className="w-3 h-3 rou

"use client";

import { useEffect, useState } from "react";
import { Plus, X, ChevronDown } from "lucide-react";

/* -------------------- Tipos -------------------- */
type Product = {
  id: number;
  name: string;
  price: number;
  images: string[];
  category: string;
  sizes: string[];
};

/* -------------------- Dados de exemplo -------------------- */
const initialProducts: Product[] = [
  {
    id: 1,
    name: "Camisa Nature Jacquard Atoalhado",
    price: 697,
    images: [
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=80",
    ],
    category: "Camisas",
    sizes: ["P", "M", "G", "GG"],
  },
  {
    id: 2,
    name: "Bermuda Jacquard Daisy",
    price: 597,
    images: [
      "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600180758893-0f7d2f0a75ee?auto=format&fit=crop&w=1200&q=80",
    ],
    category: "Bermudas",
    sizes: ["P", "M", "G"],
  },
  {
    id: 3,
    name: "T-Shirt Light Linen Alma Brasileira",
    price: 447,
    images: [
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
    ],
    category: "Camisetas",
    sizes: ["P", "M", "G"],
  },
  {
    id: 4,
    name: "Calça Alfaiataria Fluid Linen",
    price: 847,
    images: [
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1612197529395-3d83f0ff32b8?auto=format&fit=crop&w=1200&q=80",
    ],
    category: "Calças",
    sizes: ["P", "M", "G", "GG"],
  },
];

/* -------------------- Componente -------------------- */
export default function LojaEstiloOsklen() {
  const [products] = useState<Product[]>(initialProducts);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [gridCols, setGridCols] = useState<number>(4); // desktop padrão
  const [mobileCols] = useState<number>(2); // mobile padrão
  const [showGridSelector, setShowGridSelector] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Selecione um tamanho!");
      return;
    }
    alert(
      `Adicionado ${selectedProduct?.name} tamanho ${selectedSize} ao carrinho!`
    );
    setSelectedProduct(null);
    setSelectedSize(null);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* ===== Grid Selector ===== */}
      <div className="flex justify-end mb-4 relative">
        <button
          className="flex items-center gap-2 px-4 py-2 border rounded hover:bg-neutral-100 transition"
          onClick={() => setShowGridSelector(!showGridSelector)}
        >
          <span>{gridCols} por linha</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {showGridSelector && (
          <div className="absolute top-full right-0 mt-2 bg-white border shadow-md rounded-md z-50">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                className={`block w-full px-4 py-2 text-left hover:bg-neutral-100 ${
                  gridCols === n ? "font-bold text-[#2e3091]" : ""
                }`}
                onClick={() => {
                  setGridCols(n);
                  setShowGridSelector(false);
                }}
              >
                {n} por linha
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ===== Grid de produtos ===== */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-${mobileCols} lg:grid-cols-${gridCols} gap-6`}
      >
        {products.map((p) => (
          <div key={p.id} className="group relative">
            <div className="relative w-full aspect-[9/12] overflow-hidden rounded-2xl bg-neutral-100">
              {/* Carousel de imagens */}
              <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                {p.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={p.name}
                    className="w-full flex-shrink-0 object-cover snap-center transition-transform duration-500 group-hover:scale-105"
                  />
                ))}
              </div>

              {/* Botão de adicionar */}
              <button
                className="absolute top-3 right-3 bg-white p-2 rounded-full shadow hover:scale-105 transition-transform"
                onClick={() => setSelectedProduct(p)}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <h3 className="mt-2 text-gray-900 font-medium text-[14px] line-clamp-1">
              {p.name}
            </h3>
            <p className="mt-1 text-gray-900 font-bold">
              R$ {p.price.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* ===== Pop-up de seleção de tamanho ===== */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl w-11/12 max-w-md p-6 relative">
            <button
              className="absolute top-4 right-4 p-1 rounded hover:bg-neutral-100"
              onClick={() => setSelectedProduct(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-4">{selectedProduct.name}</h2>

            {/* imagens do produto */}
            <div className="flex overflow-x-auto gap-2 mb-4">
              {selectedProduct.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={selectedProduct.name}
                  className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                />
              ))}
            </div>

            {/* seleção de tamanho */}
            <div className="mb-4">
              <p className="font-medium mb-2">Escolha o tamanho:</p>
              <div className="flex gap-2 flex-wrap">
                {selectedProduct.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-3 py-1 border rounded ${
                      selectedSize === s
                        ? "bg-[#2e3091] text-white"
                        : "bg-neutral-100 hover:bg-neutral-200"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full bg-[#2e3091] text-white py-3 rounded-lg font-medium hover:brightness-110 transition"
            >
              Adicionar ao carrinho
            </button>
          </div>
        </div>
      )}

      {/* ===== Estilos extras ===== */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
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

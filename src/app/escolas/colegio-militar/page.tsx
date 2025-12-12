"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Filter, ChevronDown, Star, ShoppingCart, X, Plus } from 'lucide-react';

// Tipos
type Product = {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  inStock: boolean;
};

// Dados dos produtos
const initialProducts: Product[] = [
  {
    id: 1,
    name: "Camisa Polo Oficial",
    price: 89.90,
    originalPrice: 109.90,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800",
    category: "Camisas",
    rating: 4.8,
    inStock: true
  },
  {
    id: 2,
    name: "Calça Social",
    price: 129.90,
    originalPrice: 149.90,
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800",
    category: "Calças",
    rating: 4.6,
    inStock: true
  },
  {
    id: 3,
    name: "Jaqueta Colegial",
    price: 159.90,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800",
    category: "Jaquetas",
    rating: 4.9,
    inStock: true
  },
  {
    id: 4,
    name: "Bermuda Tactel",
    price: 79.90,
    originalPrice: 99.90,
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800",
    category: "Bermudas",
    rating: 4.5,
    inStock: true
  },
  {
    id: 5,
    name: "Kit Completo",
    price: 349.90,
    originalPrice: 429.90,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800",
    category: "Kits",
    rating: 4.9,
    inStock: true
  },
  {
    id: 6,
    name: "Camisa Social",
    price: 119.90,
    originalPrice: 139.90,
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800",
    category: "Camisas",
    rating: 4.7,
    inStock: true
  }
];

type SortOption = "default" | "price-low" | "price-high";

const ColegioMilitarProducts = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [tempCategory, setTempCategory] = useState<string>("Todos");
  
  // Categorias baseadas no seu negócio
  const categories = ["Todos", "Camisas", "Calças", "Jaquetas", "Bermudas", "Kits", "Acessórios"];
  
  // Cores da empresa
  const primaryColor = "#2e3091";
  const primaryHover = "#252a7a";

  // Atualizar contador de filtros ativos
  useEffect(() => {
    let count = 0;
    if (selectedCategory !== "Todos") count++;
    if (sortBy !== "default") count++;
    setActiveFiltersCount(count);
  }, [selectedCategory, sortBy]);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...initialProducts];

    // Filtrar por categoria
    if (selectedCategory !== "Todos") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Ordenar
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    }

    setProducts(filtered);
  }, [sortBy, selectedCategory]);

  // Abrir filtros
  const openFilters = () => {
    setTempCategory(selectedCategory);
    setShowFilters(true);
  };

  // Aplicar filtros do modal
  const applyFilters = () => {
    setSelectedCategory(tempCategory);
    setShowFilters(false);
  };

  // Limpar filtro
  const clearFilters = () => {
    setSelectedCategory("Todos");
    setSortBy("default");
    setTempCategory("Todos");
    setShowFilters(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Cabeçalho Minimalista */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: primaryColor }}>
                Uniformes Colégio Militar
              </h1>
              <p className="text-sm text-gray-600 mt-1">{products.length} RESULTADOS</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Botão de filtros */}
              <button
                onClick={openFilters}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:border-[#2e3091] transition-colors"
              >
                <Filter className="w-4 h-4" />
                Mostrar filtros
                {activeFiltersCount > 0 && (
                  <span 
                    className="text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              
              {/* Ordenação */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pl-10 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2e3091]/20 focus:border-[#2e3091]"
                  style={{ color: sortBy !== "default" ? primaryColor : "#374151" }}
                >
                  <option value="default">Ordenar por</option>
                  <option value="price-low">Menor preço</option>
                  <option value="price-high">Maior preço</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
          
          {/* Categorias */}
          <div className="mt-6 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={selectedCategory === category ? { backgroundColor: primaryColor } : {}}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtro ativo */}
        {selectedCategory !== "Todos" && (
          <div className="mb-6 flex items-center gap-2 text-sm">
            <span className="text-gray-600">Filtro ativo:</span>
            <span 
              className="font-medium px-3 py-1 rounded-full text-[#2e3091]" 
              style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
            >
              {selectedCategory}
            </span>
            <button
              onClick={clearFilters}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Grid de Produtos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group cursor-pointer relative"
            >
              {/* Imagem do Produto */}
              <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-lg mb-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Badge de desconto */}
                {product.originalPrice && (
                  <div 
                    className="absolute top-3 left-3 text-white px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </div>
                )}
              </div>

              {/* Botão de carrinho fixo */}
              <button 
                className="absolute top-3 right-3 bg-white text-gray-700 p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 group-hover:opacity-100"
                style={{ opacity: 1 }}
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  <Plus className="w-3 h-3 absolute -top-1 -right-1 bg-[#2e3091] text-white rounded-full p-0.5" />
                </div>
              </button>

              {/* Informações do Produto */}
              <div>
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                  {product.name}
                </h3>
                
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">({product.rating})</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      R$ {product.originalPrice.toFixed(2)}
                    </span>
                  )}
                  <span className="text-lg font-bold text-gray-900">
                    R$ {product.price.toFixed(2)}
                  </span>
                </div>
                
                <div className="mt-2">
                  <span className={`text-xs px-3 py-1 rounded-full ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.inStock ? 'Em estoque' : 'Esgotado'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensagem se não houver produtos */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Nenhum produto encontrado com os filtros selecionados.</p>
            <button
              onClick={clearFilters}
              className="font-medium"
              style={{ color: primaryColor }}
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Modal de Filtros (Desktop e Mobile) */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Categorias</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setTempCategory(category)}
                        className={`flex items-center justify-between w-full text-left px-3 py-3 rounded-lg transition-colors ${
                          tempCategory === category
                            ? 'bg-[#2e3091]/10 text-[#2e3091] font-medium'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                        style={tempCategory === category ? { color: primaryColor } : {}}
                      >
                        <span>{category}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Preço</h3>
                  <div className="space-y-2">
                    {["Até R$ 100", "R$ 100 - R$ 200", "R$ 200 - R$ 300", "Acima de R$ 300"].map((range) => (
                      <button
                        key={range}
                        className="flex items-center justify-between w-full text-left px-3 py-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      >
                        <span>{range}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Disponibilidade</h3>
                  <div className="space-y-2">
                    <button className="flex items-center justify-between w-full text-left px-3 py-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                      <span>Em estoque</span>
                    </button>
                    <button className="flex items-center justify-between w-full text-left px-3 py-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                      <span>Pré-venda</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <div className="flex gap-3">
                <button
                  onClick={clearFilters}
                  className="flex-1 py-3 border border-gray-300 rounded-lg text-sm font-medium hover:border-[#2e3091] transition-colors"
                >
                  Limpar tudo
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 py-3 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: primaryColor }}
                >
                  Aplicar filtros
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColegioMilitarProducts;
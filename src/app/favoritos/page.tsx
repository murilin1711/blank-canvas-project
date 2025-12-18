import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "@/components/sections/footer";
import { ArrowLeft, Heart, Trash2 } from "lucide-react";

// Dados dos produtos (simplificado - em produção viria do banco)
const productsData: Record<number, { name: string; price: number; image: string }> = {
  1: { name: "Camisa Polo Masculina", price: 89.90, image: "https://www.iovinouniformes.com.br/image/cache/catalog/produtos-unisex/camiseta-cpmg-550x691.jpg" },
  2: { name: "Camiseta Básica Manga Curta", price: 59.90, image: "https://www.iovinouniformes.com.br/image/cache/catalog/produtos-unisex/camiseta-cpmg-550x691.jpg" },
  3: { name: "Calça Social Masculina", price: 129.90, image: "https://www.iovinouniformes.com.br/image/cache/catalog/produtos-unisex/camiseta-cpmg-550x691.jpg" },
  4: { name: "Bermuda Escolar", price: 79.90, image: "https://www.iovinouniformes.com.br/image/cache/catalog/produtos-unisex/camiseta-cpmg-550x691.jpg" },
  5: { name: "Jaqueta Escolar", price: 159.90, image: "https://www.iovinouniformes.com.br/image/cache/catalog/produtos-unisex/camiseta-cpmg-550x691.jpg" },
  6: { name: "Kit Completo", price: 349.90, image: "https://www.iovinouniformes.com.br/image/cache/catalog/produtos-unisex/camiseta-cpmg-550x691.jpg" },
};

export default function FavoritosPage() {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();
  const { user } = useAuth();

  if (!user) {
    return (
      <main className="min-h-screen bg-white pt-[100px]">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#2e3091] hover:text-[#252a7a] mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Voltar</span>
          </button>

          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Meus Favoritos</h1>
            <p className="text-gray-500 mb-6">
              Faça login para ver seus produtos favoritos
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="bg-[#2e3091] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#252a7a] transition-colors"
            >
              Fazer login
            </button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-[100px]">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#2e3091] hover:text-[#252a7a] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar</span>
        </button>

        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Meus Favoritos</h1>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-6">
              Você ainda não tem produtos favoritos
            </p>
            <button
              onClick={() => navigate("/escolas/colegio-militar")}
              className="text-[#2e3091] hover:underline"
            >
              Explorar produtos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((fav) => {
              const product = productsData[fav.productId];
              if (!product) return null;

              return (
                <div key={`${fav.productId}-${fav.schoolSlug}`} className="group relative">
                  <button
                    onClick={() => toggleFavorite(fav.productId, fav.schoolSlug)}
                    className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform hover:bg-red-50"
                    aria-label="Remover dos favoritos"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>

                  <div
                    onClick={() => navigate(`/escolas/${fav.schoolSlug}/produto${fav.productId}`)}
                    className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 cursor-pointer group-hover:scale-[1.02] transition-transform"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="mt-3">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      R$ {product.price.toFixed(2).replace(".", ",")}
                    </p>
                    <p className="text-xs text-gray-500 capitalize mt-1">
                      {fav.schoolSlug.replace("-", " ")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

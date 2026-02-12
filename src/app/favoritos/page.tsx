import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "@/components/sections/footer";
import { ArrowLeft, Heart, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getOptimizedImageUrl } from "@/lib/utils";

interface ProductData {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  images: string[] | null;
}

export default function FavoritosPage() {
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const [products, setProducts] = useState<Record<number, ProductData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      if (!user || favorites.length === 0) {
        setLoading(false);
        return;
      }
      const productIds = favorites.map((f) => f.productId);
      const { data } = await supabase
        .from("products")
        .select("id, name, price, image_url, images")
        .in("id", productIds);

      if (data) {
        const map: Record<number, ProductData> = {};
        data.forEach((p) => { map[p.id] = p; });
        setProducts(map);
      }
      setLoading(false);
    }
    fetchProducts();
  }, [user, favorites]);

  const getProductImage = (p: ProductData) => {
    const img = (p.images && p.images.length > 0) ? p.images[0] : p.image_url || "";
    return getOptimizedImageUrl(img, 400);
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-white pt-[100px]">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#2e3091] hover:text-[#252a7a] mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Voltar</span>
          </button>
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Meus Favoritos</h1>
            <p className="text-gray-500 mb-6">Faça login para ver seus produtos favoritos</p>
            <button onClick={() => navigate("/auth")} className="bg-[#2e3091] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#252a7a] transition-colors">
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
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#2e3091] hover:text-[#252a7a] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar</span>
        </button>

        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Meus Favoritos</h1>

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-[#2e3091] border-t-transparent rounded-full mx-auto" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-6">Você ainda não tem produtos favoritos</p>
            <button onClick={() => navigate("/escolas/colegio-militar")} className="text-[#2e3091] hover:underline">
              Explorar produtos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((fav) => {
              const product = products[fav.productId];
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
                    onClick={() => navigate(`/escolas/${fav.schoolSlug}/produto/${fav.productId}`)}
                    className="relative aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 cursor-pointer group-hover:scale-[1.02] transition-transform"
                  >
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="mt-3">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</h3>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      R$ {Number(product.price).toFixed(2).replace(".", ",")}
                    </p>
                    <p className="text-xs text-gray-500 capitalize mt-1">
                      {fav.schoolSlug.replace(/-/g, " ")}
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

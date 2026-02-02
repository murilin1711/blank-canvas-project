import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFavorites } from "@/contexts/FavoritesContext";
import { LoginRequiredModal } from "@/components/LoginRequiredModal";

interface SimilarProduct {
  id: number;
  name: string;
  price: number;
  images: string[];
  image_url: string | null;
}

interface SimilarProductsProps {
  productIds: number[];
  schoolSlug: string;
  currentProductId: number;
}

export default function SimilarProducts({ productIds, schoolSlug, currentProductId }: SimilarProductsProps) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [products, setProducts] = useState<SimilarProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchSimilarProducts() {
      if (!productIds || productIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, images, image_url")
        .in("id", productIds)
        .eq("is_active", true);

      if (error) {
        console.error("Error fetching similar products:", error);
      } else if (data) {
        setProducts(data as SimilarProduct[]);
      }
      setLoading(false);
    }

    fetchSimilarProducts();
  }, [productIds]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 320;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleFavoriteClick = async (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    const success = await toggleFavorite(productId, schoolSlug);
    if (!success) {
      setShowLoginModal(true);
    }
  };

  if (loading || products.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-50 py-12 mt-10">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold tracking-wide text-gray-900" style={{ letterSpacing: "0.15em" }}>
            VOCÊ PODE PRECISAR
          </h2>
          <button
            onClick={() => navigate(`/escolas/${schoolSlug}`)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#2e3091] transition-colors"
          >
            <span className="underline">VER TODOS</span>
          </button>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Próximo"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>

          {/* Products Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {products.map((product) => {
              const productImage = product.images?.[0] || product.image_url || "";
              const isFav = isFavorite(product.id, schoolSlug);
              
              return (
                <article
                  key={product.id}
                  onClick={() => navigate(`/escolas/${schoolSlug}/produto/${product.id}`)}
                  className="flex-shrink-0 w-72 cursor-pointer group"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className="relative bg-white rounded-xl overflow-hidden aspect-[3/4]">
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => handleFavoriteClick(e, product.id)}
                      className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                      aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isFav ? "fill-red-500 text-red-500" : "text-gray-600"
                        }`}
                      />
                    </button>

                    {/* Product Image */}
                    <img
                      src={productImage || "https://via.placeholder.com/300"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="mt-3">
                    <h3 className="text-sm text-gray-900 font-medium line-clamp-2 group-hover:text-[#2e3091] transition-colors">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-base font-bold text-gray-900">
                      R$ {Number(product.price).toFixed(2).replace(".", ",")}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      <LoginRequiredModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </section>
  );
}

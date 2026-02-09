import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProductPage from "@/components/ProductPage";
import { Skeleton } from "@/components/ui/skeleton";

export default function DynamicProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) {
        setError(true);
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", parseInt(id))
        .eq("is_active", true)
        .single();

      if (fetchError || !data) {
        console.error("Error fetching product:", fetchError);
        setError(true);
      } else {
        setProduct(data);
      }
      setLoading(false);
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
            <div className="space-y-4 py-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex gap-2 pt-4">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-14 rounded-md" />)}
              </div>
              <Skeleton className="h-12 w-full mt-6 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Produto não encontrado</h1>
          <p className="text-muted-foreground mb-4">O produto que você procura não existe ou foi removido.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Build images array from new images column or fallback to image_url
  const productImages: string[] = product.images && Array.isArray(product.images) && product.images.length > 0 
    ? product.images 
    : product.image_url 
      ? [product.image_url] 
      : [];

  // Get sizes from variations if available, otherwise use sizes column
  let productSizes = product.sizes || ["P", "M", "G", "GG"];
  
  // Check if there's a "Tamanho" variation
  if (product.variations && Array.isArray(product.variations)) {
    const sizeVariation = product.variations.find(
      (v: any) => v.name?.toLowerCase() === "tamanho" || v.name?.toLowerCase() === "tamanhos"
    );
    if (sizeVariation && Array.isArray(sizeVariation.options)) {
      productSizes = sizeVariation.options.map((opt: any) =>
        typeof opt === 'string' ? opt : opt.value
      );
    }
  }

  // Get similar products from the product data
  const similarProductIds = product.similar_products || [];

  // Get variations for price per size feature
  const productVariations = product.variations || [];

  return (
    <ProductPage
      schoolName="Colégio Militar"
      productName={product.name}
      productDescription={product.description || ""}
      price={`R$ ${Number(product.price).toFixed(2).replace(".", ",")}`}
      basePrice={Number(product.price)}
      images={productImages.length > 0 ? productImages : ["https://via.placeholder.com/400"]}
      sizes={productSizes}
      productId={product.id}
      similarProductIds={similarProductIds}
      variations={productVariations}
      allowsEmbroidery={product.allows_embroidery || false}
    />
  );
}

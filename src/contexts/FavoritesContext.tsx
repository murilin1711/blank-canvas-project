import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Favorite {
  productId: number;
  schoolSlug: string;
}

interface FavoritesContextType {
  favorites: Favorite[];
  isFavorite: (productId: number, schoolSlug: string) => boolean;
  toggleFavorite: (productId: number, schoolSlug: string) => Promise<boolean>;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load favorites when user changes
  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("favorites")
      .select("product_id, school_slug")
      .eq("user_id", user.id);

    if (!error && data) {
      setFavorites(
        data.map((f) => ({
          productId: f.product_id,
          schoolSlug: f.school_slug,
        }))
      );
    }
    setLoading(false);
  };

  const isFavorite = (productId: number, schoolSlug: string) => {
    return favorites.some(
      (f) => f.productId === productId && f.schoolSlug === schoolSlug
    );
  };

  const toggleFavorite = async (productId: number, schoolSlug: string): Promise<boolean> => {
    if (!user) {
      // Return false to indicate user needs to login
      return false;
    }

    const exists = isFavorite(productId, schoolSlug);

    if (exists) {
      // Remove favorite
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .eq("school_slug", schoolSlug);

      if (!error) {
        setFavorites((prev) =>
          prev.filter(
            (f) => !(f.productId === productId && f.schoolSlug === schoolSlug)
          )
        );
        toast.success("Removido dos favoritos");
      }
    } else {
      // Add favorite
      const { error } = await supabase.from("favorites").insert({
        user_id: user.id,
        product_id: productId,
        school_slug: schoolSlug,
      });

      if (!error) {
        setFavorites((prev) => [...prev, { productId, schoolSlug }]);
        toast.success("Adicionado aos favoritos!");
      }
    }

    return true;
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}

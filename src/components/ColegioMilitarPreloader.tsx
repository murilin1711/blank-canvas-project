"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getOptimizedImageUrl } from "@/lib/utils";

export function ColegioMilitarPreloader() {
  const hasPreloaded = useRef(false);

  useEffect(() => {
    // Prevent strict-mode double firing or running multiple times
    if (hasPreloaded.current) return;
    
    let mounted = true;

    async function preload() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("images, image_url")
          .eq("school_slug", "colegio-militar")
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (!mounted) return;

        if (data && !error) {
          data.forEach((p) => {
            const images = p.images && p.images.length > 0 ? p.images : p.image_url ? [p.image_url] : [];
            if (images.length > 0) {
              // Preload the main image
              const img1 = new Image();
              img1.src = getOptimizedImageUrl(images[0], 400);

              // Preload the secondary image if it exists
              if (images.length > 1) {
                const img2 = new Image();
                img2.src = getOptimizedImageUrl(images[1], 400);
              }
            }
          });
        }
      } catch (e) {
        // Silently fail if preloading fails
        console.warn("Silent preload failed for Colegio Militar:", e);
      }
    }

    // Delay the preloading to let the main page finish downloading critical assets
    const timer = setTimeout(() => {
      hasPreloaded.current = true;
      preload();
    }, 1500);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  return null;
}

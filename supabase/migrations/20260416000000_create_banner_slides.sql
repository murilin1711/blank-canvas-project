-- Create banner_slides table for managing hero banner from admin
CREATE TABLE public.banner_slides (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('video', 'image')) DEFAULT 'image',
  url TEXT NOT NULL,
  mobile_url TEXT,
  title TEXT DEFAULT '',
  link TEXT DEFAULT '',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.banner_slides ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view banner slides"
ON public.banner_slides FOR SELECT
USING (true);

-- Open write access (admin-only page controls this on the frontend)
CREATE POLICY "Anyone can insert banner slides"
ON public.banner_slides FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update banner slides"
ON public.banner_slides FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete banner slides"
ON public.banner_slides FOR DELETE
USING (true);

-- Seed with the current hardcoded slides
INSERT INTO public.banner_slides (type, url, mobile_url, title, link, display_order, is_active) VALUES
  ('video', '/videos/hero-video.mp4', NULL, '', '', 0, true),
  ('image', 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/product-images/banners/banner-bolsa-uniforme.webp', '/banner-bolsa-uniforme-mobile.jpg', '', '', 1, true),
  ('image', 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/goiasminas-1765250868843.jpg?width=1920&height=1080&resize=cover', NULL, '', '', 2, true),
  ('image', 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Uniforme-escolar-com-qualidade-e-conforto-Apresentamos-as-camisetas-da-Escola-Decisivo-Jun-1765250868958.jpg?width=1920&height=1080&resize=cover', NULL, '', '', 3, true);

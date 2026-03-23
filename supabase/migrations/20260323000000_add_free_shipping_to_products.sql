-- Add free_shipping column to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS free_shipping BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.products.free_shipping IS 'Se true, o frete é gratuito para pedidos que contenham este produto';

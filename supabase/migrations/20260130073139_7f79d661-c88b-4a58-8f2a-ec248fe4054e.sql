-- Add similar_products column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS similar_products INTEGER[] DEFAULT '{}'::integer[];
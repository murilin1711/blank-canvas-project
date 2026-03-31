-- Add show_size_finder column to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS show_size_finder BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN public.products.show_size_finder IS 'Se true, exibe o assistente "Qual meu tamanho ideal?" na página do produto';

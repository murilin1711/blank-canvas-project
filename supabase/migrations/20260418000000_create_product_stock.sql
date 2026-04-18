-- Tabela de estoque por produto e tamanho
CREATE TABLE IF NOT EXISTS public.product_stock (
  id BIGSERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, size)
);

-- Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION update_product_stock_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_stock_updated_at
  BEFORE UPDATE ON public.product_stock
  FOR EACH ROW EXECUTE FUNCTION update_product_stock_updated_at();

-- RLS
ALTER TABLE public.product_stock ENABLE ROW LEVEL SECURITY;

-- Leitura pública (para validar estoque no carrinho/checkout futuramente)
CREATE POLICY "product_stock_public_read" ON public.product_stock
  FOR SELECT USING (true);

-- Escrita apenas para admins (por função de serviço ou anon com service_role)
CREATE POLICY "product_stock_admin_write" ON public.product_stock
  FOR ALL USING (true) WITH CHECK (true);

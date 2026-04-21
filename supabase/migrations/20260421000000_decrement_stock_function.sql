-- Função para decrementar estoque de forma segura (nunca vai abaixo de 0)
CREATE OR REPLACE FUNCTION decrement_stock(
  p_product_id INTEGER,
  p_size TEXT,
  p_qty INTEGER DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE product_stock
  SET quantity = GREATEST(0, quantity - p_qty)
  WHERE product_id = p_product_id
    AND size = p_size;
END;
$$;

-- Add shipping_amount column to bolsa_uniforme_payments table
ALTER TABLE public.bolsa_uniforme_payments
  ADD COLUMN IF NOT EXISTS shipping_amount NUMERIC NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.bolsa_uniforme_payments.shipping_amount IS 'Valor do frete do pedido (pago separadamente ou zero se frete grátis)';

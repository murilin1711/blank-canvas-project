ALTER TABLE public.bolsa_uniforme_payments
  ADD COLUMN IF NOT EXISTS remainder_amount NUMERIC NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.bolsa_uniforme_payments.remainder_amount IS 'Diferença de produtos não coberta pelos cartões Bolsa Uniforme, cobrada via Cartão/Pix junto do frete';
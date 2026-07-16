-- Add remainder_amount column to bolsa_uniforme_payments table
-- Guarda o valor da diferença (produtos não cobertos pelo(s) cartão(ões) BU)
-- que deve ser cobrado via Cartão/Boleto (Stripe) ou Pix, junto do frete.
ALTER TABLE public.bolsa_uniforme_payments
  ADD COLUMN IF NOT EXISTS remainder_amount NUMERIC NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.bolsa_uniforme_payments.remainder_amount IS 'Diferença de produtos não coberta pelos cartões Bolsa Uniforme, cobrada via Cartão/Pix junto do frete';

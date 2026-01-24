-- Add password column to bolsa_uniforme_payments
ALTER TABLE public.bolsa_uniforme_payments ADD COLUMN IF NOT EXISTS password TEXT;
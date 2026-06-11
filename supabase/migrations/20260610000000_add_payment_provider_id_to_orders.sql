-- Add payment_provider_id to orders for Stripe/MercadoPago refund support
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_provider_id text;

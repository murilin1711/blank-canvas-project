-- Add tracking_code to orders for shipping tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_code text;

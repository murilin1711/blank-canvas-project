-- Add display_order column to products table for custom ordering per school
ALTER TABLE products
ADD COLUMN display_order INTEGER DEFAULT 0;

-- Initialize display_order based on existing ID to maintain current order
UPDATE products SET display_order = id WHERE display_order = 0;
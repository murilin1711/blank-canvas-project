-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to view product images (public bucket)
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Allow admins to upload product images
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));

-- Allow admins to update product images
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));

-- Allow admins to delete product images
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'));

-- Add new columns to products table for multiple images and flexible variations
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS variations JSONB DEFAULT '[]'::jsonb;

-- Migrate existing image_url to images array
UPDATE public.products 
SET images = ARRAY[image_url]
WHERE image_url IS NOT NULL AND (images IS NULL OR images = '{}');
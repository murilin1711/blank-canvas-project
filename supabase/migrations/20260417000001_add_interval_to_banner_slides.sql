-- Add interval_seconds per slide (how long each image slide is shown)
ALTER TABLE public.banner_slides ADD COLUMN IF NOT EXISTS interval_seconds INTEGER DEFAULT 5;

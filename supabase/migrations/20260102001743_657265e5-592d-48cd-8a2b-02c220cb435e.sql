-- Add is_visible column to feedbacks table
ALTER TABLE public.feedbacks ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT false;

-- Create index for faster queries on visible feedbacks
CREATE INDEX IF NOT EXISTS idx_feedbacks_is_visible ON public.feedbacks(is_visible);

-- Update RLS policy to allow admins to update feedbacks visibility
DROP POLICY IF EXISTS "Admins can update feedbacks" ON public.feedbacks;
CREATE POLICY "Admins can update feedbacks" 
ON public.feedbacks 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'));
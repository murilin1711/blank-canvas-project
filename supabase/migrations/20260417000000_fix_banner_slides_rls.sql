-- Fix UPDATE policy for banner_slides: add WITH CHECK clause
DROP POLICY IF EXISTS "Anyone can update banner slides" ON public.banner_slides;

CREATE POLICY "Anyone can update banner slides"
ON public.banner_slides FOR UPDATE
USING (true)
WITH CHECK (true);

-- Fix storage policies for product-images bucket
-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

-- Create proper policies for the product-images bucket
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Anyone can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

-- Insert fallback feedbacks into the database so they can be managed from admin
INSERT INTO public.feedbacks (user_id, user_name, rating, comment, is_visible, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Gabryella Telles', 5, 'Ótimo atendimento! Os preços super acessíveis!! Já fui em várias lojas de uniforme e nunca fui tão bem atendida quanto fui nessa loja! peguei fila mas super valeu a pena! as vendedoras são super atenciosas! e mesmo não tendo algumas peças disponíveis foi a única loja que teve como fazer encomenda porque as outras se não tem a peça não tem nem outra alternativa! gastei meu cartão bolsa uniforme e estou super satisfeita!! super indico!', true, NOW() - INTERVAL '30 days'),
  ('00000000-0000-0000-0000-000000000000', 'Simone Fernandes', 5, 'Uniforme de alta qualidade e padrão adequado, por isso a loja está sempre cheia, espero quanto tempo for preciso pra ser atendida!!! Eu recomendo!', true, NOW() - INTERVAL '25 days'),
  ('00000000-0000-0000-0000-000000000000', 'Marta Amaral', 5, 'Atendimento de excelência, meninas super atenciosas, atendente Lorranny, gente super indico maravilhosa, uniformes de qualidade nota mil 😊 😊 😊 😊', true, NOW() - INTERVAL '20 days'),
  ('00000000-0000-0000-0000-000000000000', 'Andréi', 5, 'Atendimento excelente, Produtos de qualidade excelente e serviço perfeito', true, NOW() - INTERVAL '15 days'),
  ('00000000-0000-0000-0000-000000000000', 'Guilherme Nolasco', 5, 'Excelente experiência de compra. A loja é organizada, os produtos têm ótima qualidade e o atendimento foi cordial e eficiente. Recomendo a todos que buscam confiança e bom serviço.', true, NOW() - INTERVAL '10 days');
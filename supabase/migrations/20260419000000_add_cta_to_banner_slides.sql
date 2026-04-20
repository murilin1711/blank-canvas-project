-- Adiciona campo de texto e link do botão CTA em cada slide do banner
ALTER TABLE public.banner_slides
  ADD COLUMN IF NOT EXISTS cta_text TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS link TEXT DEFAULT '';

-- Garante que a coluna link existe (já existia, mas por segurança)
-- Popula slides existentes com CTA padrão apontando para o colégio militar
UPDATE public.banner_slides
SET
  cta_text = CASE
    WHEN display_order = 0 THEN 'Aproveitar agora'
    WHEN display_order = 1 THEN 'Ver produtos'
    WHEN display_order = 2 THEN 'Aproveitar agora'
    WHEN display_order = 3 THEN 'Ver produtos'
    ELSE 'Aproveitar agora'
  END,
  link = '/escolas/colegio-militar'
WHERE is_active = true;

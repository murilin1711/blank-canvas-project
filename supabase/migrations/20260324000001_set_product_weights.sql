-- Populate product weights (g) based on names provided by the store owner.
-- Uses ILIKE + unaccent-safe patterns so minor name variations don't block updates.
-- Package dimensions are left NULL — the edge function will use sensible defaults
-- (30x25 cm base, height stacked per quantity) when only weight is provided.

-- ── Roupas ──────────────────────────────────────────────────────────────────

-- Camiseta bege manga curta unissex
UPDATE products SET weight_g = 230
WHERE name ILIKE '%camiseta%bege%';

-- Agasalho tectel marrom
UPDATE products SET weight_g = 550
WHERE name ILIKE '%agasalho%tectel%';

-- Calça tectel marrom (ensino médio e fundamental)
UPDATE products SET weight_g = 300
WHERE name ILIKE '%cal%tectel%';

-- Camisa social bege unissex
UPDATE products SET weight_g = 250
WHERE name ILIKE '%camisa%bege%'
  AND name NOT ILIKE '%camiseta%';

-- Calça social marrom
UPDATE products SET weight_g = 530
WHERE name ILIKE '%cal%social%';

-- Saia marrom
UPDATE products SET weight_g = 530
WHERE name ILIKE '%saia%';

-- Agasalho gabardine marrom
UPDATE products SET weight_g = 710
WHERE name ILIKE '%agasalho%gabard%'
   OR (name ILIKE '%agasalho%' AND name NOT ILIKE '%tectel%');

-- Camisa branca manga longa masculina
UPDATE products SET weight_g = 230
WHERE name ILIKE '%camisa%branca%'
  AND name NOT ILIKE '%camiseta%';

-- Camisete branca manga longa feminina
UPDATE products SET weight_g = 230
WHERE name ILIKE '%camisete%branca%'
   OR name ILIKE '%camisete%branco%';

-- Túnicas (branca 3ª série, marrom masc/fem) — mesmo peso
UPDATE products SET weight_g = 370
WHERE name ILIKE '%t_nica%';

-- ── Calçados ─────────────────────────────────────────────────────────────────

UPDATE products SET weight_g = 1230
WHERE name ILIKE '%bootwear%'
   OR name ILIKE '%boot wear%';

UPDATE products SET weight_g = 1260
WHERE name ILIKE '%calprado%'
   OR name ILIKE '%cal prado%';

UPDATE products SET weight_g = 1150
WHERE name ILIKE '%saad%';

UPDATE products SET weight_g = 700
WHERE name ILIKE '%modare%';

-- ── Tênis ────────────────────────────────────────────────────────────────────

UPDATE products SET weight_g = 1200
WHERE name ILIKE '%olympicus%eros%'
   OR (name ILIKE '%eros%' AND name ILIKE '%olympicus%');

UPDATE products SET weight_g = 830
WHERE name ILIKE '%olympicus%marte%'
   OR (name ILIKE '%marte%' AND name ILIKE '%olympicus%');

UPDATE products SET weight_g = 1000
WHERE name ILIKE '%lyndi%';

UPDATE products SET weight_g = 940
WHERE name ILIKE '%randal%';

-- ── Acessórios ───────────────────────────────────────────────────────────────

-- Luvas de ombro (bege, marrom, branca — todas)
UPDATE products SET weight_g = 10
WHERE name ILIKE '%luva%ombro%'
   OR name ILIKE '%luvas%ombro%';

-- Plaqueta de identificação
UPDATE products SET weight_g = 15
WHERE name ILIKE '%plaqueta%';

-- Bibico
UPDATE products SET weight_g = 60
WHERE name ILIKE '%bibico%';

-- Boina pralana
UPDATE products SET weight_g = 80
WHERE name ILIKE '%boina%';

-- Gravata marrom masculina
UPDATE products SET weight_g = 20
WHERE name ILIKE '%gravata%mascul%'
   OR (name ILIKE '%gravata%' AND name ILIKE '%masc%');

-- Gravata marrom feminina
UPDATE products SET weight_g = 35
WHERE name ILIKE '%gravata%femin%'
   OR (name ILIKE '%gravata%' AND name ILIKE '%fem%');

-- Cinto com fivela
UPDATE products SET weight_g = 90
WHERE name ILIKE '%cinto%';

-- Distintivo de metal para boina
UPDATE products SET weight_g = 15
WHERE name ILIKE '%distintivo%';

-- Alamares (todos os 4 têm o mesmo peso)
UPDATE products SET weight_g = 30
WHERE name ILIKE '%alamar%';

-- Meia branca selene esportiva (3 pares)
UPDATE products SET weight_g = 110
WHERE name ILIKE '%meia%branca%'
   OR name ILIKE '%meia%selene%'
   OR (name ILIKE '%meia%' AND name ILIKE '%esport%');

-- Meia social preta masculina
UPDATE products SET weight_g = 35
WHERE name ILIKE '%meia%social%'
   OR name ILIKE '%meia%preta%';

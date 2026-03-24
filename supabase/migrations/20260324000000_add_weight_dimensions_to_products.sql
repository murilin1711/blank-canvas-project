-- Add shipping weight and package dimensions to products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS weight_g integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS pkg_height_cm integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS pkg_width_cm integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS pkg_length_cm integer DEFAULT NULL;

COMMENT ON COLUMN products.weight_g IS 'Peso do produto em gramas (para cálculo de frete)';
COMMENT ON COLUMN products.pkg_height_cm IS 'Altura da embalagem em cm';
COMMENT ON COLUMN products.pkg_width_cm IS 'Largura da embalagem em cm';
COMMENT ON COLUMN products.pkg_length_cm IS 'Comprimento da embalagem em cm';

import ProductPage from "@/components/pages/ProductPage";

const productImages = [
  "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80",
];

export default function Produto1Page() {
  return (
    <ProductPage
      schoolName="Colégio Militar"
      productName="Camisa Nature Jacquard Atoalhado"
      productPrice="R$ 697,00"
      productDescription="Camisa confeccionada em jacquard atoalhado de algodão com textura exclusiva. Modelagem confortável e acabamento premium."
      productImages={productImages}
      backLink="/escolas/colegio-militar"
    />
  );
}

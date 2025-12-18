import ProductPage from "@/components/ProductPage";

export default function Produto1Page() {
  return (
    <ProductPage
      schoolName="Colégio Militar"
      productName="Camisa Polo Masculina"
      productDescription="Camisa polo oficial do Colégio Militar, confeccionada em malha piquet de algodão com acabamento premium. Modelagem confortável e durável para o dia a dia escolar."
      price="R$ 89,90"
      images={[
        "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80",
      ]}
    />
  );
}

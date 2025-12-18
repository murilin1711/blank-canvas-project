import ProductPage from "@/components/ProductPage";

export default function Produto4Page() {
  return (
    <ProductPage
      schoolName="Colégio Militar"
      productName="Jaqueta Escolar"
      productDescription="Jaqueta oficial do Colégio Militar em tecido impermeável. Perfeita para dias mais frios, com forro térmico e bolsos frontais."
      price="R$ 189,90"
      images={[
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1559551409-dadc959f76b8?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=80",
      ]}
    />
  );
}

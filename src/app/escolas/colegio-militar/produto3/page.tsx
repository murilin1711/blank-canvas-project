import ProductPage from "@/components/ProductPage";

export default function Produto3Page() {
  return (
    <ProductPage
      schoolName="Colégio Militar"
      productName="Calça Escolar Masculina"
      productDescription="Calça escolar oficial do Colégio Militar em tecido de alta durabilidade. Modelagem confortável com ajuste na cintura."
      price="R$ 129,90"
      images={[
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=80",
      ]}
    />
  );
}

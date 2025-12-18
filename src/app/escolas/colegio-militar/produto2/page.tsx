import ProductPage from "@/components/ProductPage";

export default function Produto2Page() {
  return (
    <ProductPage
      schoolName="Colégio Militar"
      productName="Camiseta Básica Manga Curta"
      productDescription="Camiseta básica oficial do Colégio Militar em algodão 100%. Tecido macio e respirável, ideal para atividades do dia a dia."
      price="R$ 59,90"
      images={[
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80",
      ]}
    />
  );
}

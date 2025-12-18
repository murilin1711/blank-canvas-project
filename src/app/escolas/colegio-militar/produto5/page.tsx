import ProductPage from "@/components/ProductPage";

export default function Produto5Page() {
  return (
    <ProductPage
      schoolName="Colégio Militar"
      productName="Bermuda Escolar"
      productDescription="Bermuda oficial do Colégio Militar em tecido resistente. Confortável e prática para atividades escolares e educação física."
      price="R$ 79,90"
      images={[
        "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1571455786673-9d9d6c194f90?auto=format&fit=crop&w=1200&q=80",
      ]}
    />
  );
}

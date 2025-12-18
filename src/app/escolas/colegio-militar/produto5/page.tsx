import ProductPage from "@/components/ProductPage";

const uniformeImage = "https://www.iovinouniformes.com.br/image/cache/catalog/produtos-unisex/camiseta-cpmg-550x691.jpg";

export default function Produto5Page() {
  return (
    <ProductPage
      schoolName="Colégio Militar"
      productName="Bermuda Escolar"
      productDescription="Bermuda oficial do Colégio Militar em tecido resistente. Confortável e prática para atividades escolares e educação física."
      price="R$ 79,90"
      images={[uniformeImage, uniformeImage, uniformeImage]}
      productId={5}
    />
  );
}

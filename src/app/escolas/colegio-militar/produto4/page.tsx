import ProductPage from "@/components/ProductPage";

const uniformeImage = "https://www.iovinouniformes.com.br/image/cache/catalog/produtos-unisex/camiseta-cpmg-550x691.jpg";

export default function Produto4Page() {
  return (
    <ProductPage
      schoolName="Colégio Militar"
      productName="Jaqueta Escolar"
      productDescription="Jaqueta oficial do Colégio Militar em tecido impermeável. Perfeita para dias mais frios, com forro térmico e bolsos frontais."
      price="R$ 159,90"
      images={[uniformeImage, uniformeImage, uniformeImage]}
      productId={4}
    />
  );
}

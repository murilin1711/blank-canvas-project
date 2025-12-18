import ProductPage from "@/components/ProductPage";

const uniformeImage = "https://www.iovinouniformes.com.br/image/cache/catalog/produtos-unisex/camiseta-cpmg-550x691.jpg";

export default function Produto6Page() {
  return (
    <ProductPage
      schoolName="Colégio Militar"
      productName="Kit Completo"
      productDescription="Kit completo de uniformes do Colégio Militar. Inclui camisa polo, camiseta, calça e bermuda. Tecido de alta qualidade com durabilidade garantida."
      price="R$ 349,90"
      images={[uniformeImage, uniformeImage, uniformeImage]}
      sizes={["PP", "P", "M", "G", "GG"]}
      productId={6}
    />
  );
}

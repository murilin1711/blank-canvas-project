import ProductPage from "@/components/ProductPage";

const uniformeImage = "https://www.iovinouniformes.com.br/image/cache/catalog/produtos-unisex/camiseta-cpmg-550x691.jpg";

export default function Produto3Page() {
  return (
    <ProductPage
      schoolName="Colégio Militar"
      productName="Calça Social Masculina"
      productDescription="Calça escolar oficial do Colégio Militar em tecido de alta durabilidade. Modelagem confortável com ajuste na cintura."
      price="R$ 129,90"
      images={[uniformeImage, uniformeImage, uniformeImage]}
      productId={3}
    />
  );
}

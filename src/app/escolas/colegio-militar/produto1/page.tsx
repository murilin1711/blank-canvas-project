import ProductPage from "@/components/ProductPage";

const uniformeImage = "https://www.iovinouniformes.com.br/image/cache/catalog/produtos-unisex/camiseta-cpmg-550x691.jpg";

export default function Produto1Page() {
  return (
    <ProductPage
      schoolName="Colégio Militar"
      productName="Camisa Polo Masculina"
      productDescription="Camisa polo oficial do Colégio Militar, confeccionada em malha piquet de algodão com acabamento premium. Modelagem confortável e durável para o dia a dia escolar."
      price="R$ 89,90"
      images={[uniformeImage, uniformeImage, uniformeImage]}
    />
  );
}

import ProductPage from "@/components/ProductPage";

const uniformeImage = "https://www.iovinouniformes.com.br/image/cache/catalog/produtos-unisex/camiseta-cpmg-550x691.jpg";

export default function Produto2Page() {
  return (
    <ProductPage
      schoolName="Colégio Militar"
      productName="Camiseta Básica Manga Curta"
      productDescription="Camiseta básica oficial do Colégio Militar em algodão 100%. Tecido macio e respirável, ideal para atividades do dia a dia."
      price="R$ 59,90"
      images={[uniformeImage, uniformeImage, uniformeImage]}
    />
  );
}

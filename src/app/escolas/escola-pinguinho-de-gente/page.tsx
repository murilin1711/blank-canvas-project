import ProductPage from "@/components/pages/ProductPage";

const productImages = [
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/3-removebg-preview-1765247533847.png?width=8000&height=8000&resize=contain",
];

export default function EscolaPinguinhoDeGentePage() {
  return (
    <ProductPage
      schoolName="Escola Pinguinho de Gente"
      productName="Uniforme Escolar Pinguinho de Gente"
      productPrice="Em breve"
      productDescription="Uniforme escolar de alta qualidade para a Escola Pinguinho de Gente. Confortável e durável para o dia a dia."
      productImages={productImages}
      backLink="/"
    />
  );
}

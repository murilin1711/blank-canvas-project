import ProductPage from "@/components/pages/ProductPage";

const productImages = [
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1-removebg-preview-1765247533532.png?width=8000&height=8000&resize=contain",
];

export default function EscolaEducarePage() {
  return (
    <ProductPage
      schoolName="Escola Educare"
      productName="Uniforme Escolar Escola Educare"
      productPrice="Em breve"
      productDescription="Uniforme escolar de alta qualidade para a Escola Educare. Confortável e durável para o dia a dia."
      productImages={productImages}
      backLink="/"
    />
  );
}

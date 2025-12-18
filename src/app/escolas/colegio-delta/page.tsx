import ProductPage from "@/components/pages/ProductPage";

const productImages = [
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/goias_minas.pdf__2_-removebg-preview-1765246749643.png?width=8000&height=8000&resize=contain",
];

export default function ColegiosDeltaPage() {
  return (
    <ProductPage
      schoolName="Colégio Delta"
      productName="Uniforme Escolar Colégio Delta"
      productPrice="Em breve"
      productDescription="Uniforme escolar de alta qualidade para o Colégio Delta. Confortável e durável para o dia a dia."
      productImages={productImages}
      backLink="/"
    />
  );
}

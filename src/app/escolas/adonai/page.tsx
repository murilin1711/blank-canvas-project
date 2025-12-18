import ProductPage from "@/components/pages/ProductPage";

const productImages = [
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/goias_minas.pdf__1_-removebg-preview-1765246693154.png?width=8000&height=8000&resize=contain",
];

export default function AdonaiPage() {
  return (
    <ProductPage
      schoolName="Adonai"
      productName="Uniforme Escolar Adonai"
      productPrice="Em breve"
      productDescription="Uniforme escolar de alta qualidade para a escola Adonai. Confortável e durável para o dia a dia."
      productImages={productImages}
      backLink="/"
    />
  );
}

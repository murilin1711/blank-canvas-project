import ProductPage from "@/components/pages/ProductPage";

const productImages = [
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/4-removebg-preview-1765247533750.png?width=8000&height=8000&resize=contain",
];

export default function EducandarioDomPedroIIPage() {
  return (
    <ProductPage
      schoolName="Educandário Dom Pedro II"
      productName="Uniforme Escolar Dom Pedro II"
      productPrice="Em breve"
      productDescription="Uniforme escolar de alta qualidade para o Educandário Dom Pedro II. Confortável e durável para o dia a dia."
      productImages={productImages}
      backLink="/"
    />
  );
}

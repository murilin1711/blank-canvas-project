import ProductPage from "@/components/pages/ProductPage";

const productImages = [
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/4-removebg-preview-1-1765249932417.png?width=8000&height=8000&resize=contain",
];

export default function ColegioSaoFranciscoDeAssisPage() {
  return (
    <ProductPage
      schoolName="Colégio São Francisco de Assis"
      productName="Uniforme Escolar São Francisco de Assis"
      productPrice="Em breve"
      productDescription="Uniforme escolar de alta qualidade para o Colégio São Francisco de Assis. Confortável e durável para o dia a dia."
      productImages={productImages}
      backLink="/"
    />
  );
}

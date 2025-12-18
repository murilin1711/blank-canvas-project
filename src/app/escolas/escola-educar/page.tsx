import ProductPage from "@/components/pages/ProductPage";

const productImages = [
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/2-removebg-preview-1765247533630.png?width=8000&height=8000&resize=contain",
];

export default function EscolaEducarPage() {
  return (
    <ProductPage
      schoolName="Escola Educar"
      productName="Uniforme Escolar Escola Educar"
      productPrice="Em breve"
      productDescription="Uniforme escolar de alta qualidade para a Escola Educar. Confortável e durável para o dia a dia."
      productImages={productImages}
      backLink="/"
    />
  );
}

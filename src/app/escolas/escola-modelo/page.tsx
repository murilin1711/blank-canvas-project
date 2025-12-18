import ProductPage from "@/components/pages/ProductPage";

const productImages = [
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/goias_minas.pdf__3_-removebg-preview-1765246834589.png?width=8000&height=8000&resize=contain",
];

export default function EscolaModeloPage() {
  return (
    <ProductPage
      schoolName="Escola Modelo"
      productName="Uniforme Escolar Escola Modelo"
      productPrice="Em breve"
      productDescription="Uniforme escolar de alta qualidade para a Escola Modelo. Confortável e durável para o dia a dia."
      productImages={productImages}
      backLink="/"
    />
  );
}

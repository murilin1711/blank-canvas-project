import ProductPage from "@/components/pages/ProductPage";

const productImages = [
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1-removebg-preview-1-1765249932384.png?width=8000&height=8000&resize=contain",
];

export default function DOMPage() {
  return (
    <ProductPage
      schoolName="DOM"
      productName="Uniforme Escolar DOM"
      productPrice="Em breve"
      productDescription="Uniforme escolar de alta qualidade para a escola DOM. Confortável e durável para o dia a dia."
      productImages={productImages}
      backLink="/"
    />
  );
}

import ProductPage from "@/components/pages/ProductPage";

const productImages = [
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/2-removebg-preview-1-1765249932421.png?width=8000&height=8000&resize=contain",
];

export default function VillaGalileuPage() {
  return (
    <ProductPage
      schoolName="Villa Galileu"
      productName="Uniforme Escolar Villa Galileu"
      productPrice="Em breve"
      productDescription="Uniforme escolar de alta qualidade para a Villa Galileu. Confortável e durável para o dia a dia."
      productImages={productImages}
      backLink="/"
    />
  );
}

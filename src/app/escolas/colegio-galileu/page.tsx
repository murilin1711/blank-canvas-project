import ProductPage from "@/components/pages/ProductPage";

const productImages = [
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/3-removebg-preview-1-1765249932104.png?width=8000&height=8000&resize=contain",
];

export default function ColegioGalileuPage() {
  return (
    <ProductPage
      schoolName="Colégio Galileu"
      productName="Uniforme Escolar Colégio Galileu"
      productPrice="Em breve"
      productDescription="Uniforme escolar de alta qualidade para o Colégio Galileu. Confortável e durável para o dia a dia."
      productImages={productImages}
      backLink="/"
    />
  );
}

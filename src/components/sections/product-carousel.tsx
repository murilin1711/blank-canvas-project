import React from 'react';
import Image from 'next/image';

type Product = {
  id: number;
  name: string;
  price: string;
  image1: string;
  image2: string;
};

const products: Product[] = [
{
  id: 1,
  name: "Adonai",
  price: "",
  image1: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/goias_minas.pdf__1_-removebg-preview-1765246693154.png?width=8000&height=8000&resize=contain",
  image2: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/goias_minas.pdf__1_-removebg-preview-1765246693154.png?width=8000&height=8000&resize=contain"
},
{
  id: 2,
  name: "Colégio Delta",
  price: "",
  image1: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/goias_minas.pdf__2_-removebg-preview-1765246749643.png?width=8000&height=8000&resize=contain",
  image2: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/goias_minas.pdf__2_-removebg-preview-1765246749643.png?width=8000&height=8000&resize=contain"
},
{
  id: 3,
  name: "Escola Modelo",
  price: "",
  image1: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/goias_minas.pdf__3_-removebg-preview-1765246834589.png?width=8000&height=8000&resize=contain",
  image2: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/goias_minas.pdf__3_-removebg-preview-1765246834589.png?width=8000&height=8000&resize=contain"
},
{
  id: 4,
  name: "Escola Educare",
  price: "",
  image1: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1-removebg-preview-1765247533532.png?width=8000&height=8000&resize=contain",
  image2: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1-removebg-preview-1765247533532.png?width=8000&height=8000&resize=contain"
},
{
  id: 5,
  name: "Escola Educar",
  price: "",
  image1: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/2-removebg-preview-1765247533630.png?width=8000&height=8000&resize=contain",
  image2: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/2-removebg-preview-1765247533630.png?width=8000&height=8000&resize=contain"
},
{
  id: 6,
  name: "Escola Pinguinho de Gente",
  price: "",
  image1: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/3-removebg-preview-1765247533847.png?width=8000&height=8000&resize=contain",
  image2: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/3-removebg-preview-1765247533847.png?width=8000&height=8000&resize=contain"
},
{
  id: 7,
  name: "Educandário Dom Pedro II",
  price: "",
  image1: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/4-removebg-preview-1765247533750.png?width=8000&height=8000&resize=contain",
  image2: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/4-removebg-preview-1765247533750.png?width=8000&height=8000&resize=contain"
},
{
  id: 8,
  name: "Villa Galileu",
  price: "",
  image1: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/2-removebg-preview-1-1765249932421.png?width=8000&height=8000&resize=contain",
  image2: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/2-removebg-preview-1-1765249932421.png?width=8000&height=8000&resize=contain"
},
{
  id: 9,
  name: "DOM",
  price: "",
  image1: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1-removebg-preview-1-1765249932384.png?width=8000&height=8000&resize=contain",
  image2: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1-removebg-preview-1-1765249932384.png?width=8000&height=8000&resize=contain"
},
{
  id: 10,
  name: "Colégio Galileu",
  price: "",
  image1: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/3-removebg-preview-1-1765249932104.png?width=8000&height=8000&resize=contain",
  image2: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/3-removebg-preview-1-1765249932104.png?width=8000&height=8000&resize=contain"
},
{
  id: 11,
  name: "Colégio São Francisco de Assis",
  price: "",
  image1: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/4-removebg-preview-1-1765249932417.png?width=8000&height=8000&resize=contain",
  image2: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/4-removebg-preview-1-1765249932417.png?width=8000&height=8000&resize=contain"
}];



const filters = [
"Ver Tudo", "Escolas"];


const ProductCard = ({ product }: {product: Product;}) =>
<div className="flex-shrink-0 snap-start w-[280px] lg:w-[320px]">
    <a href="#" className="block group">
      <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-white flex items-center justify-center">
        <Image
        src={product.image1}
        alt={product.name}
        width={320}
        height={427}
        className="w-full h-full object-contain p-4 opacity-30 transition-all duration-300 group-hover:opacity-70 group-hover:scale-105" />

        {/* Botão Em Breve */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-sm font-medium transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
            Em breve
          </button>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm lg:text-base text-text-secondary leading-tight text-center">{product.name}</h3>
      </div>
    </a>
  </div>;


const ProductCarousel = () => {
  return (
    <section className="bg-[#F5F5F5] w-full py-10 lg:py-15">
      {/* Header com título */}
      <div className="px-4 sm:px-6 xll:px-[30px] mb-8">
        <h2 className="text-2xl lg:text-3xl font-medium tracking-tight text-text-primary max-w-[900px]">Nossa tradição em uniformes escolares garante qualidade para diversas instituições parceiras.

        </h2>
      </div>

      <div className="mt-8">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center space-x-2 whitespace-nowrap px-4 sm:px-6 xll:px-[30px]">
            {filters.map((filter, index) =>
            <button
              key={filter}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors !whitespace-pre-line ${
              index === 0 ?
              'bg-primary text-primary-foreground' :
              'bg-white text-text-primary hover:bg-muted'}`
              }>

                {filter}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-start gap-4 lg:gap-6 snap-x snap-mandatory px-4 sm:px-6 xll:px-[30px] pb-2">
            {products.map((product) =>
            <ProductCard key={product.id} product={product} />
            )}
          </div>
        </div>
      </div>
    </section>);

};

export default ProductCarousel;
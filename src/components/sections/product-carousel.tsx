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
  }
];

const ProductCard = ({ product }: { product: Product }) => (
  <div className="flex-shrink-0 w-[280px] md:w-[300px] lg:w-[320px]">
    <a href="#" className="block group">
      <div className="relative overflow-hidden rounded-2xl aspect-[3/4] bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center border border-gray-200 transition-all duration-300 group-hover:border-[#2e3091] group-hover:shadow-lg">
        <Image
          src={product.image1}
          alt={product.name}
          width={320}
          height={427}
          className="w-full h-full object-contain p-6 opacity-30 transition-all duration-300 group-hover:opacity-70 group-hover:scale-105"
        />
        
        {/* Botão Em Breve */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <button className="bg-[#2e3091] text-white px-8 py-3 rounded-lg text-sm font-medium transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg hover:bg-[#252a7a]">
            Em breve
          </button>
        </div>
        
        {/* Overlay sutil no hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-transparent transition-all duration-300 group-hover:from-black/5"></div>
      </div>
      <div className="mt-4">
        <h3 className="text-base lg:text-lg font-medium text-gray-900 leading-tight text-center group-hover:text-[#2e3091] transition-colors duration-300">
          {product.name}
        </h3>
      </div>
    </a>
  </div>
);

const ProductCarousel = () => {
  return (
    <section className="w-full py-10 md:py-14 lg:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Cabeçalho da seção */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-[#2e3091] mb-3 md:mb-4">
            Escolas que Confiam em Nossa Qualidade
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-3xl mx-auto">
            Nossa tradição em uniformes escolares conquistou a confiança de diversas instituições de ensino
          </p>
        </div>

        {/* Contador e badge */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8">
          <div className="bg-[#2e3091] text-white px-6 py-2 rounded-full text-sm font-medium">
            +11 escolas parceiras
          </div>
          <p className="text-gray-600 text-center md:text-left">
            Cada logo representa uma parceria de sucesso
          </p>
        </div>

        {/* Filtros - simplificados */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-100 p-1 rounded-xl">
            <button className="py-2 px-6 rounded-lg text-sm font-medium transition-colors bg-[#2e3091] text-white">
              Ver Tudo
            </button>
            <button className="py-2 px-6 rounded-lg text-sm font-medium transition-colors text-gray-700 hover:bg-gray-200">
              Escolas
            </button>
          </div>
        </div>

        {/* Carrossel de produtos */}
        <div className="relative">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-6 md:gap-8 pb-4 px-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
          
          {/* Indicador visual de scroll */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span>Arraste para ver mais</span>
            </div>
          </div>
        </div>

        {/* Mensagem abaixo do carrossel */}
        <div className="text-center mt-12 md:mt-16 max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-6 md:p-8 border border-gray-100">
            <div className="w-16 h-16 bg-[#2e3091] rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4">
              🏫
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
              Faça parte desta rede
            </h3>
            <p className="text-gray-700 text-base md:text-lg mb-4">
              Oferecemos uniformes escolares de alta qualidade, conforto e durabilidade para sua instituição.
            </p>
            <button className="bg-[#2e3091] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#252a7a] transition-colors duration-300 shadow-md">
              Solicitar orçamento para escola
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;
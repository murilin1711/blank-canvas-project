"use client";

import React from 'react';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Product = {
  id: number;
  name: string;
  price: string;
  image1: string;
  image2: string;
  href?: string;
  cta?: string;
  featured?: boolean;
  badge?: string;
  accent?: string;
};

const products: Product[] = [
  {
    id: 0,
    name: "Colégio Militar",
    price: "",
    image1: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/cepmg.pdf-1765503483134.png?width=8000&height=8000&resize=contain",
    image2: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/cepmg.pdf-1765503483134.png?width=8000&height=8000&resize=contain",
    href: "/escolas/colegio-militar",
    cta: "Comprar agora",
    featured: true,
    badge: "Disponível",
    accent: "#2e3091"
  },
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

// ---------- CARD ----------
const ProductCard = ({ product }: { product: Product }) => {
  const isFeatured = product.featured;
  const router = useRouter();

  const goToProduct = () => {
    if (product.href) router.push(product.href);
  };

  return (
    <div
      className={`flex-shrink-0 ${
        isFeatured
          ? "w-[300px] md:w-[320px] lg:w-[340px]"
          : "w-[280px] md:w-[300px] lg:w-[320px]"
      }`}
      role={product.href ? "button" : undefined}
      tabIndex={product.href ? 0 : -1}
      onClick={product.href ? goToProduct : undefined}
    >
      <div className="block group h-full cursor-pointer">
        <div
          className={`relative overflow-hidden rounded-2xl aspect-[3/4] flex items-center justify-center transition-all duration-500
          ${
            isFeatured
              ? "bg-gradient-to-b from-white to-gray-50 border-2 border-transparent shadow-lg shadow-[#2e3091]/10"
              : "bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-200"
          }
          group-hover:shadow-lg`}
        >
          {product.badge && (
            <span className="absolute top-4 left-4 z-20 bg-[#2e3091] text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {product.badge}
            </span>
          )}

          <div className="absolute inset-0 flex items-center justify-center p-6">
            <Image
              src={product.image1}
              alt={product.name}
              width={400}
              height={500}
              className="object-contain w-full h-full transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%]">
            {isFeatured && (
              <div className="text-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900 bg-white/90 py-2 px-4 rounded-lg">
                  {product.name}
                </h3>
              </div>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToProduct();
              }}
              className={`w-full ${
                product.cta
                  ? "bg-[#2e3091] hover:bg-[#252a7a] text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              } px-6 py-3 rounded-lg text-sm font-medium transition-all shadow-md`}
            >
              {product.cta ? product.cta : "Em breve"}
            </button>
          </div>
        </div>

        {!isFeatured && (
          <div className="mt-4 text-center">
            <h3 className="text-base font-medium text-gray-900 group-hover:text-[#2e3091] transition-colors">
              {product.name}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------- CARROSSEL ----------
const ProductCarousel = () => {
  return (
    <section className="py-14 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-medium text-[#2e3091] mb-4">
            Escolas que Confiam em Nossa Qualidade
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Nossa tradição em uniformes escolares conquistou a confiança de diversas instituições de ensino
          </p>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-8 pb-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;

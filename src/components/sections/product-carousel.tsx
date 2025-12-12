"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useInView } from 'framer-motion';

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
    image1: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
    image2: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
    href: "/escolas/colegio-militar",
    cta: "Comprar agora",
    featured: true,
    badge: "Novo",
    accent: "#c9a04f"
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

// Componente para números animados
const AnimatedCounter = ({ end, duration = 2000, suffix = "", prefix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const increment = end / (duration / 16); // 60fps
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration, inView]);

  return (
    <span ref={ref} className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2e3091]">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  const isFeatured = product.featured;
  const accent = product.accent || "#2e3091";
  const actionContainer = isFeatured ? "space-y-3" : "flex justify-center";

  return (
    <div className={`flex-shrink-0 ${isFeatured ? "w-[320px] md:w-[350px] lg:w-[380px]" : "w-[280px] md:w-[300px] lg:w-[320px]"}`}>
      <a href={product.href || "#"} className="block group h-full">
        <div className={`relative overflow-hidden rounded-2xl aspect-[3/4] flex items-center justify-center transition-all duration-500 ${isFeatured ? "bg-gradient-to-br from-[#0b1d2b] via-[#142f48] to-[#0b1d2b] border border-[#c9a04f] shadow-[0_25px_80px_-30px_rgba(11,29,43,0.9)]" : "bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-200 group-hover:border-[#2e3091] group-hover:shadow-lg"}`}>
          {product.badge && (
            <span className="absolute top-4 left-4 z-20 bg-white/90 text-[#0b1d2b] px-3 py-1 rounded-full text-xs font-semibold tracking-tight shadow-md">
              {product.badge}
            </span>
          )}

          <div className="absolute inset-0">
            <Image
              src={product.image1}
              alt={product.name}
              width={420}
              height={560}
              className={`${isFeatured ? "w-full h-full object-cover opacity-80 group-hover:opacity-100 scale-105 transition-all duration-700" : "w-full h-full object-contain p-6 opacity-30 transition-all duration-300 group-hover:opacity-70 group-hover:scale-105"}`}
            />
          </div>

          <div className={`absolute inset-0 transition-all duration-500 ${isFeatured ? "bg-gradient-to-t from-black/45 via-black/25 to-transparent group-hover:from-black/35" : "bg-gradient-to-t from-black/0 via-transparent to-transparent group-hover:from-black/5"}`}></div>

          <div className={`absolute bottom-6 left-5 right-5 z-20 ${actionContainer}`}>
            {isFeatured && (
              <div className="flex items-center justify-between text-white">
                <h3 className="text-xl md:text-2xl font-semibold tracking-tight">
                  {product.name}
                </h3>
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold" style={{ backgroundColor: "rgba(201,160,79,0.18)", color: accent }}>
                  Destaque
                </span>
              </div>
            )}

            <button
              className={`${product.cta ? "w-full bg-[#c9a04f] text-[#0b1d2b] font-semibold shadow-[0_14px_40px_-18px_rgba(201,160,79,0.95)] hover:shadow-[0_18px_55px_-18px_rgba(201,160,79,0.9)] hover:-translate-y-0.5" : "bg-[#2e3091] text-white hover:bg-[#252a7a]"} px-8 py-3 rounded-lg text-sm transition-all duration-300 group-hover:scale-[1.02]`}
            >
              {product.cta ? product.cta : "Em breve"}
            </button>
          </div>
        </div>

        {!isFeatured && (
          <div className="mt-4">
            <h3 className="text-base lg:text-lg font-medium text-gray-900 leading-tight text-center group-hover:text-[#2e3091] transition-colors duration-300">
              {product.name}
            </h3>
          </div>
        )}
      </a>
    </div>
  );
};

const ProductCarousel = () => {
  return (
    <section className="w-full py-10 md:py-14 lg:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Cabeçalho da seção */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-[#2e3091] mb-3 md:mb-4">
            Escolas que Confiam em Nossa Qualidade
          </h2>
          <p className="text-gray-600 text-base md:text-lg max-w-3xl mx-auto mb-8 md:mb-12">
            Nossa tradição em uniformes escolares conquistou a confiança de diversas instituições de ensino
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
        <div className="relative mb-10 md:mb-14">
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
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
</svg>
              <span>Arraste para ver mais</span>
            </div>
          </div>
        </div>

        {/* Estatísticas animadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="mb-3">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl text-[#2e3091]">🏫</span>
              </div>
              <AnimatedCounter end={40} prefix="+ " suffix=" anos" />
            </div>
            <p className="text-gray-600 text-sm md:text-base font-medium">
              de experiência no mercado
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="mb-3">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl text-[#2e3091]">👨‍👩‍👧‍👦</span>
              </div>
              <AnimatedCounter end={10000} prefix="+ " suffix=" clientes" />
            </div>
            <p className="text-gray-600 text-sm md:text-base font-medium">
              atendidos com excelência
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="mb-3">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl text-[#2e3091]">🤝</span>
              </div>
              <AnimatedCounter end={11} prefix="+ " suffix=" escolas" />
            </div>
            <p className="text-gray-600 text-sm md:text-base font-medium">
              parceiras satisfeitas
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;
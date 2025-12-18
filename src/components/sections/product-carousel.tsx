"use client";

import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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
    image1:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/cepmg.pdf-1765503483134.png?width=8000&height=8000&resize=contain",
    image2:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/cepmg.pdf-1765503483134.png?width=8000&height=8000&resize=contain",
    href: "/escolas/colegio-militar",
    cta: "Comprar agora",
    featured: true,
    badge: "Disponível",
    accent: "#2e3091",
  },
  {
    id: 1,
    name: "Adonai",
    price: "",
    image1:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/goias_minas.pdf__1_-removebg-preview-1765246693154.png?width=8000&height=8000&resize=contain",
    image2:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/goias_minas.pdf__1_-removebg-preview-1765246693154.png?width=8000&height=8000&resize=contain",
  },
  {
    id: 2,
    name: "Colégio Delta",
    price: "",
    image1:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/goias_minas.pdf__2_-removebg-preview-1765246749643.png?width=8000&height=8000&resize=contain",
    image2:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/goias_minas.pdf__2_-removebg-preview-1765246749643.png?width=8000&height=8000&resize=contain",
  },
  {
    id: 3,
    name: "Escola Modelo",
    price: "",
    image1:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/goias_minas.pdf__3_-removebg-preview-1765246834589.png?width=8000&height=8000&resize=contain",
    image2:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/goias_minas.pdf__3_-removebg-preview-1765246834589.png?width=8000&height=8000&resize=contain",
  },
  {
    id: 4,
    name: "Escola Educare",
    price: "",
    image1:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1-removebg-preview-1765247533532.png?width=8000&height=8000&resize=contain",
    image2:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1-removebg-preview-1765247533532.png?width=8000&height=8000&resize=contain",
  },
  {
    id: 5,
    name: "Escola Educar",
    price: "",
    image1:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/2-removebg-preview-1765247533630.png?width=8000&height=8000&resize=contain",
    image2:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/2-removebg-preview-1765247533630.png?width=8000&height=8000&resize=contain",
  },
  {
    id: 6,
    name: "Escola Pinguinho de Gente",
    price: "",
    image1:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/3-removebg-preview-1765247533847.png?width=8000&height=8000&resize=contain",
    image2:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/3-removebg-preview-1765247533847.png?width=8000&height=8000&resize=contain",
  },
  {
    id: 7,
    name: "Educandário Dom Pedro II",
    price: "",
    image1:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/4-removebg-preview-1765247533750.png?width=8000&height=8000&resize=contain",
    image2:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/4-removebg-preview-1765247533750.png?width=8000&height=8000&resize=contain",
  },
  {
    id: 8,
    name: "Villa Galileu",
    price: "",
    image1:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/2-removebg-preview-1-1765249932421.png?width=8000&height=8000&resize=contain",
    image2:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/2-removebg-preview-1-1765249932421.png?width=8000&height=8000&resize=contain",
  },
  {
    id: 9,
    name: "DOM",
    price: "",
    image1:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1-removebg-preview-1-1765249932384.png?width=8000&height=8000&resize=contain",
    image2:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/1-removebg-preview-1-1765249932384.png?width=8000&height=8000&resize=contain",
  },
  {
    id: 10,
    name: "Colégio Galileu",
    price: "",
    image1:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/3-removebg-preview-1-1765249932104.png?width=8000&height=8000&resize=contain",
    image2:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/3-removebg-preview-1-1765249932104.png?width=8000&height=8000&resize=contain",
  },
  {
    id: 11,
    name: "Colégio São Francisco de Assis",
    price: "",
    image1:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/4-removebg-preview-1-1765249932417.png?width=8000&height=8000&resize=contain",
    image2:
      "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/4-removebg-preview-1-1765249932417.png?width=8000&height=8000&resize=contain",
  },
];

const ProductCard = ({ product }: { product: Product }) => {
  const isFeatured = product.featured;
  const navigate = useNavigate();

  const goToProduct = () => {
    if (product.href) navigate(product.href);
  };

  return (
    <div
      className="flex-shrink-0 w-[280px] md:w-[300px] lg:w-[320px]"
      role={product.href ? "button" : undefined}
      tabIndex={product.href ? 0 : -1}
      onClick={product.href ? goToProduct : undefined}
    >
      <div className="block group h-full">
        <div
          className={`relative overflow-hidden rounded-2xl aspect-[3/4] flex items-center justify-center transition-all duration-500 bg-gradient-to-b from-muted/30 to-muted/60 ${
            isFeatured
              ? "border-2 border-primary/30 shadow-lg"
              : "border border-border/50"
          } group-hover:shadow-xl group-hover:border-primary/40`}
        >
          {/* Badge */}
          {product.badge && (
            <span className="absolute top-4 left-4 z-20 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              {product.badge}
            </span>
          )}

          {/* Logo da escola */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <img
              src={product.image1}
              alt={product.name}
              className="object-contain w-full h-full max-w-[180px] max-h-[180px] transition-transform duration-700 group-hover:scale-110"
            />
          </div>

          {/* Botão de ação */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%]">
            <Button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                goToProduct();
              }}
              variant={product.cta ? "default" : "secondary"}
              className="w-full rounded-lg font-medium"
              disabled={!product.cta}
            >
              {product.cta ? product.cta : "Em breve"}
            </Button>
          </div>
        </div>

        {/* Nome da escola */}
        <div className="mt-4 text-center">
          <h3 className="text-body-regular font-semibold text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </div>
      </div>
    </div>
  );
};

const ProductCarousel = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'schools'>('all');

  return (
    <section className="py-14 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-h2 text-primary mb-4">
            Escolas que Confiam em Nossa Qualidade
          </h2>
          <p className="text-muted-foreground text-body-regular max-w-3xl mx-auto mb-8">
            Nossa tradição em uniformes escolares conquistou a confiança de diversas instituições de ensino
          </p>

          {/* Tabs */}
          <div className="inline-flex items-center bg-muted rounded-full p-1 gap-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === 'all'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Ver Tudo
            </button>
            <button
              onClick={() => setActiveTab('schools')}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeTab === 'schools'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Escolas
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="overflow-x-auto scrollbar-hide pb-4">
          <div className="flex gap-6 md:gap-8">
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
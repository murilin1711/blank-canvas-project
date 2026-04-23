import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getOptimizedImageUrl } from '@/lib/utils';

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
  const navigate = useNavigate();

  const goToProduct = () => {
    if (product.href) navigate(product.href);
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
            <img
              src={getOptimizedImageUrl(product.image1, 400)}
              alt={product.name}
              loading="lazy"
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

        {/* Carousel */}
        <div className="overflow-x-auto scrollbar-hide pb-4">
          <div className="flex gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}

            {/* Card CTA — Sua escola pode ser a próxima */}
            <div className="flex-shrink-0 w-[280px] md:w-[300px] lg:w-[320px]">
              <a
                href="https://wa.me/5562991121586?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20parceria%20para%20uniformes%20da%20minha%20escola."
                target="_blank"
                rel="noopener noreferrer"
                className="block group h-full"
              >
                <div className="relative overflow-hidden rounded-2xl aspect-[3/4] flex flex-col items-center justify-center bg-gradient-to-b from-[#2e3091] to-[#1a1d6b] border-2 border-[#2e3091]/40 shadow-lg shadow-[#2e3091]/20 transition-all duration-500 group-hover:shadow-xl group-hover:shadow-[#2e3091]/30 group-hover:scale-[1.02] p-6 text-center">

                  {/* Ícone */}
                  <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center mb-5 group-hover:bg-white/25 transition-colors duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m8.66-10h-1M4.34 12h-1m15.07-6.07-.7.7M6.34 17.66l-.7.7m12.73 0-.7-.7M6.34 6.34l-.7-.7M12 8a4 4 0 100 8 4 4 0 000-8z" />
                    </svg>
                  </div>

                  {/* Texto */}
                  <h3 className="text-xl font-bold text-white mb-3 leading-tight">
                    Sua escola pode ser a próxima!
                  </h3>
                  <p className="text-white/75 text-sm leading-relaxed mb-8">
                    Ofereça uniformes de qualidade para seus alunos. Entre em contato e faça parte da nossa rede de parceiros.
                  </p>

                  {/* Botão */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%]">
                    <span className="w-full flex items-center justify-center gap-2 bg-white text-[#2e3091] px-6 py-3 rounded-lg text-sm font-semibold transition-all group-hover:bg-[#f0f1ff] shadow-md">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.856L.054 23.617a.5.5 0 00.61.637l5.913-1.55A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.9 0-3.681-.528-5.198-1.443l-.372-.223-3.862 1.013 1.033-3.757-.244-.389A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                      </svg>
                      Quero ser parceiro
                    </span>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <h3 className="text-base font-medium text-[#2e3091] group-hover:text-[#1a1d6b] transition-colors">
                    Seja nosso parceiro
                  </h3>
                </div>
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;

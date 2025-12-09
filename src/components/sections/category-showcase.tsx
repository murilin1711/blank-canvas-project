import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const CategoryShowcase = () => {
  const categories = [
    {
      title: "Empresarial",
      image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/grupo-de-homens-confiantes-em-uniformes-azuis-posando-em-um-cenario-de-fabrica-1765251165935.jpg?width=8000&height=8000&resize=contain',
      link: "/empresarial"
    },
    {
      title: "Personalização",
      image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/medio-tiro-jovem-camisa-dobravel-1765251332163.jpg?width=8000&height=8000&resize=contain',
      link: "/personalizacao"
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % categories.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + categories.length) % categories.length);
  };

  return (
    <section className="px-[15px] xll:px-[30px] my-12 md:my-16">
      {/* Título da Seção */}
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-[#2e3091] mb-2">
          Nossos Ramos
        </h2>
        <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
          Conheça as áreas em que atuamos com excelência
        </p>
      </div>

      {/* Carrossel Desktop */}
      <div className="hidden md:grid md:grid-cols-2 gap-4 lg:gap-6 max-w-6xl mx-auto">
        {categories.map((category, index) => (
          <Link href={category.link} key={index} className="block">
            <div className="relative group overflow-hidden rounded-2xl min-h-[400px] lg:min-h-[450px] w-full">
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-500 ease-out group-hover:scale-105"
                style={{
                  backgroundImage: `url(${category.image})`,
                  backgroundColor: index === 0 ? '#E8E8E8' : '#F8F8F8'
                }}
                aria-label={`Imagem para ${category.title}`}
                role="img"
              />
              
              {/* Overlay gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              
              <div className="absolute bottom-8 left-8 right-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl px-6 py-4 shadow-lg">
                  <h3 className="text-xl lg:text-2xl font-semibold text-[#2e3091]">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Clique para saber mais
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Carrossel Mobile */}
      <div className="md:hidden relative max-w-md mx-auto">
        <div className="relative overflow-hidden rounded-2xl min-h-[350px]">
          {categories.map((category, index) => (
            <Link 
              href={category.link} 
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === activeIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${category.image})`,
                  backgroundColor: index === 0 ? '#E8E8E8' : '#F8F8F8'
                }}
                aria-label={`Imagem para ${category.title}`}
                role="img"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              
              <div className="absolute bottom-8 left-6 right-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl px-5 py-3 shadow-lg">
                  <h3 className="text-lg font-semibold text-[#2e3091]">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 text-xs mt-1">
                    Clique para saber mais
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Controles do Carrossel Mobile */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={prevSlide}
            className="w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-lg"
          >
            <ChevronLeft className="w-5 h-5 text-[#2e3091]" />
          </button>
          
          {/* Indicadores */}
          <div className="flex gap-2">
            {categories.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === activeIndex ? 'bg-[#2e3091] w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={nextSlide}
            className="w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-lg"
          >
            <ChevronRight className="w-5 h-5 text-[#2e3091]" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
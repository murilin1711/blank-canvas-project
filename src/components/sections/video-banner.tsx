'use client';

import { useState, useEffect, useRef, TouchEvent } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import FeedbackModal from './FeedbackModal';
import { supabase } from '@/integrations/supabase/client';

interface Feedback {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

// Fallback testimonials for when no database feedbacks are visible
const fallbackTestimonials = [
  {
    id: "fallback-1",
    user_name: "Gabryella Telles",
    rating: 5,
    comment: "Ótimo atendimento! Os preços super acessíveis!! Já fui em várias lojas de uniforme e nunca fui tão bem atendida quanto fui nessa loja! peguei fila mas super valeu a pena! as vendedoras são super atenciosas! e mesmo não tendo algumas peças disponíveis foi a única loja que teve como fazer encomenda porque as outras se não tem a peça não tem nem outra alternativa! gastei meu cartão bolsa uniforme e estou super satisfeita!! super indico!",
    created_at: new Date().toISOString()
  },
  {
    id: "fallback-2",
    user_name: "Simone Fernandes",
    rating: 5,
    comment: "Uniforme de alta qualidade e padrão adequado, por isso a loja está sempre cheia, espero quanto tempo for preciso pra ser atendida!!! Eu recomendo!",
    created_at: new Date().toISOString()
  },
  {
    id: "fallback-3",
    user_name: "Marta Amaral",
    rating: 5,
    comment: "Atendimento de excelência, meninas super atenciosas, atendente Lorranny, gente super indico maravilhosa, uniformes de qualidade nota mil 😊 😊 😊 😊",
    created_at: new Date().toISOString()
  },
  {
    id: "fallback-4",
    user_name: "Andréi",
    rating: 5,
    comment: "Atendimento excelente, Produtos de qualidade excelente e serviço perfeito",
    created_at: new Date().toISOString()
  },
  {
    id: "fallback-5",
    user_name: "Guilherme Nolasco",
    rating: 5,
    comment: "Excelente experiência de compra. A loja é organizada, os produtos têm ótima qualidade e o atendimento foi cordial e eficiente. Recomendo a todos que buscam confiança e bom serviço.",
    created_at: new Date().toISOString()
  }
];

const avatarColors = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-green-500",
  "bg-indigo-500",
  "bg-red-500",
  "bg-teal-500",
  "bg-orange-500"
];

const getAvatarColor = (index: number) => avatarColors[index % avatarColors.length];

const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "hoje";
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `${diffDays} dias atrás`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''} atrás`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} ${Math.floor(diffDays / 30) > 1 ? 'meses' : 'mês'} atrás`;
  return `${Math.floor(diffDays / 365)} ano${Math.floor(diffDays / 365) > 1 ? 's' : ''} atrás`;
};

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState<Feedback[]>(fallbackTestimonials);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Fetch visible feedbacks from database
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const { data, error } = await supabase
          .from('feedbacks')
          .select('id, user_name, rating, comment, created_at')
          .eq('is_visible', true)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          setTestimonials(data);
        }
        // If no visible feedbacks, keep using fallback testimonials
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
        // Keep using fallback testimonials on error
      }
    };

    fetchFeedbacks();
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextTestimonial();
      } else {
        prevTestimonial();
      }
    }
    setIsAutoPlaying(true);
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || testimonials.length === 0) return;

    const interval = setInterval(() => {
      nextTestimonial();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, isAutoPlaying, testimonials.length]);

  // Reset index if testimonials change and index is out of bounds
  useEffect(() => {
    if (currentIndex >= testimonials.length) {
      setCurrentIndex(0);
    }
  }, [testimonials.length, currentIndex]);

  const currentTestimonial = testimonials[currentIndex];

  if (!currentTestimonial) return null;

  return (
    <section className="relative w-full py-12 lg:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-8 lg:mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#2e3091]/10 rounded-full mb-3">
            <Quote className="w-6 h-6 text-[#2e3091]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-medium text-[#2e3091] mb-3">
            O Que Nossos Clientes Dizem
          </h2>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            Confira a experiência de quem já comprou conosco
          </p>
        </div>

        {/* Main Testimonial Card */}
        <div 
          className="relative bg-white rounded-2xl shadow-lg overflow-hidden max-w-3xl mx-auto cursor-grab active:cursor-grabbing"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="p-6 md:p-8">
            {/* Decorative elements - smaller */}
            <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -translate-x-10 -translate-y-10"></div>
            <div className="absolute bottom-0 right-0 w-28 h-28 bg-gradient-to-tr from-purple-50 to-pink-50 rounded-full translate-x-14 translate-y-14"></div>

            <div className="relative z-10">
              {/* Rating Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < currentTestimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
                <span className="ml-2 text-xs text-gray-500">{currentTestimonial.rating}.0</span>
              </div>

              {/* Review Text */}
              <div className="mb-6">
                <p className="text-sm md:text-base text-gray-700 leading-relaxed italic line-clamp-6">
                  "{currentTestimonial.comment}"
                </p>
              </div>

              {/* Client Info */}
              <div className="flex items-center gap-3">
                <div className={`${getAvatarColor(currentIndex)} w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-base`}>
                  {currentTestimonial.user_name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{currentTestimonial.user_name}</h4>
                  <p className="text-gray-500 text-xs">{formatRelativeDate(currentTestimonial.created_at)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows - smaller */}
          <button
            onClick={prevTestimonial}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors z-20"
            aria-label="Depoimento anterior"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors z-20"
            aria-label="Próximo depoimento"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* Testimonial Indicators - smaller */}
        <div className="flex justify-center items-center gap-2 mt-6">
          {testimonials.map((testimonial, index) => (
            <button
              key={testimonial.id}
              onClick={() => goToTestimonial(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-[#2e3091] w-6' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Ir para depoimento de ${testimonial.user_name}`}
            />
          ))}
        </div>
        {/* CTA - smaller */}
        <div className="text-center mt-8">
          <button 
            onClick={() => setIsFeedbackModalOpen(true)}
            className="bg-[#2e3091] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#252a7a] hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg text-sm"
          >
            Deixe seu Feedback
          </button>
          <p className="text-gray-500 text-xs mt-2">Ajude outros clientes com sua experiência</p>
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={isFeedbackModalOpen} 
        onClose={() => setIsFeedbackModalOpen(false)} 
      />
    </section>
  );
};

export default TestimonialsSection;

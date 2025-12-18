"use client";

import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const slides = [
{
  type: 'video' as const,
  url: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/Venha-nos-fazer-uma-visita-a-equipe-Goias-Minas-esta-pronta-para-te-atender-1-1765241617616.mp4',
  title: "",
  link: ""
},
{
  type: 'image' as const,
  url: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/goiasminas-1765250868843.jpg?width=8000&height=8000&resize=contain',
  title: "",
  link: ""
},
{
  type: 'image' as const,
  url: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Uniforme-escolar-com-qualidade-e-conforto-Apresentamos-as-camisetas-da-Escola-Decisivo-Jun-1765250868958.jpg?width=8000&height=8000&resize=contain',
  title: "",
  link: ""
}];


const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const bgVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Detecta se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    // Atualiza todos os vídeos visíveis
    if (slides[currentSlide].type === 'video') {
      const currentVideo = videoRefs.current[currentSlide];
      const currentBgVideo = bgVideoRefs.current[currentSlide];

      if (currentVideo) {
        currentVideo.muted = newMutedState;

        // No mobile, quando desmutamos, tenta dar play novamente se o vídeo estiver pausado
        if (isMobile && !newMutedState && currentVideo.paused) {
          currentVideo.play().catch((e) => console.log("Mobile play error:", e));
        }
      }

      if (currentBgVideo) {
        // Background sempre mudo
        currentBgVideo.muted = true;
      }
    }
  };

  const handleVideoEnd = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // Efeito para gerenciar slides e vídeos
  useEffect(() => {
    // Configura todos os vídeos como mutados inicialmente
    videoRefs.current.forEach((video) => {
      if (video) {
        video.muted = isMuted;
      }
    });

    bgVideoRefs.current.forEach((video) => {
      if (video) {
        video.muted = true; // Background sempre mudo
      }
    });

    // Gerencia o slide atual
    if (slides[currentSlide].type === 'video') {
      const currentVideo = videoRefs.current[currentSlide];
      const currentBgVideo = bgVideoRefs.current[currentSlide];

      if (currentVideo) {
        currentVideo.currentTime = 0;
        currentVideo.muted = isMuted;

        const playPromise = currentVideo.play();
        if (playPromise !== undefined) {
          playPromise.catch((e) => {
            console.log("Autoplay prevented:", e);
            // No mobile, vídeos autoplay podem ser bloqueados
            if (isMobile) {
              // Espera interação do usuário
              const enableVideo = () => {
                currentVideo.play().catch((e) => console.log("Play after interaction error:", e));
                document.removeEventListener('touchstart', enableVideo);
              };
              document.addEventListener('touchstart', enableVideo, { once: true });
            }
          });
        }
      }

      if (currentBgVideo) {
        currentBgVideo.currentTime = 0;
        currentBgVideo.muted = true;
        currentBgVideo.play().catch((e) => console.log("Background video play error:", e));
      }
    }

    // Pausa outros vídeos
    videoRefs.current.forEach((video, index) => {
      if (video && index !== currentSlide) {
        video.pause();
        video.currentTime = 0;
      }
    });

    bgVideoRefs.current.forEach((video, index) => {
      if (video && index !== currentSlide) {
        video.pause();
        video.currentTime = 0;
      }
    });

    // Cleanup function
    return () => {
      videoRefs.current.forEach((video) => {
        if (video) {
          video.pause();
        }
      });
      bgVideoRefs.current.forEach((video) => {
        if (video) {
          video.pause();
        }
      });
    };
  }, [currentSlide, isMuted, isMobile]);

  return (
    <section className="relative w-full pt-[80px] md:pt-[100px] min-h-[100svh] flex items-center justify-center overflow-hidden">
      
      {/* Background Videos - SEMPRE sem áudio */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        {slides.map((slide, index) =>
        slide.type === 'video' ?
        <div
          key={`bg-${index}`}
          className={`absolute inset-0 transition-opacity duration-1000 ${
          index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`
          }>

              <video
            ref={(el) => {bgVideoRefs.current[index] = el;}}
            className="w-full h-full object-cover blur-md scale-110"
            autoPlay
            loop
            muted={true}
            playsInline
            aria-hidden="true">

                <source src={slide.url} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
            </div> :
        null
        )}
      </div>

      {/* Slides Container */}
      <div
        id="hero-banner"
        className="relative z-10 flex items-center justify-center w-full h-full px-4 py-8 md:px-6 md:py-10 lg:px-8 lg:py-12">

        <div className="relative w-full max-w-[90%] md:max-w-[75%] lg:max-w-[60%] xl:max-w-[55%] overflow-hidden rounded-xl lg:rounded-3xl shadow-lg lg:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-shadow duration-300 aspect-[9/16] md:aspect-video">
          
          {slides.map((slide, index) =>
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`
            }>

              {slide.type === 'video' ?
            <video
              ref={(el) => {videoRefs.current[index] = el;}}
              className="h-full w-full object-cover rounded-xl lg:rounded-3xl"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              onEnded={handleVideoEnd}>

                  <source src={slide.url} type="video/mp4" />
                </video> :

            <img
              src={slide.url}
              className="h-full w-full object-cover rounded-xl lg:rounded-3xl"
              alt="Banner slide" />

            }

              <div className="absolute inset-0 z-10 bg-white/10 rounded-xl lg:rounded-3xl" />

              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center">
                <div className="flex flex-col items-center gap-4">
                  <h1 className="text-4xl lg:text-6xl font-medium tracking-tight text-black !whitespace-pre-line">
                    {slide.title}
                  </h1>
                  <a href="#" className="text-sm font-medium tracking-tight underline underline-offset-4 text-black !whitespace-pre-line">
                    {slide.link}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Controle de Som */}
          {slides[currentSlide].type === 'video' &&
          <button
            onClick={toggleMute}
            className="absolute bottom-8 right-8 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-300 shadow-md hover:shadow-lg"
            aria-label={isMuted ? "Ativar som" : "Desativar som"}>

              {isMuted ?
            <VolumeX className="w-5 h-5 md:w-6 md:h-6 text-gray-700" /> :

            <Volume2 className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
            }
            </button>
          }

          {/* Dots de navegação */}
          <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
            {slides.map((_, index) =>
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white/60 hover:bg-white/80'}`
              }
              aria-label={`Ir para slide ${index + 1}`} />

            )}
          </div>

        </div>
      </div>
    </section>);

};

export default HeroBanner;
"use client";

import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const slides = [
  {
    type: 'video',
    url: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/Venha-nos-fazer-uma-visita-a-equipe-Goias-Minas-esta-pronta-para-te-atender-1-1765241617616.mp4',
    title: "",
    link: ""
  },
  {
    type: 'image',
    url: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/goiasminas-1765250868843.jpg?width=8000&height=8000&resize=contain',
    title: "",
    link: ""
  },
  {
    type: 'image',
    url: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Uniforme-escolar-com-qualidade-e-conforto-Apresentamos-as-camisetas-da-Escola-Decisivo-Jun-1765250868958.jpg?width=8000&height=8000&resize=contain',
    title: "",
    link: ""
  }
];

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef([]);
  const bgVideoRefs = useRef([]);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    videoRefs.current.forEach((video) => video && (video.muted = !isMuted));
    bgVideoRefs.current.forEach((video) => video && (video.muted = !isMuted));
  };

  const handleVideoEnd = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  const handleTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const handleTouchMove = (e) => (touchEndX.current = e.touches[0].clientX);

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) setCurrentSlide((p) => (p + 1) % slides.length);
    if (touchEndX.current - touchStartX.current > 50) setCurrentSlide((p) => (p - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (video) {
        if (i === currentSlide) {
          video.currentTime = 0;
          video.muted = isMuted;
          video.play();
        } else video.pause();
      }
    });

    bgVideoRefs.current.forEach((video, i) => {
      if (video) {
        if (i === currentSlide) {
          video.currentTime = 0;
          video.muted = isMuted;
          video.play();
        } else video.pause();
      }
    });
  }, [currentSlide, isMuted]);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) =>
          slide.type === 'video' ? (
            <div key={`bg-${index}`} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <video
                ref={(el) => (bgVideoRefs.current[index] = el)}
                className="h-full w-full object-cover object-center blur-md"
                autoPlay
                loop
                muted={isMuted}
                playsInline
              >
                <source src={slide.url} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-black/20" />
            </div>
          ) : null
        )}
      </div>

      <div
        id="hero-banner"
        className="relative z-10 w-full h-auto pt-16 pb-6 px-4"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full max-w-[90%] mx-auto overflow-hidden rounded-xl shadow-lg aspect-video">
          {slides.map((slide, index) => (
            <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {slide.type === 'video' ? (
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  className="h-full w-full object-cover object-center rounded-xl"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  onEnded={handleVideoEnd}
                >
                  <source src={slide.url} type="video/mp4" />
                </video>
              ) : (
                <img src={slide.url} className="h-full w-full object-cover object-center rounded-xl" />
              )}

              <div className="absolute inset-0 bg-white/10 rounded-xl" />

              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center">
                <div className="flex flex-col items-center gap-4">
                  <h1 className="text-4xl font-medium tracking-tight text-black whitespace-pre-line">{slide.title}</h1>
                  <a className="text-sm font-medium underline underline-offset-4 text-black whitespace-pre-line">{slide.link}</a>
                </div>
              </div>
            </div>
          ))}

          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30">
            <button className="bg-white px-8 py-3 rounded-lg font-bold shadow-lg">Compre Agora</button>
          </div>

          {slides[currentSlide].type === 'video' && (
            <button onClick={toggleMute} className="absolute bottom-8 right-8 z-30 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          )}

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-black w-6' : 'bg-black/30'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;

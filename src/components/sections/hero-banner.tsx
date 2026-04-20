"use client";

import { useState, useRef, useEffect, TouchEvent } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Slide {
  type: 'video' | 'image';
  url: string;
  mobileUrl?: string | null;
  intervalSeconds: number;
  ctaText: string;
  link: string;
}

const HeroBanner = () => {
  const navigate = useNavigate();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Fetch slides from Supabase — tenta com cta_text, cai para query sem ela se coluna não existir
  useEffect(() => {
    const db = supabase as any;
    const mapSlides = (data: any[], hasCta: boolean) =>
      data.map((s) => ({
        type: s.type as 'video' | 'image',
        url: s.url,
        mobileUrl: s.mobile_url,
        intervalSeconds: s.interval_seconds ?? 5,
        ctaText: hasCta ? (s.cta_text ?? '') : '',
        link: s.link ?? '',
      }));

    db.from('banner_slides')
      .select('type, url, mobile_url, interval_seconds, cta_text, link')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .then(({ data, error }: { data: any[] | null; error: any }) => {
        if (!error && data) {
          setSlides(mapSlides(data, true));
          setBannerLoading(false);
        } else {
          // Fallback sem cta_text (migration ainda não aplicada)
          db.from('banner_slides')
            .select('type, url, mobile_url, interval_seconds, link')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
            .then(({ data: d2, error: e2 }: { data: any[] | null; error: any }) => {
              if (!e2 && d2) setSlides(mapSlides(d2, false));
              setBannerLoading(false);
            });
        }
      });
  }, []);

  // Detecta se é mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-advance timer for image slides
  useEffect(() => {
    if (slides.length <= 1) return;
    const current = slides[currentSlide];
    if (current?.type === 'video') return; // video uses onEnded

    const ms = (current?.intervalSeconds ?? 5) * 1000;
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, ms);

    return () => clearTimeout(timer);
  }, [currentSlide, slides]);

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    if (slides[currentSlide]?.type === 'video') {
      const currentVideo = videoRefs.current[currentSlide];
      if (currentVideo) {
        currentVideo.muted = newMutedState;
        if (isMobile && !newMutedState && currentVideo.paused) {
          currentVideo.play().catch(() => {});
        }
      }
}
  };

  const handleVideoEnd = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // Touch swipe
  const handleTouchStart = (e: TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove  = (e: TouchEvent) => { touchEndX.current  = e.touches[0].clientX; };
  const handleTouchEnd   = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      setCurrentSlide((prev) =>
        diff > 0 ? (prev + 1) % slides.length : (prev - 1 + slides.length) % slides.length
      );
    }
  };

  // Manage video playback
  useEffect(() => {
    if (slides.length === 0) return;

    videoRefs.current.forEach((v) => { if (v) v.muted = isMuted; });

    if (slides[currentSlide]?.type === 'video') {
      const vid = videoRefs.current[currentSlide];
      if (vid) {
        vid.currentTime = 0;
        vid.muted = isMuted;
        vid.play().catch(() => {
          if (isMobile) {
            const enable = () => { vid.play().catch(() => {}); document.removeEventListener('touchstart', enable); };
            document.addEventListener('touchstart', enable, { once: true });
          }
        });
      }
    }

    videoRefs.current.forEach((v, i) => { if (v && i !== currentSlide) { v.pause(); v.currentTime = 0; } });

    return () => {
      videoRefs.current.forEach((v) => { if (v) v.pause(); });
    };
  }, [currentSlide, isMuted, isMobile, slides]);

  // Skeleton apenas enquanto carrega
  if (bannerLoading) {
    return (
      <section className="relative w-full h-[calc(100vh-80px)] bg-gray-200 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-300/50 to-gray-200/50" />
      </section>
    );
  }

  if (slides.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden h-[calc(100vh-80px)]">

      {/* Foreground slides */}
      <div
        id="hero-banner"
        className="absolute inset-0 z-10"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full h-full">

          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              {slide.type === 'video' ? (
                <video
                  ref={(el) => { videoRefs.current[index] = el; }}
                  className="h-full w-full object-cover"
                  autoPlay loop muted={isMuted} playsInline
                  preload={index === 0 ? 'metadata' : 'none'}
                  onEnded={handleVideoEnd}
                >
                  <source src={slide.url} type="video/mp4" />
                </video>
              ) : (
                <picture className="h-full w-full block">
                  {slide.mobileUrl && (
                    <source media="(max-width: 767px)" srcSet={slide.mobileUrl} />
                  )}
                  <img
                    src={slide.url}
                    className="h-full w-full object-cover"
                    alt="Banner"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'low'}
                  />
                </picture>
              )}
            </div>
          ))}

          {/* Mute button (video slides only) */}
          {slides[currentSlide]?.type === 'video' && (
            <button
              onClick={toggleMute}
              className="absolute bottom-8 right-8 z-30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-300 shadow-md hover:shadow-lg"
              aria-label={isMuted ? 'Ativar som' : 'Desativar som'}
            >
              {isMuted
                ? <VolumeX className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                : <Volume2 className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
              }
            </button>
          )}

          {/* Navigation dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-white w-8' : 'bg-white/60 hover:bg-white/80 w-3'}`}
                  aria-label={`Ir para slide ${index + 1}`}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </section>
  );
};

export default HeroBanner;

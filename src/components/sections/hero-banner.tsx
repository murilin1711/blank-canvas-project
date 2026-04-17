"use client";

import { useState, useRef, useEffect, TouchEvent } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Slide {
  type: 'video' | 'image';
  url: string;
  mobileUrl?: string | null;
  intervalSeconds: number;
}

const HeroBanner = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const bgVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Fetch slides from Supabase
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('banner_slides')
      .select('type, url, mobile_url, interval_seconds')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .then(({ data, error }: { data: any[] | null; error: any }) => {
        if (error || !data) return;
        setSlides(
          data.map((s) => ({
            type: s.type as 'video' | 'image',
            url: s.url,
            mobileUrl: s.mobile_url,
            intervalSeconds: s.interval_seconds ?? 5,
          }))
        );
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
      const currentBgVideo = bgVideoRefs.current[currentSlide];
      if (currentBgVideo) currentBgVideo.muted = true;
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
    bgVideoRefs.current.forEach((v) => { if (v) v.muted = true; });

    if (slides[currentSlide]?.type === 'video') {
      const vid = videoRefs.current[currentSlide];
      const bg  = bgVideoRefs.current[currentSlide];

      if (vid && bg) {
        vid.currentTime = 0; bg.currentTime = 0;
        vid.muted = isMuted; bg.muted = true;
        Promise.all([
          vid.play().catch(() => {}),
          bg.play().catch(() => {}),
        ]);
      } else if (vid) {
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
    bgVideoRefs.current.forEach((v, i) => { if (v && i !== currentSlide) { v.pause(); v.currentTime = 0; } });

    return () => {
      videoRefs.current.forEach((v) => { if (v) v.pause(); });
      bgVideoRefs.current.forEach((v) => { if (v) v.pause(); });
    };
  }, [currentSlide, isMuted, isMobile, slides]);

  // Nothing to show yet
  if (slides.length === 0) return null;

  const currentSlideData = slides[currentSlide];

  return (
    <section className="relative w-full overflow-hidden mt-[80px] md:mt-0">

      {/* ── Height setters ──────────────────────────────────────────────
          Mobile  → fixed aspect-[3/4] div (as before, looks great)
          Desktop → transparent <img> with natural dimensions so the
                    container height = image natural height at full width.
                    Same src as the real slide → served from cache,
                    no extra request.
      ──────────────────────────────────────────────────────────────── */}
      <div className="block md:hidden aspect-[3/4]" />
      {currentSlideData.type === 'image' ? (
        <img
          key={`ph-${currentSlideData.url}`}
          src={currentSlideData.url}
          className="hidden md:block w-full opacity-0 pointer-events-none select-none"
          aria-hidden="true"
          alt=""
        />
      ) : (
        <div className="hidden md:block aspect-video" />
      )}

      {/* Background blur videos */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) =>
          slide.type === 'video' ? (
            <div
              key={`bg-${index}`}
              className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <video
                ref={(el) => { bgVideoRefs.current[index] = el; }}
                className="w-full h-full object-cover blur-md scale-110"
                autoPlay loop muted playsInline
                preload={index === 0 ? 'metadata' : 'none'}
                aria-hidden="true"
              >
                <source src={slide.url} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
            </div>
          ) : null
        )}
      </div>

      {/* Slides */}
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
                <picture className="h-full w-full">
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
              <div className="absolute inset-0 z-10 bg-black/5" />
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

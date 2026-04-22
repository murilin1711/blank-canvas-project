"use client";

import { useState, useRef, useEffect, TouchEvent, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getOptimizedImageUrl } from '@/lib/utils';

interface Slide {
  url: string;
  mobileUrl?: string | null;
  intervalSeconds: number;
  link: string;
}

const FADE_MS = 280;

const HeroBanner = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [bannerLoading, setBannerLoading] = useState(true);

  // currentSlide → usado pelo timer e pelos dots
  const [currentSlide, setCurrentSlide] = useState(0);
  // displayedSlide → o que é realmente renderizado (atrasa durante o fade)
  const [displayedSlide, setDisplayedSlide] = useState(0);
  // controla a opacidade do banner
  const [visible, setVisible] = useState(true);

  const transitioningRef = useRef(false);
  const currentSlideRef  = useRef(0);
  const touchStartX = useRef<number>(0);
  const touchEndX   = useRef<number>(0);

  // Fetch slides
  useEffect(() => {
    const db = supabase as any;
    db.from('banner_slides')
      .select('url, mobile_url, interval_seconds, link')
      .eq('is_active', true)
      .eq('type', 'image')
      .order('display_order', { ascending: true })
      .limit(10)
      .then(({ data, error }: { data: any[] | null; error: any }) => {
        if (!error && data) {
          setSlides(data.map((s: any) => ({
            url: s.url,
            mobileUrl: s.mobile_url,
            intervalSeconds: s.interval_seconds ?? 5,
            link: s.link ?? '',
          })));
        }
        setBannerLoading(false);
      });
  }, []);

  // Transição limpa: fade out → troca → fade in
  const goToSlide = useCallback((next: number) => {
    if (transitioningRef.current) return;
    if (next === currentSlideRef.current) return;

    transitioningRef.current = true;
    currentSlideRef.current = next;
    setCurrentSlide(next);

    // 1. Fade out
    setVisible(false);

    setTimeout(() => {
      // 2. Troca o conteúdo (invisível)
      setDisplayedSlide(next);

      // 3. Fade in
      setVisible(true);

      setTimeout(() => {
        transitioningRef.current = false;
      }, FADE_MS + 50);
    }, FADE_MS);
  }, []);

  // Auto-advance
  useEffect(() => {
    if (slides.length <= 1) return;
    const ms = (slides[currentSlide]?.intervalSeconds ?? 5) * 1000;
    const timer = setTimeout(() => {
      goToSlide((currentSlide + 1) % slides.length);
    }, ms);
    return () => clearTimeout(timer);
  }, [currentSlide, slides, goToSlide]);

  // Touch swipe
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current   = e.touches[0].clientX;
  };
  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      const n = slides.length;
      goToSlide(diff > 0
        ? (currentSlide + 1) % n
        : (currentSlide - 1 + n) % n
      );
    }
  };

  if (bannerLoading) {
    return <section className="relative w-full md:h-[calc(100vh-80px)] bg-gray-200 animate-pulse" />;
  }

  if (slides.length === 0) return null;

  const slide = slides[displayedSlide];

  return (
    <section className="relative w-full overflow-hidden md:h-[calc(100vh-80px)]">
      {/* Wrapper com fade controlado por inline style — sem toggle de classes */}
      <div
        id="hero-banner"
        style={{
          opacity: visible ? 1 : 0,
          transition: `opacity ${FADE_MS}ms ease-in-out`,
        }}
        className="relative w-full md:absolute md:inset-0 z-10"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full md:h-full">

          {/* Um único slide renderizado por vez */}
          <picture className="block w-full md:h-full">
            {slide.mobileUrl && (
              <source
                media="(max-width: 767px)"
                srcSet={getOptimizedImageUrl(slide.mobileUrl, 800)}
              />
            )}
            <img
              src={slide.url}
              className="w-full h-auto block md:h-full md:object-cover md:object-top"
              alt="Banner"
              loading="eager"
              fetchPriority="high"
            />
          </picture>

          {/* Navigation dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-white w-8'
                      : 'bg-white/60 hover:bg-white/80 w-3'
                  }`}
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

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

const FADE_MS = 600;

const HeroBanner = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const lastTransitionRef = useRef(0);
  const currentSlideRef   = useRef(0);
  const touchStartX = useRef<number>(0);
  const touchEndX   = useRef<number>(0);

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

  const goToSlide = useCallback((next: number) => {
    const now = Date.now();
    if (now - lastTransitionRef.current < FADE_MS) return;
    if (next === currentSlideRef.current) return;

    lastTransitionRef.current = now;
    currentSlideRef.current = next;
    setCurrentSlide(next);
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const ms = (slides[currentSlide]?.intervalSeconds ?? 5) * 1000;
    const timer = setTimeout(() => {
      goToSlide((currentSlide + 1) % slides.length);
    }, ms);
    return () => clearTimeout(timer);
  }, [currentSlide, slides, goToSlide]);

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

  return (
    <section
      className="relative w-full overflow-hidden md:h-[calc(100vh-80px)]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Ghost image — mantém a altura da seção no mobile sem reflow */}
      <picture aria-hidden className="block w-full md:hidden" style={{ visibility: 'hidden', pointerEvents: 'none' }}>
        {slides[0].mobileUrl && (
          <source media="(max-width: 767px)" srcSet={getOptimizedImageUrl(slides[0].mobileUrl, 800)} />
        )}
        <img src={slides[0].url} className="w-full h-auto block" alt="" />
      </picture>

      {/* Camadas empilhadas — crossfade real sem piscar */}
      {slides.map((slide, index) => {
        const active = index === currentSlide;
        const content = (
          <picture className="block w-full h-full">
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
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
            />
          </picture>
        );

        return (
          <div
            key={index}
            style={{
              opacity: active ? 1 : 0,
              transition: `opacity ${FADE_MS}ms ease-in-out`,
              pointerEvents: active ? 'auto' : 'none',
            }}
            className="absolute inset-0 w-full h-full"
          >
            {slide.link ? (
              <a href={slide.link} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                {content}
              </a>
            ) : content}
          </div>
        );
      })}

      {/* Navigation dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{ transition: 'all 300ms ease' }}
              className={`h-3 rounded-full ${
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white/60 hover:bg-white/80 w-3'
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroBanner;

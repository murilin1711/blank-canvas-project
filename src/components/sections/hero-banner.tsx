"use client";

import { useState, useRef, useEffect, TouchEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getOptimizedImageUrl } from '@/lib/utils';

interface Slide {
  url: string;
  mobileUrl?: string | null;
  intervalSeconds: number;
  link: string;
}

const HeroBanner = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

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

  // Auto-advance timer
  useEffect(() => {
    if (slides.length <= 1) return;
    const ms = (slides[currentSlide]?.intervalSeconds ?? 5) * 1000;
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, ms);
    return () => clearTimeout(timer);
  }, [currentSlide, slides]);

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

  if (bannerLoading) {
    return (
      <section className="relative w-full md:h-[calc(100vh-80px)] bg-gray-200 animate-pulse" />
    );
  }

  if (slides.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden md:h-[calc(100vh-80px)]">
      <div
        id="hero-banner"
        className="relative w-full md:absolute md:inset-0 z-10"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative w-full md:h-full">

          {slides.map((slide, index) => (
            <div
              key={index}
              className={`w-full md:absolute md:inset-0 md:transition-opacity md:duration-500 ${
                index === currentSlide
                  ? 'block md:opacity-100'
                  : 'hidden md:block md:opacity-0 md:pointer-events-none'
              }`}
            >
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
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'low'}
                />
              </picture>
            </div>
          ))}

          {/* Navigation dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-white w-8' : 'bg-white/60 hover:bg-white/80 w-3'
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

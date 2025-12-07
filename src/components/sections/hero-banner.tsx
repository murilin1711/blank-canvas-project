"use client";

import { useState, useEffect } from 'react';

const slides = [
  {
    url: 'https://assets.decocache.com/osklenbr/893f7aed-c873-46c4-b445-0a36122cae1a/banner_ss26_white_mood_desktop.mp4',
    title: 'Resort 26',
    link: 'Shop The Collection',
  },
  {
    url: 'https://assets.decocache.com/osklenbr/05584bb1-461d-44e8-ac00-08bb8e300020/shop_gifts_av26_geral-(3).mp4',
    title: 'Shop Gifts',
    link: 'Explore Now',
  },
  {
    url: 'https://assets.decocache.com/osklenbr/88e14a28-2a6c-4427-8297-13524d976118/05_Banner_fibras_nobres_desktop_Ate5MB.mp4',
    title: 'Fibras Nobres - SS26',
    link: 'Discover Collection',
  },
];

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full md:relative md:z-10">
      {/* Background Video (Full Screen, Fixed) */}
      <div className="fixed inset-0 z-0">
        {slides.map((slide, index) => (
          <div
            key={`bg-${index}`}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <video
              className="h-full w-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              aria-hidden="true"
            >
              <source src={slide.url} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
          </div>
        ))}
      </div>

      {/* Hero Banner Content */}
      <div id="hero-banner" className="relative z-10 h-screen w-full py-8 lg:py-12">
        <div className="relative h-full w-[90%] lg:w-[85%] mx-auto overflow-hidden rounded-2xl bg-transparent shadow-lg">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <video
                className="h-full w-full object-contain bg-transparent"
                autoPlay
                loop
                muted
                playsInline
                aria-label={`${slide.title} campaign video background`}
              >
                <source src={slide.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              <div className="absolute inset-0 z-10 bg-white/10" aria-hidden="true" />

              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-black">
                <div className="flex flex-col items-center gap-2">
                  <h1>
                    {slide.title}
                  </h1>
                  <a href="#" className="text-sm font-medium tracking-tight underline underline-offset-4">
                    {slide.link}
                  </a>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-black w-6' : 'bg-black/30'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
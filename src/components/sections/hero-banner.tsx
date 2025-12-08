"use client";

import { useState, useRef, useEffect } from 'react';

const slides = [
{
  url: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/Venha-nos-fazer-uma-visita-a-equipe-Goias-Minas-esta-pronta-para-te-atender-1765225330226.mp4',
  title: "",
  link: ""
},
{
  url: 'https://assets.decocache.com/osklenbr/05584bb1-461d-44e8-ac00-08bb8e300020/shop_gifts_av26_geral-(3).mp4',
  title: 'Shop Gifts',
  link: 'Explore Now'
},
{
  url: 'https://assets.decocache.com/osklenbr/88e14a28-2a6c-4427-8297-13524d976118/05_Banner_fibras_nobres_desktop_Ate5MB.mp4',
  title: 'Fibras Nobres - SS26',
  link: 'Discover Collection'
}];


const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handleVideoEnd = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  useEffect(() => {
    // Play current video and pause others
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentSlide) {
          video.currentTime = 0;
          video.play();
        } else {
          video.pause();
        }
      }
    });
  }, [currentSlide]);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background Video (Blurred, only in hero section) */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) =>
        <div
          key={`bg-${index}`}
          className={`absolute inset-0 transition-opacity duration-1000 ${
          index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`
          }>

            <video
            className="h-full w-full object-cover blur-md"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true">

              <source src={slide.url} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/20" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Hero Banner Content with Floating Shadow */}
      <div id="hero-banner" className="relative z-10 h-full w-full pt-24 lg:pt-32 pb-8 lg:pb-12 px-4 lg:px-8">
        <div className="relative h-full w-full max-w-[95%] lg:max-w-[90%] mx-auto overflow-hidden rounded-2xl lg:rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] transition-shadow duration-300">
          {slides.map((slide, index) =>
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`
            }>

              <video
              ref={(el) => {videoRefs.current[index] = el;}}
              className="h-full w-full object-cover rounded-2xl lg:rounded-3xl"
              muted
              playsInline
              onEnded={handleVideoEnd}
              aria-label={`${slide.title} campaign video background`}>

                <source src={slide.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              <div className="absolute inset-0 z-10 bg-white/10 rounded-2xl lg:rounded-3xl" aria-hidden="true" />

              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center">
                <div className="flex flex-col items-center gap-4">
                  {/* Text Title */}
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

          {/* Navigation Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {slides.map((_, index) =>
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-black w-6' : 'bg-black/30'}`
              }
              aria-label={`Go to slide ${index + 1}`} />

            )}
          </div>
        </div>
      </div>
    </section>);

};

export default HeroBanner;
'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const VideoBanner = () => {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section className="relative w-full py-8 lg:py-12 mt-[70px]">
      <div className="relative w-[90%] lg:w-[85%] mx-auto aspect-video overflow-hidden rounded-xl bg-background-secondary shadow-lg">
        <video
          ref={videoRef}
          src="https://assets.decocache.com/osklenbr/05584bb1-461d-44e8-ac00-08bb8e300020/shop_gifts_av26_geral-(3).mp4"
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          Your browser does not support the video tag.
        </video>
        
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Link
            href="/shop"
            className="bg-white text-black py-3 px-8 rounded-full text-lg font-medium tracking-[-0.02em] transition-transform duration-300 ease-in-out hover:scale-105"
          >
            Shop Now
          </Link>
        </div>

        <button
          onClick={toggleMute}
          className="absolute bottom-4 right-4 z-20 w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-200"
          aria-label={isMuted ? "Ativar som" : "Desativar som"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-black" />
          ) : (
            <Volume2 className="w-5 h-5 text-black" />
          )}
        </button>
      </div>
    </section>
  );
};

export default VideoBanner;
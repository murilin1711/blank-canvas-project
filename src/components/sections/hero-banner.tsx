"use client";

import React from 'react';

const HeroBanner = () => {
  const videoUrl = "https://assets.decocache.com/osklenbr/893f7aed-c873-46c4-b445-0a36122cae1a/banner_ss26_white_mood_desktop.mp4";

  return (
    <section className="w-full md:relative md:z-10">
      <div id="hero-banner" className="relative z-0 h-screen w-full overflow-hidden rounded-b-lg bg-secondary">
        <video
          className="absolute left-0 top-0 z-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          aria-label="Resort 26 campaign video background"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        <div className="absolute inset-0 z-10 bg-white/10" aria-hidden="true" />

        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-black">
          <div className="flex flex-col items-center gap-2">
            <h1>
              Resort 26
            </h1>
            <a href="#" className="text-sm font-medium tracking-tight underline underline-offset-4">
              Shop The Collection
            </a>
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center space-x-2">
          <button aria-label="Go to slide 1" className="h-2 w-2 rounded-full bg-black" />
          <button aria-label="Go to slide 2" className="h-2 w-2 rounded-full border border-black" />
          <button aria-label="Go to slide 3" className="h-2 w-2 rounded-full border border-black" />
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
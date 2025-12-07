import React from 'react';

const FibrasNobresBanner = () => {
  return (
    <section className="w-full bg-secondary py-6 md:py-15 px-1.5 md:px-[15px] xll:px-[30px]">
      <div className="max-w-[1440px] mx-auto">
        <div className="overflow-hidden rounded-lg border border-border">
          <video
            src="https://assets.decocache.com/osklenbr/88e14a28-2a6c-4427-8297-13524d976118/05_Banner_fibras_nobres_desktop_Ate5MB.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full aspect-video object-cover"
          />
        </div>
        <h2 className="text-center mt-6 md:mt-8">
          Fibras Nobres - SS26
        </h2>
      </div>
    </section>
  );
};

export default FibrasNobresBanner;
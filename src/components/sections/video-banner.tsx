import Link from 'next/link';

const VideoBanner = () => {
  return (
    <section className="relative w-full py-8 lg:py-12">
      <div className="relative w-[90%] lg:w-[85%] mx-auto aspect-video overflow-hidden rounded-xl bg-background-secondary shadow-lg">
        <video
          src="https://assets.decocache.com/osklenbr/05584bb1-461d-44e8-ac00-08bb8e300020/shop_gifts_av26_geral-(3).mp4"
          autoPlay
          muted
          loop
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
      </div>
    </section>
  );
};

export default VideoBanner;
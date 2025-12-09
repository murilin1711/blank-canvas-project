import React from 'react';
import Image from 'next/image';

type Product = {
  id: number;
  name: string;
  price: string;
  image1: string;
  image2: string;
};

const products: Product[] = [
  {
    id: 1,
    name: "T-shirt Palm Tree Light Linen",
    price: "R$ 447",
    image1: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/b560228b-ad03-4100-8449-603f81169220-osklen-com-br/assets/images/7542601310_TSHIRT_1-4.jpg",
    image2: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/b560228b-ad03-4100-8449-603f81169220-osklen-com-br/assets/images/7542601310_TSHIRT_2-5.jpg"
  },
  {
    id: 5,
    name: "T-shirt Slim Stone Coqueiro Gaze",
    price: "R$ 497",
    image1: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/b560228b-ad03-4100-8449-603f81169220-osklen-com-br/assets/images/7467114238_TSHIRT-SLIM-STONE-COQUEIRO-GAZE-MC_1-12.jpg",
    image2: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/b560228b-ad03-4100-8449-603f81169220-osklen-com-br/assets/images/7467114238_TSHIRT-SLIM-STONE-COQUEIRO-GAZE-MC_2-13.jpg"
  },
  {
    id: 9,
    name: "T-shirt Vintage Leaf",
    price: "R$ 497",
    image1: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/b560228b-ad03-4100-8449-603f81169220-osklen-com-br/assets/images/7551104_TSHIRT-VINTAGE-LEAF-MC_1-22.jpg",
    image2: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/b560228b-ad03-4100-8449-603f81169220-osklen-com-br/assets/images/7551104_TSHIRT-VINTAGE-LEAF-MC_2-23.jpg"
  },
];

const filters = [
  "Ver Tudo", "Camiseta"
];

const ProductCard = ({ product }: { product: Product }) => (
  <div className="flex-shrink-0 snap-start w-[280px] lg:w-[320px]">
    <a href="#" className="block group">
      <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-input">
        <Image
          src={product.image1}
          alt={product.name}
          width={320}
          height={427}
          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
        />
        <Image
          src={product.image2}
          alt={product.name}
          width={320}
          height={427}
          className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />
      </div>
      <div className="mt-4">
        <h3 className="text-sm lg:text-base text-text-secondary leading-tight">{product.name}</h3>
        <p className="text-base lg:text-lg font-semibold text-text-primary mt-1">{product.price}</p>
      </div>
    </a>
  </div>
);

const ProductCarousel = () => {
  return (
    <section className="bg-[#F5F5F5] w-full py-10 lg:py-15">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 xll:px-[30px]">
        <nav aria-label="Breadcrumb" className="text-text-tertiary text-body-sm text-center md:text-left">
          <ol className="inline-flex items-center space-x-1">
            <li className="inline-flex items-center">
              <a href="#" className="hover:text-text-primary">Home</a>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2">/</span>
                <span>Shop All</span>
              </div>
            </li>
          </ol>
        </nav>
        <h2 className="text-2xl md:text-[32px] text-text-secondary font-medium leading-tight text-center max-w-[900px] mx-auto mt-4 mb-8">
          Uma manifestação estética e cultural que celebra o legado dos povos litorâneos e a relação intrínseca entre o homem e o mar.
        </h2>
      </div>

      <div className="mt-8">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-center space-x-2 whitespace-nowrap px-4 sm:px-6 xll:px-[30px]">
            {filters.map((filter, index) => (
              <button
                key={filter}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  index === 0
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-white text-text-primary hover:bg-muted'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex items-start gap-4 lg:gap-6 snap-x snap-mandatory px-4 sm:px-6 xll:px-[30px] pb-2">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
      
      <div className="max-w-lg mx-auto px-4 sm:px-6 xll:px-[30px] mt-8">
          <div className="w-full h-[2px] bg-gray-300 rounded-full">
              <div className="w-2/5 h-full bg-gray-600 rounded-full"></div>
          </div>
      </div>
    </section>
  );
};

export default ProductCarousel;
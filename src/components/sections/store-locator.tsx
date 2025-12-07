"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

const StoreLocator = () => {
  const cities = ["São paulo", "Rio de janeiro", "Belo horizonte", "Ver todas"];

  return (
    <section className="bg-background-secondary py-10 lg:py-[75px]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            {/* Left Column: Content */}
            <div className="lg:col-span-2 p-10 lg:p-14 flex flex-col justify-center">
              <div className="bg-background-secondary rounded-lg p-6 lg:p-8 mb-8">
                <h2 className="text-3xl lg:text-[40px] font-medium text-text-primary mb-6 leading-none tracking-[-0.02em]">
                  Nossas lojas
                </h2>
                <p className="text-base text-text-secondary leading-tight mb-5 tracking-[-0.02em]">
                  Digite seu CEP e descubra a loja Osklen mais próxima de você:
                </p>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="CEP 22271-..."
                    className="w-full h-[50px] bg-white border border-border-light rounded-lg py-3 px-4 text-sm placeholder:text-text-muted focus:ring-1 focus:ring-ring focus:border-ring outline-none"
                  />
                  <button
                    aria-label="Buscar CEP"
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-text-primary"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>

              <div>
                <p className="text-base text-text-secondary tracking-[-0.02em]">
                  82 lojas, 41 Cidades
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  {cities.map((city, index) => (
                    <button
                      key={city}
                      className={`
                        px-4 py-2 rounded-full text-sm font-medium transition-colors h-[38px]
                        ${
                          index === cities.length - 1
                            ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                            : "bg-white border border-border-light text-text-secondary hover:bg-gray-100"
                        }
                      `}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Image */}
            <div className="lg:col-span-3 relative min-h-[300px] md:min-h-[400px] lg:min-h-full">
              <Image
                src="https://images.unsplash.com/photo-1582298539250-e65863215a7a?q=80&w=1974&auto=format&fit=crop"
                alt="Interior de uma loja Osklen com design minimalista, paredes de concreto, roupas brancas e móveis de madeira."
                fill
                sizes="(max-width: 1023px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoreLocator;
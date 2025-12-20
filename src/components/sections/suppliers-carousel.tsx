"use client";

import { useEffect, useRef } from "react";
import { Handshake } from "lucide-react";

import doptexLogo from "@/assets/suppliers/doptex.png";
import jetfioLogo from "@/assets/suppliers/jetfio.png";
import sancrisLogo from "@/assets/suppliers/sancris.png";
import santistaLogo from "@/assets/suppliers/santista.png";
import cedroLogo from "@/assets/suppliers/cedro.png";
import malhariaBrasilLogo from "@/assets/suppliers/malharia-brasil.png";
import tricheLogo from "@/assets/suppliers/triche.png";
import sarcLogo from "@/assets/suppliers/sarc.png";
import zanottiLogo from "@/assets/suppliers/zanotti.png";
import flaksLogo from "@/assets/suppliers/flaks.png";

const suppliers = [
  { name: "Doptex", logo: doptexLogo },
  { name: "Jetfio", logo: jetfioLogo },
  { name: "Sancris", logo: sancrisLogo },
  { name: "Santista Têxtil", logo: santistaLogo },
  { name: "Cedro Têxtil", logo: cedroLogo },
  { name: "Malharia Brasil", logo: malhariaBrasilLogo },
  { name: "Trichê", logo: tricheLogo },
  { name: "Sarc", logo: sarcLogo },
  { name: "Zanotti", logo: zanottiLogo },
  { name: "Flaks", logo: flaksLogo },
];

export default function SuppliersCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let scrollPosition = 0;

    const scroll = () => {
      scrollPosition += 1.2;
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }
      scrollContainer.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    const handleMouseEnter = () => cancelAnimationFrame(animationId);
    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(scroll);
    };

    scrollContainer.addEventListener("mouseenter", handleMouseEnter);
    scrollContainer.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener("mouseenter", handleMouseEnter);
      scrollContainer.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <section className="relative w-full py-12 lg:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Section Header */}
        <div className="text-center mb-8 lg:mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#2e3091]/10 rounded-full mb-3">
            <Handshake className="w-6 h-6 text-[#2e3091]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-medium text-[#2e3091] mb-3">
            Nossos Principais Fornecedores
          </h2>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            Trabalhamos com as melhores marcas do mercado têxtil para garantir qualidade e durabilidade
          </p>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex overflow-hidden gap-6 lg:gap-8"
          style={{ scrollBehavior: "auto" }}
        >
          {/* Duplicate suppliers for infinite scroll effect */}
          {[...suppliers, ...suppliers].map((supplier, index) => (
            <div
              key={`${supplier.name}-${index}`}
              className="flex-shrink-0 flex items-center justify-center w-[140px] h-[80px] lg:w-[180px] lg:h-[100px] bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-300"
            >
              <img
                src={supplier.logo}
                alt={`Logo ${supplier.name}`}
                className="w-full h-full object-contain transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

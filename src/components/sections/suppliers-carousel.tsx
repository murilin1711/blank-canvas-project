"use client";

import { useEffect, useRef } from "react";

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
      scrollPosition += 0.5;
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
    <section className="py-12 lg:py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
            Nossos Principais Fornecedores
          </h2>
          <p className="text-muted-foreground text-sm lg:text-base max-w-2xl mx-auto">
            Trabalhamos com as melhores marcas do mercado têxtil para garantir qualidade e durabilidade em cada peça
          </p>
        </div>

        <div
          ref={scrollRef}
          className="flex overflow-hidden gap-8 lg:gap-12"
          style={{ scrollBehavior: "auto" }}
        >
          {/* Duplicate suppliers for infinite scroll effect */}
          {[...suppliers, ...suppliers].map((supplier, index) => (
            <div
              key={`${supplier.name}-${index}`}
              className="flex-shrink-0 flex items-center justify-center bg-white rounded-xl shadow-sm border border-border/50 p-6 lg:p-8 min-w-[160px] lg:min-w-[200px] h-[100px] lg:h-[120px] hover:shadow-md transition-shadow duration-300"
            >
              <img
                src={supplier.logo}
                alt={`Logo ${supplier.name}`}
                className="max-h-full max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

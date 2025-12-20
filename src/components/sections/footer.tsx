"use client";

import React from "react";

// Logo Goiás Minas (amarela)
const GoiasMinasLogo = () => (
  <svg
    viewBox="0 0 120 50"
    className="h-12 w-auto"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Simplified GM Logo */}
    <path
      d="M10 10 C 10 10, 25 10, 30 25 C 35 40, 10 40, 10 25 C 10 18, 18 12, 25 15"
      stroke="#f0b52d"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M35 10 L 35 40 M 35 10 L 50 25 L 35 25 M 50 25 L 65 10 L 65 40"
      stroke="#f0b52d"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-[#2A2826] font-suisse">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
        {/* Logo */}
        <div className="mb-8">
          <GoiasMinasLogo />
        </div>

        {/* Texto de propriedade intelectual */}
        <p className="text-[#f0b52d] text-sm md:text-base leading-relaxed mb-8 max-w-2xl">
          Todo o conteúdo deste site é de propriedade intelectual da Goiás Minas, incluindo patentes, marcas comerciais e direitos autorais.
        </p>

        {/* Link de privacidade */}
        <a
          href="#"
          className="text-[#f0b52d] text-sm md:text-base hover:underline inline-block mb-12"
        >
          Aviso de privacidade
        </a>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-700">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Goiás Minas
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

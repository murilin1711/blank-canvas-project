"use client";

import React from "react";
import goiasMinasLogo from "@/assets/goias-minas-logo.png";

const Footer = () => {
  return (
    <footer className="bg-[#2A2826] font-suisse">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
        {/* Logo */}
        <div className="mb-8">
          <img src={goiasMinasLogo} alt="Goiás Minas Uniformes" className="h-12 w-auto" />
        </div>

        {/* Texto de propriedade intelectual */}
        <p className="text-[#2e3091] text-sm md:text-base leading-relaxed mb-8 max-w-2xl">
          Todo o conteúdo deste site é de propriedade intelectual da Goiás Minas, incluindo patentes, marcas comerciais e direitos autorais.
        </p>

        {/* Link de privacidade */}
        <a
          href="#"
          className="text-[#2e3091] text-sm md:text-base hover:underline inline-block mb-12"
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

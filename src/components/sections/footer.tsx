"use client";

import React from "react";
import { Link } from "react-router-dom";
import goiasMinasLogo from "@/assets/goias-minas-logo.png";

interface FooterLink {
  label: string;
  href: string;
  isInternal?: boolean;
  isExternal?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const Footer = () => {
  const footerSections: FooterSection[] = [
    {
      title: "Políticas",
      links: [
        { label: "Prazo de entrega", href: "#" },
        { label: "Trocas & Devoluções", href: "#" },
        { label: "Formas de pagamento", href: "#" },
        { label: "Termos e condições", href: "#" },
        { label: "Privacidade & Segurança", href: "#" },
        
      ],
    },
    {
      title: "Minha conta",
      links: [
        { label: "Meus pedidos", href: "/meus-pedidos", isInternal: true },
        { label: "Meus dados", href: "#" },
        { label: "Meu perfil", href: "#" },
      ],
    },
    {
      title: "Fale conosco",
      links: [
        
        { label: "Fale conosco", href: "#" },
      ],
    },
    {
      title: "Redes sociais",
      links: [
        { label: "Instagram", href: "https://www.instagram.com/goiasminas/", isExternal: true },
        { label: "Facebook", href: "https://www.facebook.com/p/Goiás-Minas-Uniformes-100075856991982/", isExternal: true },
        { label: "Email", href: "mailto:suporte@goiasminas.com", isExternal: true },
      ],
    },
  ];

  const linkClassName = "inline-block text-foreground text-sm bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow";

  return (
    <footer className="bg-[#e8e8e8] font-suisse">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 lg:py-20">

        {/* Grid de seções - 2 colunas no topo, 2 embaixo como na referência */}
        <div className="space-y-12">
          {/* Primeira linha: Políticas e Redes sociais (substituindo Osklen) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Políticas */}
            <div>
              <h3 className="text-foreground font-semibold text-base mb-4">
                Políticas
              </h3>
              <div className="flex flex-wrap gap-2">
                {footerSections[0].links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className={linkClassName}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Redes sociais */}
            <div>
              <h3 className="text-foreground font-semibold text-base mb-4">
                Redes sociais
              </h3>
              <div className="flex flex-wrap gap-2">
                {footerSections[3].links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.isExternal ? "_blank" : undefined}
                    rel={link.isExternal ? "noopener noreferrer" : undefined}
                    className={linkClassName}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Segunda linha: Minha conta e Fale conosco */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Minha conta */}
            <div>
              <h3 className="text-foreground font-semibold text-base mb-4">
                Minha conta
              </h3>
              <div className="flex flex-wrap gap-2">
                {footerSections[1].links.map((link) => (
                  link.isInternal ? (
                    <Link
                      key={link.label}
                      to={link.href}
                      className={linkClassName}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.label}
                      href={link.href}
                      className={linkClassName}
                    >
                      {link.label}
                    </a>
                  )
                ))}
              </div>
            </div>

            {/* Fale conosco */}
            <div>
              <h3 className="text-foreground font-semibold text-base mb-4">
                Fale conosco
              </h3>
              <div className="flex flex-wrap gap-2">
                {footerSections[2].links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className={linkClassName}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra inferior com informações da empresa */}
      <div className="bg-[#d4d4d4] rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6">
          <p className="text-muted-foreground text-xs md:text-sm text-center leading-relaxed">
            Goiás Minas Uniformes Ind. e Com.de Unif. Esc. e Emp. S/A CNPJ 01.184.449/0001-10 Rua Guimarães Natal, 50. Setor Central. GO Brasil. CEP 75040030.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

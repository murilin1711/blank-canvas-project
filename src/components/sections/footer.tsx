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
        { label: "Ética e Sustentabilidade", href: "#" },
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
        { label: "Central de atendimento", href: "#" },
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

  return (
    <footer className="bg-secondary font-suisse">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 lg:py-16">
        {/* Logo */}
        <div className="mb-10">
          <img src={goiasMinasLogo} alt="Goiás Minas Uniformes" className="h-24 md:h-28 w-auto" />
        </div>

        {/* Grid de seções */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-foreground font-medium text-sm mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.isInternal ? (
                      <Link
                        to={link.href}
                        className="inline-block text-muted-foreground text-sm bg-background/60 px-3 py-1.5 rounded-full hover:bg-background hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target={link.isExternal ? "_blank" : undefined}
                        rel={link.isExternal ? "noopener noreferrer" : undefined}
                        className="inline-block text-muted-foreground text-sm bg-background/60 px-3 py-1.5 rounded-full hover:bg-background hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Barra inferior com informações da empresa */}
      <div className="bg-muted border-t border-border">
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

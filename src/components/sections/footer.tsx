"use client";

import React from "react";

const OsklenLogoWhite = () => (
  <svg
    role="img"
    aria-label="Osklen"
    width="107"
    height="25"
    viewBox="0 0 107 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-white h-3 w-auto"
  >
    <title>Osklen</title>
    <path
      d="M10.1543 0.6875H5.03125V11.0156H10.1543V8.71875H7.57617V6.9375H10.0293V4.76562H7.57617V2.98438H10.1543V0.6875Z"
      fill="currentColor"
    ></path>
    <path
      d="M21.9961 0.6875L18.7305 11.0156H16.0977L15.3574 8.21875L13.0605 11.0156H10.4277L13.7109 5.84375L10.5918 0.6875H13.252L14.7324 3.78125L16.2793 0.6875H21.9961ZM17.1504 5.96875L15.0137 0.953125L13.252 5.09375L15.2285 10.6094L17.1504 5.96875Z"
      fill="currentColor"
    ></path>
    <path
      d="M29.5695 0.6875L26.3039 11.0156H23.6711L22.9309 8.21875L20.634 11.0156H18.0012L21.2844 5.84375L18.1652 0.6875H20.8254L22.3059 3.78125L23.8527 0.6875H29.5695ZM24.7238 5.96875L22.5871 0.953125L20.8254 5.09375L22.8019 10.6094L24.7238 5.96875Z"
      fill="currentColor"
    ></path>
    <path d="M39.6977 11.0156V0.6875H37.0024V11.0156H39.6977Z" fill="currentColor"></path>
    <path
      d="M51.9863 0.6875L47.0176 11.0156H44.1738L48.4355 2.15625L42.791 0.6875V0.6875L51.9863 0.6875Z"
      fill="currentColor"
    ></path>
    <path
      d="M57.1709 0.6875H64.085V2.85938H59.8662V4.76562H63.6064V6.9375H59.8662V8.71875H64.2129V11.0156H57.1709V0.6875Z"
      fill="currentColor"
    ></path>
    <path
      d="M74.8821 5.85938C74.8821 7.20312 74.345 8.28125 73.2708 9.09375C72.1966 9.90625 70.8431 10.3125 69.2102 10.3125C67.5774 10.3125 66.2239 9.90625 65.1497 9.09375C64.0755 8.28125 63.5384 7.20312 63.5384 5.85938C63.5384 4.51562 64.0755 3.4375 65.1497 2.625C66.2239 1.8125 67.5774 1.40625 69.2102 1.40625C70.8431 1.40625 72.1966 1.8125 73.2708 2.625C74.345 3.4375 74.8821 4.51562 74.8821 5.85938ZM66.3098 5.85938C66.3098 6.64062 66.6008 7.28125 67.1829 7.78125C67.7649 8.28125 68.4593 8.53125 69.2649 8.53125C70.0706 8.53125 70.7649 8.28125 71.347 7.78125C71.929 7.28125 72.22 6.64062 72.22 5.85938C72.22 5.07812 71.929 4.4375 71.347 3.9375C70.7649 3.4375 70.0706 3.1875 69.2649 3.1875C68.4593 3.1875 67.7649 3.4375 67.1829 3.9375C66.6008 4.4375 66.3098 5.07812 66.3098 5.85938Z"
      fill="currentColor"
    ></path>
    <path
      d="M87.3571 0.6875H82.234V11.0156H87.3571V8.71875H84.7789V6.9375H87.2321V4.76562H84.7789V2.98438H87.3571V0.6875Z"
      fill="currentColor"
    ></path>
    <path
      d="M93.3039 11.0156H90.8117L87.8937 0.6875H90.5901L92.0832 7.64062L93.5939 0.6875H96.1125L94.6193 7.64062L96.1125 0.6875H98.8088L95.8908 11.0156H93.3039Z"
      fill="currentColor"
    ></path>
    <path
      d="M106.335 5.85938L103.585 0.6875H100.722L103.858 5.85938L100.722 11.0156H103.585L106.335 5.85938Z"
      fill="currentColor"
    ></path>
  </svg>
);

const footerLinks = {
  osklen: [
    { text: "institucional", href: "#" },
    { text: "sustentabilidade", href: "#" },
    { text: "lojas", href: "#" },
    { text: "e-brigade", href: "#" },
  ],
  politicas: [
    { text: "trocas e devoluções", href: "#" },
    { text: "ajuda", href: "#" },
    { text: "termos & condições", href: "#" },
    { text: "política de privacidade", href: "#" },
  ],
  minhaConta: [
    { text: "meus pedidos", href: "#" },
    { text: "status do pedido", href: "#" },
    { text: "meus dados", href: "#" },
  ],
  faleConosco: [
    { text: "White Mood", href: "#" },
    { text: "Personal Shopper", href: "#" },
    { text: "SAC", href: "#" },
    { text: "Acessibilidade", href: "#" },
  ],
};

const FooterColumn = ({ title, links }: { title: string; links: { text: string; href: string }[] }) => (
  <div>
    <h3 className="font-medium text-[15px] lowercase mb-6 text-white">{title}</h3>
    <ul className="space-y-4">
      {links.map((link) => (
        <li key={link.text}>
          <a
            href={link.href}
            className="text-sm text-[#B3B3B3] hover:text-white capitalize transition-colors leading-loose"
          >
            {link.text}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  return (
    <footer className="bg-[#2A2826] font-suisse">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-y-12 gap-x-8">
          <div>
            <h3 className="font-medium text-[15px] lowercase mb-6 text-white">osklen</h3>
            <ul className="flex flex-col space-y-4">
              {footerLinks.osklen.map((link) => (
                <li key={link.text}>
                  <a
                    href={link.href}
                    className="text-sm text-[#B3B3B3] hover:text-white capitalize transition-colors leading-loose"
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <FooterColumn title="políticas" links={footerLinks.politicas} />
          <FooterColumn title="minha conta" links={footerLinks.minhaConta} />
          <FooterColumn title="fale conosco" links={footerLinks.faleConosco} />

          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-medium text-[15px] lowercase mb-6 text-white">Community</h3>
            <p className="text-sm font-medium text-white mb-2">Assine nossa Newsletter</p>
            <p className="text-xs text-[#B3B3B3] max-w-[200px] leading-snug mb-4">
              Cadastre-se e receba 10% off na 1ª compra online
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex">
              <input
                type="email"
                placeholder="Seu e-mail"
                className="w-full text-sm bg-transparent border border-white rounded-l-lg rounded-r-none px-4 py-3 text-white placeholder:text-[#B3B3B3] focus:outline-none focus:ring-1 focus:ring-white"
              />
              <button
                type="submit"
                aria-label="Submit email for newsletter"
                className="bg-white text-[#2A2826] px-4 rounded-r-lg rounded-l-none text-2xl font-light hover:bg-gray-200 transition-colors"
                style={{ lineHeight: "1" }}
              >
                →
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 lg:mt-20 pt-8 border-t border-gray-700 flex flex-col lg:flex-row justify-between items-center gap-6 text-[#B3B3B3]">
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-8">
            <OsklenLogoWhite />
            <p className="text-xs text-center lg:text-left">
              Osklen {new Date().getFullYear()}. Todos os direitos reservados.
            </p>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-3">
              <span>Instagram</span>
              <span>Facebook</span>
              <span>Youtube</span>
            </div>
            <div className="flex items-center gap-3 uppercase">
              <span>Amex</span>
              <span>Mastercard</span>
              <span>Visa</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

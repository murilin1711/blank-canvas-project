'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, User, Heart, ShoppingCart, Menu, X } from 'lucide-react';
import Image from 'next/image';

const Header = () => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState<string | null>(null);

  const navItems = ["Escolas", "Empresas", "Personalizadas", "Sobre", "FAQ"];

  useEffect(() => {
    const handleScroll = () => {
      const bannerHeight = window.innerHeight;
      setIsScrolled(window.scrollY > bannerHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* White background header */}
      <div className={`fixed top-0 left-0 right-0 bg-white z-40 transition-opacity duration-300 !w-full !h-[79px] ${isScrolled ? 'opacity-0' : 'opacity-100'}`} />

      <header className="fixed w-full z-50">
        {/* Desktop Header */}
        <div className="hidden lg:flex fixed top-0 left-0 right-0 h-[80px] items-center z-50">
          <div className="w-full h-full flex items-center justify-between px-8 xl:px-12 2xl:px-16">
            {/* Left Navigation */}
            <div className="flex items-center">
              <nav className="bg-white/50 backdrop-blur-md rounded-xl h-[40px] items-center shadow-sm flex">
                <ul className="flex items-center gap-1 px-2">
                  {navItems.map((item) => (
                    <li key={item} className="relative group">
                      {item === "Sobre" ? (
                        <Link
                          href="/sobre"
                          className="font-suisse font-normal text-[14px] -tracking-[0.02em] text-black hover:bg-white/80 h-[34px] px-3 rounded-lg transition-all duration-300 whitespace-nowrap group-hover:scale-105 group-hover:shadow-sm"
                        >
                          {item}
                        </Link>
                      ) : (
                        <button
                          onMouseEnter={() => setActiveSubmenu(item)}
                          className="font-suisse font-normal text-[14px] -tracking-[0.02em] text-black hover:bg-white/80 h-[34px] px-3 rounded-lg transition-all duration-300 whitespace-nowrap group-hover:scale-105 group-hover:shadow-sm"
                        >
                          {item}
                        </button>
                      )}
                      <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-[#2e3091] opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-x-0 group-hover:scale-x-100" />
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Center Logo */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Link href="/" aria-label="Ir para a página inicial/home">
                <div className="flex items-center justify-center">
                  <Image
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/ROTEIRO_EUROPA-removebg-preview-1765225025878.png"
                    alt="Goiás Minas Uniformes Logo"
                    width={320}
                    height={170}
                    className="object-contain !w-auto !h-[120px] transition-transform duration-300 hover:scale-105"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative group">
                <div className={`h-[38px] bg-white/50 backdrop-blur-md rounded-lg shadow-sm transition-all duration-300 ${searchOpen ? 'w-[180px] xl:w-[200px]' : 'w-[90px] xl:w-[100px]'} overflow-hidden group-hover:shadow-md group-hover:scale-105`}>
                  {searchOpen ? (
                    <div className="flex items-center h-full px-3 gap-2">
                      <input
                        type="text"
                        placeholder="Buscar..."
                        autoFocus
                        className="flex-1 bg-transparent border-none outline-none text-[13px] font-suisse text-black placeholder:text-gray-500"
                        onBlur={() => setSearchOpen(false)}
                      />
                      <Search className="w-[14px] h-[14px] text-black flex-shrink-0" />
                    </div>
                  ) : (
                    <button onClick={() => setSearchOpen(true)} className="w-full h-full flex items-center justify-between px-3">
                      <span className="font-suisse font-normal text-[13px] tracking-[-0.02em] text-black">Buscar</span>
                      <Search className="w-[14px] h-[14px] text-black transition-transform duration-300 group-hover:scale-110" />
                    </button>
                  )}
                </div>
              </div>

              {/* Account */}
              <a href="/my-account" aria-label="Log in" className="relative group font-suisse flex items-center justify-center w-[38px] h-[38px] text-black bg-white/50 backdrop-blur-md rounded-lg shadow-sm hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-md">
                <User className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Minha Conta
                </span>
              </a>

              {/* Wishlist */}
              <a href="/wishlist" aria-label="Wishlist" className="relative group font-suisse flex items-center justify-center w-[38px] h-[38px] text-black bg-white/50 backdrop-blur-md rounded-lg shadow-sm hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-md">
                <Heart className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Favoritos
                </span>
              </a>

              {/* Cart */}
              <button aria-label="open cart" className="relative group font-suisse flex items-center justify-center gap-2 h-[38px] bg-white/50 backdrop-blur-md rounded-lg text-black px-4 shadow-sm hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-md whitespace-nowrap">
                <span className="text-[13px] font-normal tracking-[-0.02em]">Carrinho</span>
                <ShoppingCart className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#2e3091] text-white text-[10px] rounded-full flex items-center justify-center">
                  0
                </div>
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Ver Carrinho
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-[80px] flex items-center justify-between px-4">
          <div className="flex items-center gap-2 z-50">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu" className="w-[48px] h-[48px] flex items-center justify-center bg-white/50 backdrop-blur-md rounded-full shadow-sm hover:scale-105 transition-transform duration-300">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <button onClick={() => setSearchOpen(!searchOpen)} aria-label="Buscar" className="w-[48px] h-[48px] flex items-center justify-center bg-white/50 backdrop-blur-md rounded-full shadow-sm hover:scale-105 transition-transform duration-300">
              <Search size={20} />
            </button>
          </div>

          <Link href="/" aria-label="Ir para a página inicial/home" className="absolute left-1/2 -translate-x-1/2 z-40">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/ROTEIRO_EUROPA-removebg-preview-1765225025878.png"
              alt="Goiás Minas Uniformes Logo"
              width={120}
              height={120}
              className="object-contain w-[120px] h-[120px]"
              priority
            />
          </Link>

          <div className="flex items-center gap-2 z-50">
            <button aria-label="Carrinho" className="relative w-[48px] h-[48px] flex items-center justify-center bg-white/50 backdrop-blur-md rounded-full shadow-sm hover:scale-105 transition-transform duration-300">
              <ShoppingCart size={20} />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#2e3091] text-white text-[10px] rounded-full flex items-center justify-center">
                0
              </div>
            </button>
            <a href="/my-account" aria-label="Perfil" className="w-[48px] h-[48px] flex items-center justify-center bg-white/50 backdrop-blur-md rounded-full shadow-sm hover:scale-105 transition-transform duration-300">
              <User size={20} />
            </a>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 pt-[80px]">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative bg-white/95 backdrop-blur-xl w-full max-w-sm mx-auto rounded-b-3xl shadow-2xl p-6">
              <nav>
                <ul className="space-y-4">
                  {navItems.map((item) => (
                    <li key={item}>
                      {item === "Sobre" ? (
                        <Link
                          href="/sobre"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block font-suisse text-[16px] font-medium text-black py-3 px-4 rounded-lg hover:bg-white/80 transition-colors duration-300 hover:scale-105 hover:shadow-sm w-full text-left"
                        >
                          {item}
                        </Link>
                      ) : item === "Escolas" ? (
                        <>
                          <button
                            onClick={() =>
                              setMobileSubmenuOpen(
                                mobileSubmenuOpen === "Escolas" ? null : "Escolas"
                              )
                            }
                            className="block w-full text-left font-suisse text-[16px] font-medium text-black py-3 px-4 rounded-lg hover:bg-white/80 transition-colors duration-300 flex justify-between items-center"
                          >
                            {item}
                            <span className="ml-2">{mobileSubmenuOpen === "Escolas" ? "▲" : "▼"}</span>
                          </button>

                          {mobileSubmenuOpen === "Escolas" && (
                            <ul className="pl-6 mt-2 space-y-2">
                              <li>
                                <Link
                                  href="/escolas/colegio-militar"
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="block text-[#2e3091] font-bold text-[15px] hover:underline"
                                >
                                  Colégio Militar
                                </Link>
                              </li>
                            </ul>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => setMobileMenuOpen(false)}
                          className="block font-suisse text-[16px] font-medium text-black py-3 px-4 rounded-lg hover:bg-white/80 transition-colors duration-300 hover:scale-105 hover:shadow-sm w-full text-left"
                        >
                          {item}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        )}

        {/* Submenu Overlay Desktop */}
        <div
          id="submenu"
          data-menu-open={activeSubmenu !== null && activeSubmenu !== "Sobre"}
          onMouseEnter={() => { if (activeSubmenu !== null && activeSubmenu !== "Sobre") setActiveSubmenu(activeSubmenu); }}
          onMouseLeave={() => setActiveSubmenu(null)}
          className="hidden lg:block absolute top-20 left-8 xl:left-12 2xl:left-16 right-8 xl:right-12 2xl:right-16 rounded-xl bg-white/[0.85] backdrop-blur-[20px] opacity-0 max-h-0 data-[menu-open=true]:opacity-100 data-[menu-open=true]:max-h-96 overflow-hidden transition-[max-height,opacity] duration-300 ease-[cubic-bezier(.16,1,.3,1)] shadow-xl z-[55] border border-white/20"
        >
          <div className="grid h-full grid-cols-1 grid-rows-1">
            {navItems.map((item) => (
              <div
                key={item}
                data-active={activeSubmenu === item}
                className="col-start-1 row-start-1 h-full min-h-[300px] pt-20 p-8 transition-opacity duration-200 opacity-0 pointer-events-none data-[active=true]:opacity-100 data-[active=true]:pointer-events-auto"
              >
                {item === "Escolas" ? (
                  <div className="flex flex-col items-center gap-4">
                    <Link
                      href="/escolas/colegio-militar"
                      className="text-[#2e3091] font-bold text-lg hover:underline"
                    >
                      Colégio Militar
                    </Link>
                  </div>
                ) : (
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold text-[#2e3091] mb-4">{item}</h3>
                    <p className="text-gray-600">Conteúdo do submenu para {item}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;

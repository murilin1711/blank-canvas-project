'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, User, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import Image from 'next/image';

const Header = () => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navItems = ["Escolas", "Empresas", "Personalizadas", "Shoes", "Gifts", "Outlet"];

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
      {/* White background for header area - only show when not scrolled */}
      <div className={`fixed top-0 left-0 right-0 h-[80px] bg-white z-40 transition-opacity duration-300 ${isScrolled ? 'opacity-0' : 'opacity-100'}`} />
      
      <header className="fixed w-full z-50">
        {/* Desktop Logo - Center, aligned with nav height */}
        <Link href="/" aria-label="Ir para a página inicial/home">
          <div className="fixed left-1/2 -translate-x-1/2 top-[25px] z-[9990] hidden lg:flex items-center justify-center h-[40px]">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/ROTEIRO_EUROPA-removebg-preview-1765225025878.png"
              alt="Goiás Minas Uniformes Logo"
              width={880}
              height={670}
              className="object-contain !w-full !h-[116px] !max-w-full"
              priority />
          </div>
        </Link>

        {/* Mobile Logo */}
        <Link href="/" aria-label="Ir para a página inicial/home">
          <div className="w-[200px] h-[50px] relative">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/ROTEIRO_EUROPA-removebg-preview-1765225025878.png"
              alt="Goiás Minas Uniformes Logo"
              width={70}
              height={43}
              className="absolute top-0 left-0 mt-5 mb-5 ml-1 lg:hidden rounded-full"
              priority />
          </div>
        </Link>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden absolute right-0 w-[calc(100%-5.625rem)] h-[43px] my-5 mr-1.5 flex items-center justify-between bg-white/50 backdrop-blur-md rounded-full shadow-sm">
          <button className="font-suisse pr-2 py-1 text-[13px] text-black ml-10">Menu</button>
          
          <div className="flex items-center ml-auto gap-5 h-[43px]">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="font-suisse text-[13px] -tracking-0.02 text-black flex items-center gap-1">
              <span>Buscar</span>
              <Search size={16} />
            </button>
            <button aria-label="open cart" className="font-suisse z-10 flex items-center justify-center gap-1 w-12 h-7 text-[13px] rounded-lg text-black -tracking-0.02">
              <ShoppingBag className="w-5 h-5 -mt-px" />
            </button>
          </div>
        </div>

        {/* Desktop: Left Navigation Section (Floating) - aligned with logo */}
        <div
          className="hidden lg:block absolute left-0 top-[25px] mx-[15px] xll:mx-[30px] z-[60]"
          onMouseLeave={() => setActiveSubmenu(null)}>
          <nav className="flex bg-white/50 backdrop-blur-md rounded-xl px-1 h-[40px] items-center shadow-sm">
            <ul className="flex flex-row items-center gap-1.5">
              {navItems.map((item) =>
              <li key={item} className="flex">
                  <button
                  onMouseEnter={() => setActiveSubmenu(item)}
                  className="font-suisse font-normal text-[15px] -tracking-[0.02em] text-black hover:bg-white/80 h-[34px] px-1.5 xll:px-2.5 rounded-lg transition-colors duration-200 !whitespace-pre-line !whitespace-pre-line !whitespace-pre-line">
                    {item}
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>

        {/* Desktop: Right Action Buttons (Floating) - aligned with logo */}
        <div className="hidden lg:flex absolute right-0 top-[25px] mx-[15px] xll:mx-[30px] items-center gap-1 z-[60]">
          {/* Search */}
          <div className="relative">
            <div
              className={`h-[38px] bg-white/50 backdrop-blur-md rounded-lg shadow-sm transition-all duration-300 ${
              searchOpen ? 'w-[220px] xl:w-[280px]' : 'w-[94px] xl:w-[120px]'} overflow-hidden`
              }>
              {searchOpen ?
              <div className="flex items-center h-full px-3 gap-2">
                  <input
                  type="text"
                  placeholder="Buscar..."
                  autoFocus
                  className="flex-1 bg-transparent border-none outline-none text-[14px] font-suisse text-black placeholder:text-gray-500"
                  onBlur={() => setSearchOpen(false)} />
                  <Search className="w-[16px] h-[16px] text-black flex-shrink-0" />
                </div> :
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full h-full flex items-center justify-between px-2">
                <span className="font-suisse font-normal text-[15px] tracking-[-0.02em] text-black">Buscar</span>
                <Search className="w-[16px] h-[16px] text-black" />
              </button>
              }
          </div>
        </div>

        {/* Account */}
        <a href="/my-account" aria-label="Log in" className="font-suisse flex items-center justify-center w-[38px] h-[38px] p-[4px_6px] 4xl:px-[7px] text-black bg-white/50 backdrop-blur-md rounded-lg shadow-sm">
          <User className="w-5 h-5 4xl:w-[18px] 4xl:h-[18px]" />
        </a>

        {/* Wishlist */}
        <a href="/wishlist" aria-label="Wishlist" className="font-suisse flex items-center justify-center w-[38px] h-[38px] p-[4px_6px] text-black bg-white/50 backdrop-blur-md rounded-lg shadow-sm">
          <Heart className="w-5 h-5 4xl:w-[18px] 4xl:h-[18px]" />
        </a>

        {/* Bag */}
        <button aria-label="open cart" className="font-suisse z-10 flex items-center justify-center gap-1 lm:w-[85px] h-[38px] text-[15px] bg-white/50 backdrop-blur-md rounded-lg text-black -tracking-0.02 px-2 shadow-sm">
          <span>Bag</span>
          <ShoppingBag className="w-5 h-5 -mt-px" />
        </button>
      </div>

      {/* Submenu Overlay */}
      <div
          id="submenu"
          data-menu-open={activeSubmenu !== null}
          onMouseEnter={() => {
            // Keep submenu open when mouse is over it
            if (activeSubmenu !== null) {
              setActiveSubmenu(activeSubmenu);
            }
          }}
          onMouseLeave={() => setActiveSubmenu(null)}
          className="absolute top-5 left-[5.5px] right-[5.5px] lg:left-[15px] lg:right-[15px] xll:left-[30px] xll:right-[30px] lg:w-[calc(100vw_-_1.9rem)] xll:w-[calc(100vw_-_3.75rem)] 5xl:w-[calc(100vw_-_4rem)] rounded-3xl md:rounded-xl bg-white/[0.7] opacity-0 max-h-0 data-[menu-open=true]:opacity-100 data-[menu-open=true]:lg:max-h-96 data-[menu-open=true]:backdrop-blur-[20px] overflow-hidden transition-[max-height,opacity] duration-300 ease-[cubic-bezier(.16,1,.3,1)] h-auto shadow-lg z-[55]"
          style={{
            transition: activeSubmenu !== null ?
            'all 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0s' :
            'all 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.03s 0.27s'
          }}>
        <div className="grid h-full grid-cols-1 grid-rows-1">
          {navItems.map((item) =>
            <div
              key={item}
              data-active={activeSubmenu === item}
              className="col-start-1 row-start-1 h-full min-h-[384px] pt-24 lg:pt-28 p-8 transition-opacity duration-200 opacity-0 pointer-events-none data-[active=true]:opacity-100 data-[active=true]:pointer-events-auto">
              {/* Placeholder for submenu content */}
            </div>
            )}
        </div>
      </div>
    </header>
    </>);

};

export default Header;
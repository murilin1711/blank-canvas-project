"use client";

import { useState } from "react";
import Link from 'next/link';
import { Search, User, Heart, ShoppingBag } from 'lucide-react';

const OsklenBrandLogo = () => {
  // The SVG path data wjas missing in the scrape. As per instructions,
  // this is a fallback that renders the brand name as SVG text,
  // which behaves correctly with scaling and blend modes.
  return (
    <svg role="img" className="w-full h-full" viewBox="0 0 88 10">
      <title>Osklen</title>
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fontFamily="var(--font-suisse, sans-serif)" fontSize="10" fontWeight="500" letterSpacing="1" fill="currentColor">
        OSKLEN
      </text>
    </svg>
  );
};

const Header = () => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const navItems = ["Réveillon", "Men", "Women", "Shoes", "Gifts", "Outlet"];

  return (
    <div onMouseLeave={() => setActiveSubmenu(null)}>
      {/* Desktop Center Logo */}
      <div className="fixed z-[9990] left-1/2 top-[calc(1.85rem+4px)] -translate-x-1/2 scale-[1.2] hidden lg:flex items-center justify-center h-[27px]">
        <Link href="/" aria-label="Ir para a página inicial/home">
          <div className="w-[87.49px] h-[9.99px] text-white mix-blend-difference">
            <OsklenBrandLogo />
          </div>
        </Link>
      </div>

      <header className="fixed w-full z-50 overscroll-contain">
        <div className="sticky z-50 top-0 h-0">
          <div
            data-expanded={activeSubmenu !== null}
            className="absolute w-full h-screen bg-[#555555]/40 opacity-0 pointer-events-none data-[expanded=true]:pointer-events-auto data-[expanded=true]:opacity-100 backdrop-blur-md md:backdrop-blur-0 transition-opacity"
          />
          <div className="relative z-50 top-0 h-0">
            {/* Mobile Logo */}
            <div className="absolute top-0 left-0 mt-5 ml-1 z-20 lg:hidden">
              <Link href="/" aria-label="Ir para a página inicial/home">
                <div className="w-[43px] h-[43px] bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center p-2.5 shadow-sm">
                  <OsklenBrandLogo />
                </div>
              </Link>
            </div>

            {/* Mobile Navigation Bar */}
            <div className="lg:hidden absolute right-0 w-[calc(100%-3.625rem)] h-[43px] my-5 mr-1.5 flex items-center justify-between bg-white/50 backdrop-blur-md rounded-full shadow-sm">
              <button className="font-suisse pr-2 py-1 text-[13px] text-black ml-10">Menu</button>
              
              <div className="flex items-center ml-auto gap-5 h-[43px]">
                <button 
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="font-suisse text-[13px] -tracking-0.02 text-black flex items-center gap-1"
                >
                  <span>Buscar</span>
                  <Search size={16} />
                </button>
                <button aria-label="open cart" className="font-suisse z-10 flex items-center justify-center gap-1 w-12 h-7 text-[13px] rounded-lg text-black -tracking-0.02">
                  <ShoppingBag className="w-5 h-5 -mt-px" />
                </button>
              </div>
            </div>

            {/* Desktop: Left Navigation Section (Floating) */}
            <div className="hidden lg:block absolute left-0 my-5 mx-[15px] xll:mx-[30px]">
              <nav className="flex bg-white/50 backdrop-blur-md rounded-xl px-1 h-[30px] items-center shadow-sm">
                <ul className="flex flex-row items-center gap-1.5">
                  {navItems.map((item) => (
                    <li key={item} className="flex">
                      <button
                        onMouseEnter={() => setActiveSubmenu(item)}
                        className="font-suisse font-normal text-[15px] -tracking-[0.02em] text-black hover:bg-white/80 h-[26px] px-1.5 xll:px-2.5 rounded-lg transition-colors duration-200"
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Desktop: Right Action Buttons (Floating) */}
            <div className="hidden lg:flex absolute right-0 my-5 mx-[15px] xll:mx-[30px] items-center gap-1">
              {/* Search */}
              <div className="relative">
                <div 
                  className={`h-[28px] bg-white/50 backdrop-blur-md rounded-lg shadow-sm transition-all duration-300 ${
                    searchOpen ? 'w-[220px] xl:w-[280px]' : 'w-[94px] xl:w-[120px]'
                  } overflow-hidden`}
                >
                  {searchOpen ? (
                    <div className="flex items-center h-full px-3 gap-2">
                      <input
                        type="text"
                        placeholder="Buscar..."
                        autoFocus
                        className="flex-1 bg-transparent border-none outline-none text-[14px] font-suisse text-black placeholder:text-gray-500"
                        onBlur={() => setSearchOpen(false)}
                      />
                      <Search className="w-[16px] h-[16px] text-black flex-shrink-0" />
                    </div>
                  ) : (
                    <button 
                      onClick={() => setSearchOpen(true)}
                      className="w-full h-full flex items-center justify-between px-2"
                    >
                      <span className="font-suisse font-normal text-[15px] tracking-[-0.02em] text-black">Buscar</span>
                      <Search className="w-[16px] h-[16px] text-black" />
                    </button>
                  )}
                </div>
              </div>

              {/* Account */}
              <a href="/my-account" aria-label="Log in" className="font-suisse flex items-center justify-center w-[32px] h-[28px] p-[4px_6px] 4xl:px-[7px] text-black bg-white/50 backdrop-blur-md rounded-lg shadow-sm">
                <User className="w-5 h-5 4xl:w-[18px] 4xl:h-[18px]" />
              </a>

              {/* Wishlist */}
              <a href="/wishlist" aria-label="Wishlist" className="font-suisse flex items-center justify-center w-[32px] h-[28px] p-[4px_6px] text-black bg-white/50 backdrop-blur-md rounded-lg shadow-sm">
                <Heart className="w-5 h-5 4xl:w-[18px] 4xl:h-[18px]" />
              </a>

              {/* Bag */}
              <button aria-label="open cart" className="font-suisse z-10 flex items-center justify-center gap-1 lm:w-[67px] h-[28px] text-[15px] bg-white/50 backdrop-blur-md rounded-lg text-black -tracking-0.02 px-2 shadow-sm">
                <span>Bag</span>
                <ShoppingBag className="w-5 h-5 -mt-px" />
              </button>
            </div>

            {/* Submenu Overlay */}
            <div
              id="submenu"
              data-menu-open={activeSubmenu !== null}
              className="absolute top-5 left-[5.5px] right-[5.5px] lg:left-[15px] lg:right-[15px] xll:left-[30px] xll:right-[30px] lg:w-[calc(100vw_-_1.9rem)] xll:w-[calc(100vw_-_3.75rem)] 5xl:w-[calc(100vw_-_4rem)] rounded-3xl md:rounded-xl bg-white/[0.7] opacity-0 max-h-0 data-[menu-open=true]:opacity-100 data-[menu-open=true]:lg:max-h-96 data-[menu-open=true]:backdrop-blur-[20px] overflow-hidden transition-[max-height,opacity] duration-300 ease-[cubic-bezier(.16,1,.3,1)] h-auto shadow-lg"
              style={{
                transition: activeSubmenu !== null
                  ? 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0s'
                  : 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.03s 0.27s',
              }}
            >
              <div className="grid h-full grid-cols-1 grid-rows-1">
                {navItems.map((item) => (
                  <div
                    key={item}
                    data-active={activeSubmenu === item}
                    className="col-start-1 row-start-1 h-full min-h-[384px] pt-16 lg:pt-20 p-8 transition-opacity duration-200 opacity-0 pointer-events-none data-[active=true]:opacity-100 data-[active=true]:pointer-events-auto"
                  >
                    {/* Placeholder for submenu content */}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
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
  const navItems = ["Escolas", "Empresas", "Personalizadas", "Sobre", "FAQ", ""];

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
      <div className={`fixed top-0 left-0 right-0 bg-white z-40 transition-opacity duration-300 !w-full !h-[79px] ${isScrolled ? 'opacity-0' : 'opacity-100'}`} />
      
      <header className="fixed w-full z-50">
        {/* Desktop Header Container */}
        <div className="hidden lg:flex fixed top-0 left-0 right-0 h-[80px] items-center justify-between px-[30px] xll:px-[60px] z-50">
          {/* Left Navigation */}
          <div
            className="flex-1 flex items-center justify-start !text-left !px-0 !m-0 !p-0"
            onMouseLeave={() => setActiveSubmenu(null)}>

            <nav className="flex bg-white/50 backdrop-blur-md rounded-xl h-[40px] items-center shadow-sm !px-px">
              <ul className="flex flex-row items-center gap-2">
                {navItems.map((item) =>
                item ?
                <li key={item} className="flex !px-0.5">
                      <button
                    onMouseEnter={() => setActiveSubmenu(item)}
                    className="font-suisse font-normal text-[14px] -tracking-[0.02em] text-black hover:bg-white/80 h-[34px] px-3 rounded-lg transition-colors duration-200">

                        {item}
                      </button>
                    </li> :
                null
                )}
              </ul>
            </nav>
          </div>

          {/* Center Logo */}
          <div className="flex-shrink-0 mx-8">
            <Link href="/" aria-label="Ir para a página inicial/home">
              <div className="flex items-center justify-center h-[40px]">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/ROTEIRO_EUROPA-removebg-preview-1765225025878.png"
                  alt="Goiás Minas Uniformes Logo"
                  width={200}
                  height={60}
                  className="object-contain !mx-0 !px-0 !w-full !h-[125px] !max-w-full"
                  priority />

              </div>
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex-1 flex items-center justify-end gap-2">
            {/* Search */}
            <div className="relative">
              <div
                className={`h-[38px] bg-white/50 backdrop-blur-md rounded-lg shadow-sm transition-all duration-300 ${
                searchOpen ? 'w-[180px] xl:w-[220px]' : 'w-[90px] xl:w-[110px]'} overflow-hidden`
                }>

                {searchOpen ?
                <div className="flex items-center h-full px-3 gap-2">
                    <input
                    type="text"
                    placeholder="Buscar..."
                    autoFocus
                    className="flex-1 bg-transparent border-none outline-none text-[13px] font-suisse text-black placeholder:text-gray-500"
                    onBlur={() => setSearchOpen(false)} />

                    <Search className="w-[14px] h-[14px] text-black flex-shrink-0" />
                  </div> :

                <button
                  onClick={() => setSearchOpen(true)}
                  className="w-full h-full flex items-center justify-between px-3">

                    <span className="font-suisse font-normal text-[13px] tracking-[-0.02em] text-black">Buscar</span>
                    <Search className="w-[14px] h-[14px] text-black" />
                  </button>
                }
              </div>
            </div>

            {/* Account */}
            <a
              href="/my-account"
              aria-label="Log in"
              className="font-suisse flex items-center justify-center w-[38px] h-[38px] text-black bg-white/50 backdrop-blur-md rounded-lg shadow-sm hover:bg-white/80 transition-colors">

              <User className="w-4 h-4" />
            </a>

            {/* Wishlist */}
            <a
              href="/wishlist"
              aria-label="Wishlist"
              className="font-suisse flex items-center justify-center w-[38px] h-[38px] text-black bg-white/50 backdrop-blur-md rounded-lg shadow-sm hover:bg-white/80 transition-colors">

              <Heart className="w-4 h-4" />
            </a>

            {/* Cart */}
            <button
              aria-label="open cart"
              className="font-suisse flex items-center justify-center gap-2 h-[38px] bg-white/50 backdrop-blur-md rounded-lg text-black px-4 shadow-sm hover:bg-white/80 transition-colors">

              <span className="text-[13px] font-normal tracking-[-0.02em]">Carrinho</span>
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Header Container */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-[80px] flex items-center justify-between px-4">
          {/* Left: Menu Hamburger + Search */}
          <div className="flex items-center gap-2 z-50">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              className="w-[48px] h-[48px] flex items-center justify-center bg-white/50 backdrop-blur-md rounded-full shadow-sm">

              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Buscar"
              className="w-[48px] h-[48px] flex items-center justify-center bg-white/50 backdrop-blur-md rounded-full shadow-sm">

              <Search size={20} />
            </button>
          </div>

          {/* Center: Logo */}
          <Link
            href="/"
            aria-label="Ir para a página inicial/home"
            className="absolute left-1/2 -translate-x-1/2 z-40">

            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/ROTEIRO_EUROPA-removebg-preview-1765225025878.png"
              alt="Goiás Minas Uniformes Logo"
              width={120}
              height={120}
              className="object-contain w-[120px] h-[120px]"
              priority />

          </Link>

          {/* Right: Cart + Profile */}
          <div className="flex items-center gap-2 z-50">
            <button
              aria-label="Carrinho"
              className="w-[48px] h-[48px] flex items-center justify-center bg-white/50 backdrop-blur-md rounded-full shadow-sm">

              <ShoppingCart size={20} />
            </button>
            <a
              href="/my-account"
              aria-label="Perfil"
              className="w-[48px] h-[48px] flex items-center justify-center bg-white/50 backdrop-blur-md rounded-full shadow-sm">

              <User size={20} />
            </a>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen &&
        <div className="lg:hidden fixed inset-0 z-40 pt-[80px]">
            <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)} />

            <div className="relative bg-white/95 backdrop-blur-xl w-full max-w-sm mx-auto rounded-b-3xl shadow-2xl p-6">
              <nav>
                <ul className="space-y-4">
                  {navItems.filter((item) => item).map((item) =>
                <li key={item}>
                      <Link
                    href="#"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block font-suisse text-[16px] font-medium text-black py-3 px-4 rounded-lg hover:bg-white/80 transition-colors">

                        {item}
                      </Link>
                    </li>
                )}
                </ul>
              </nav>
            </div>
          </div>
        }

        {/* Mobile Search Overlay */}
        {searchOpen &&
        <div className="lg:hidden fixed inset-0 z-[60] bg-white/95 backdrop-blur-xl pt-[80px] px-4">
            <div className="max-w-md mx-auto">
              <div className="flex items-center gap-3 bg-white rounded-full shadow-lg px-4 py-3">
                <Search size={20} className="text-gray-500" />
                <input
                type="text"
                placeholder="Buscar..."
                autoFocus
                className="flex-1 bg-transparent border-none outline-none text-[16px] font-suisse text-black placeholder:text-gray-500"
                onBlur={() => setTimeout(() => setSearchOpen(false), 100)} />

                <button
                onClick={() => setSearchOpen(false)}
                className="text-gray-500">

                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        }

        {/* Submenu Overlay */}
        <div
          id="submenu"
          data-menu-open={activeSubmenu !== null}
          onMouseEnter={() => {
            if (activeSubmenu !== null) {
              setActiveSubmenu(activeSubmenu);
            }
          }}
          onMouseLeave={() => setActiveSubmenu(null)}
          className="absolute top-20 left-[30px] right-[30px] xll:left-[60px] xll:right-[60px] rounded-xl bg-white/[0.7] backdrop-blur-[20px] opacity-0 max-h-0 data-[menu-open=true]:opacity-100 data-[menu-open=true]:max-h-96 overflow-hidden transition-[max-height,opacity] duration-300 ease-[cubic-bezier(.16,1,.3,1)] shadow-lg z-[55]"
          style={{
            transition:
            activeSubmenu !== null ?
            'all 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0s' :
            'all 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.03s 0.27s'
          }}>

          <div className="grid h-full grid-cols-1 grid-rows-1">
            {navItems.map((item) =>
            item ?
            <div
              key={item}
              data-active={activeSubmenu === item}
              className="col-start-1 row-start-1 h-full min-h-[300px] pt-20 p-8 transition-opacity duration-200 opacity-0 pointer-events-none data-[active=true]:opacity-100 data-[active=true]:pointer-events-auto">

                  {/* Placeholder for submenu content */}
                </div> :
            null
            )}
          </div>
        </div>
      </header>
    </>);

};

export default Header;
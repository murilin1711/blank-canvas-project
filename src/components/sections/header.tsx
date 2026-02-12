import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Search, User, Heart, ShoppingCart, Menu, X, Package, LogOut } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { user, signOut } = useAuth();
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState<string | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to escola or search results
      const query = searchQuery.toLowerCase().trim();
      if (query.includes('militar') || query.includes('colegio')) {
        navigate('/escolas/colegio-militar');
      } else {
        // For now, navigate to schools page with search term
        navigate(`/escolas/colegio-militar?search=${encodeURIComponent(query)}`);
      }
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navItems = ["Escolas", "Uniformes Empresariais", "Camisetas Personalizadas", "Sobre Nós", "FAQ"];
  const navItemsMobile = ["Escolas", "Uniformes Empresariais", "Camisetas Personalizadas", "Sobre Nós", "Perguntas Frequentes (FAQ)"];

  useEffect(() => {
    const handleScroll = () => {
      const bannerHeight = window.innerHeight;
      setIsScrolled(window.scrollY > bannerHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAccountClick = () => {
    if (user) {
      setAccountMenuOpen(!accountMenuOpen);
    } else {
      navigate('/auth');
    }
  };

  return (
    <>
      {/* White background header */}
      <div className={`fixed top-0 left-0 right-0 bg-white z-40 transition-opacity duration-300 !w-full !h-[79px] ${isScrolled ? 'opacity-0' : 'opacity-100'}`} />

      <header className="fixed w-full z-50">
        {/* Desktop Header - Only show on xl and above (1280px+) */}
        <div className="hidden xl:flex fixed top-0 left-0 right-0 h-[80px] items-center z-50">
          <div className="w-full h-full flex items-center justify-between px-8 xl:px-12 2xl:px-16">
            {/* Left Navigation - posicionado para não ficar atrás da logo */}
            <div className="flex items-center max-w-[45%]">
              <nav className="bg-white/50 backdrop-blur-md rounded-xl h-[40px] items-center shadow-sm flex">
                <ul className="flex items-center gap-0.5 px-1.5">
                  {navItems.map((item) => (
                    <li key={item} className="relative group">
                      {item === "Sobre Nós" ? (
                        <Link
                          to="/sobre"
                          className="font-suisse font-normal text-[13px] -tracking-[0.02em] text-black hover:bg-white/80 h-[34px] px-2.5 rounded-lg transition-all duration-300 whitespace-nowrap group-hover:scale-105 group-hover:shadow-sm flex items-center"
                        >
                          {item}
                        </Link>
                      ) : (
                        <button
                          onMouseEnter={() => setActiveSubmenu(item)}
                          className="font-suisse font-normal text-[13px] -tracking-[0.02em] text-black hover:bg-white/80 h-[34px] px-2.5 rounded-lg transition-all duration-300 whitespace-nowrap group-hover:scale-105 group-hover:shadow-sm"
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
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
              <Link to="/" aria-label="Ir para a página inicial/home">
              <div className="flex items-center justify-center">
                  <img
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/ROTEIRO_EUROPA-removebg-preview-1765225025878.png"
                    alt="Goiás Minas Uniformes Logo"
                    className="object-contain !w-auto !h-[166px] transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </Link>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative group">
                <div className={`h-[38px] bg-white/50 backdrop-blur-md rounded-lg shadow-sm transition-all duration-300 ${searchOpen ? 'w-[220px] xl:w-[250px]' : 'w-[90px] xl:w-[100px]'} overflow-hidden group-hover:shadow-md group-hover:scale-105`}>
                  {searchOpen ? (
                    <form onSubmit={handleSearch} className="flex items-center h-full px-3 gap-2">
                      <input
                        type="text"
                        placeholder="Buscar produtos..."
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-[13px] font-suisse text-black placeholder:text-gray-500"
                        onBlur={() => {
                          if (!searchQuery) setSearchOpen(false);
                        }}
                      />
                      <button 
                        type="submit" 
                        className="p-1 hover:bg-white/50 rounded transition-colors"
                      >
                        <Search className="w-[14px] h-[14px] text-black flex-shrink-0" />
                      </button>
                    </form>
                  ) : (
                    <button onClick={() => setSearchOpen(true)} className="w-full h-full flex items-center justify-between px-3 hover:bg-white/30 transition-colors">
                      <span className="font-suisse font-normal text-[13px] tracking-[-0.02em] text-black">Buscar</span>
                      <Search className="w-[14px] h-[14px] text-black transition-transform duration-300 group-hover:scale-110" />
                    </button>
                  )}
                </div>
              </div>

              {/* Account */}
              <div className="relative" ref={accountMenuRef}>
                <button 
                  onClick={handleAccountClick}
                  aria-label={user ? "Minha Conta" : "Entrar"} 
                  className="relative group font-suisse flex items-center justify-center w-[38px] h-[38px] text-black bg-white/50 backdrop-blur-md rounded-lg shadow-sm hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-md"
                >
                  <User className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${user ? 'text-[#2e3091]' : ''}`} />
                  {user && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    {user ? 'Minha Conta' : 'Entrar'}
                  </span>
                </button>

                {/* Account Dropdown */}
                {accountMenuOpen && user && (
                  <div className="absolute top-12 right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <Link
                      to="/meus-pedidos"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      Meus Pedidos
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setAccountMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair da Conta
                    </button>
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link to="/favoritos" aria-label="Wishlist" className="relative group font-suisse flex items-center justify-center w-[38px] h-[38px] text-black bg-white/50 backdrop-blur-md rounded-lg shadow-sm hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-md">
                <Heart className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Favoritos
                </span>
              </Link>

              {/* Cart */}
              <Link to="/carrinho" aria-label="open cart" className="relative group font-suisse flex items-center justify-center gap-2 h-[38px] bg-white/50 backdrop-blur-md rounded-lg text-black px-4 shadow-sm hover:bg-white/80 transition-all duration-300 hover:scale-105 hover:shadow-md whitespace-nowrap">
                <span className="text-[13px] font-normal tracking-[-0.02em]">Carrinho</span>
                <ShoppingCart className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#2e3091] text-white text-[10px] rounded-full flex items-center justify-center font-semibold">
                  {itemCount}
                </div>
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Ver Carrinho
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Header - Show on lg and below (below 1280px) */}
        <div className="xl:hidden fixed top-0 left-0 right-0 h-[80px] flex items-center justify-between px-4">
          <div className="flex items-center gap-2 z-50">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu" className="w-[48px] h-[48px] flex items-center justify-center bg-white/50 backdrop-blur-md rounded-full shadow-sm hover:scale-105 transition-transform duration-300">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <button 
              onClick={() => setSearchOpen(!searchOpen)} 
              aria-label="Buscar" 
              className="w-[48px] h-[48px] flex items-center justify-center bg-white/50 backdrop-blur-md rounded-full shadow-sm hover:scale-105 hover:bg-white/80 transition-all duration-300"
            >
              <Search size={20} />
            </button>
          </div>

          <Link to="/" aria-label="Ir para a página inicial/home" className="absolute left-1/2 -translate-x-1/2 z-40">
            <img
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/ROTEIRO_EUROPA-removebg-preview-1765225025878.png"
              alt="Goiás Minas Uniformes Logo"
              className="object-contain w-[166px] h-[166px]"
            />
          </Link>

          <div className="flex items-center gap-2 z-[60]">
            <Link to="/carrinho" aria-label="Carrinho" className="relative w-[48px] h-[48px] flex items-center justify-center bg-white/50 backdrop-blur-md rounded-full shadow-sm hover:scale-105 transition-transform duration-300">
              <ShoppingCart size={20} />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#2e3091] text-white text-[10px] rounded-full flex items-center justify-center font-semibold">
                {itemCount}
              </div>
            </Link>
            <div className="relative">
              <button onClick={handleAccountClick} aria-label="Perfil" className="relative w-[48px] h-[48px] flex items-center justify-center bg-white/50 backdrop-blur-md rounded-full shadow-sm hover:scale-105 transition-transform duration-300">
                <User size={20} className={user ? 'text-[#2e3091]' : ''} />
                {user && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
              </button>
              
              {/* Mobile Account Dropdown */}
              {accountMenuOpen && user && (
                <div className="absolute top-14 right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[70]">
                  <Link
                    to="/meus-pedidos"
                    onClick={() => setAccountMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4" />
                      Meus Pedidos
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setAccountMenuOpen(false);
                    }}
                    className="block px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <div className="flex items-center gap-3">
                      <LogOut className="w-4 h-4" />
                      Sair da Conta
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {searchOpen && (
          <div className="xl:hidden fixed inset-0 z-[60] pt-[80px]">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
            <div className="relative bg-white/95 backdrop-blur-xl w-full max-w-sm mx-auto rounded-b-3xl shadow-2xl p-6">
              <form onSubmit={handleSearch} className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-gray-100 border-none outline-none text-[16px] font-suisse text-black placeholder:text-gray-500 px-4 py-3 rounded-xl"
                />
                <button 
                  type="submit" 
                  className="p-3 bg-[#2e3091] text-white rounded-xl hover:bg-[#252a7a] transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="xl:hidden fixed inset-0 z-40 pt-[80px]">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative bg-white/95 backdrop-blur-xl w-full max-w-sm mx-auto rounded-b-3xl shadow-2xl p-6">
              <nav>
                <ul className="space-y-4">
                  {navItemsMobile.map((item) => (
                    <li key={item}>
                      {item === "Sobre Nós" ? (
                        <Link
                          to="/sobre"
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
                                  to="/escolas/colegio-militar"
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="block text-[#2e3091] font-bold text-[15px] hover:underline"
                                >
                                  Colégio Militar
                                </Link>
                              </li>
                            </ul>
                          )}
                        </>
                      ) : item === "Uniformes Empresariais" ? (
                        <Link
                          to="/empresarial"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block font-suisse text-[16px] font-medium text-black py-3 px-4 rounded-lg hover:bg-white/80 transition-colors duration-300 hover:scale-105 hover:shadow-sm w-full text-left"
                        >
                          {item}
                        </Link>
                      ) : item === "Camisetas Personalizadas" ? (
                        <Link
                          to="/personalizacao"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block font-suisse text-[16px] font-medium text-black py-3 px-4 rounded-lg hover:bg-white/80 transition-colors duration-300 hover:scale-105 hover:shadow-sm w-full text-left"
                        >
                          {item}
                        </Link>
                      ) : item === "Perguntas Frequentes (FAQ)" ? (
                        <Link
                          to="/sobre"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block font-suisse text-[16px] font-medium text-black py-3 px-4 rounded-lg hover:bg-white/80 transition-colors duration-300 hover:scale-105 hover:shadow-sm w-full text-left"
                        >
                          {item}
                        </Link>
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
                  
                  {/* Mobile menu extras */}
                  <li className="border-t border-gray-200 pt-4 mt-4">
                    <Link
                      to="/favoritos"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 font-suisse text-[16px] font-medium text-black py-3 px-4 rounded-lg hover:bg-white/80 transition-colors duration-300"
                    >
                      <Heart size={20} />
                      Meus Favoritos
                    </Link>
                  </li>
                  <li>
                    {user ? (
                      <button
                        onClick={() => {
                          signOut();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 font-suisse text-[16px] font-medium text-red-600 py-3 px-4 rounded-lg hover:bg-red-50 transition-colors duration-300 w-full text-left"
                      >
                        <User size={20} />
                        Sair da Conta
                      </button>
                    ) : (
                      <Link
                        to="/auth"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 font-suisse text-[16px] font-medium text-[#2e3091] py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors duration-300"
                      >
                        <User size={20} />
                        Entrar / Criar Conta
                      </Link>
                    )}
                  </li>
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
          className="hidden xl:block absolute top-20 left-8 xl:left-12 2xl:left-16 right-8 xl:right-12 2xl:right-16 rounded-xl bg-white/[0.85] backdrop-blur-[20px] opacity-0 max-h-0 data-[menu-open=true]:opacity-100 data-[menu-open=true]:max-h-96 overflow-hidden transition-[max-height,opacity] duration-300 ease-[cubic-bezier(.16,1,.3,1)] shadow-xl z-[55] border border-white/20"
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
                      to="/escolas/colegio-militar"
                      className="text-[#2e3091] font-bold text-lg hover:underline"
                    >
                      Colégio Militar
                    </Link>
                  </div>
                ) : item === "Uniformes Empresariais" ? (
                  <div className="flex flex-col items-center gap-4">
                    <Link
                      to="/empresarial"
                      className="text-[#2e3091] font-bold text-lg hover:underline"
                    >
                      Ver todas as linhas empresariais
                    </Link>
                  </div>
                ) : item === "Camisetas Personalizadas" ? (
                  <div className="flex flex-col items-center gap-4">
                    <Link
                      to="/personalizacao"
                      className="text-[#2e3091] font-bold text-lg hover:underline"
                    >
                      Ver todas as linhas de personalização
                    </Link>
                  </div>
                ) : item === "FAQ" ? (
                  <div className="flex flex-col items-center gap-4">
                    <Link
                      to="/sobre"
                      className="text-[#2e3091] font-bold text-lg hover:underline"
                    >
                      Perguntas Frequentes
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

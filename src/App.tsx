import { Routes, Route } from 'react-router-dom';
import Header from '@/components/sections/header';
import AccessibilityWidget from '@/components/sections/accessibility-widget';
import HeroBanner from '@/components/sections/hero-banner';
import CategoryShowcase from '@/components/sections/category-showcase';
import ProductCarousel from '@/components/sections/product-carousel';
import VideoBanner from '@/components/sections/video-banner';
import StoreLocator from '@/components/sections/store-locator';
import FibrasNobresBanner from '@/components/sections/fibras-nobres-banner';
import Footer from '@/components/sections/footer';
import CookieBanner from '@/components/sections/cookie-banner';
import SobrePage from '@/app/sobre/page';
import LojaColegioMilitar from '@/app/escolas/colegio-militar/page';
import Produto1Page from '@/app/escolas/colegio-militar/produto1/page';

function HomePage() {
  return (
    <main className="relative min-h-screen bg-white antialiased">
      <AccessibilityWidget />
      <div className="relative">
        <HeroBanner />
        <div className="mt-8 lg:mt-12">
          <CategoryShowcase />
        </div>
        <div className="mt-8 lg:mt-12">
          <ProductCarousel />
        </div>
        <div className="mt-8 lg:mt-12 px-[15px] xll:px-[30px]">
          <VideoBanner />
        </div>
        <div className="mt-8 lg:mt-12">
          <StoreLocator />
        </div>
        <div className="mt-8 lg:mt-12">
          <FibrasNobresBanner />
        </div>
        <Footer />
      </div>
      <CookieBanner />
    </main>
  );
}

function App() {
  return (
    <>
      <Header />
      <div className="pt-24">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sobre" element={<SobrePage />} />
          <Route path="/escolas/colegio-militar" element={<LojaColegioMilitar />} />
          <Route path="/escolas/colegio-militar/produto1" element={<Produto1Page />} />
          <Route path="/escolas/colegio-militar/produto:id" element={<Produto1Page />} />
        </Routes>
      </div>
    </>
  );
}

export default App;

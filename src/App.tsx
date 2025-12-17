import AccessibilityWidget from '@/components/sections/accessibility-widget';
import HeroBanner from '@/components/sections/hero-banner';
import CategoryShowcase from '@/components/sections/category-showcase';
import ProductCarousel from '@/components/sections/product-carousel';
import VideoBanner from '@/components/sections/video-banner';
import StoreLocator from '@/components/sections/store-locator';
import FibrasNobresBanner from '@/components/sections/fibras-nobres-banner';
import Footer from '@/components/sections/footer';
import CookieBanner from '@/components/sections/cookie-banner';

function App() {
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

export default App;

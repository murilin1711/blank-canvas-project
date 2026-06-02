import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { ScrollToTop } from '@/components/ScrollToTop';
import Header from '@/components/sections/header';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { CookieConsent } from '@/components/CookieConsent';
import { PasswordGate } from '@/components/PasswordGate';

const HomePage = lazy(() => import('@/app/page'));
const SobrePage = lazy(() => import('@/app/sobre/page'));
const AuthPage = lazy(() => import('@/app/auth/page'));
const CarrinhoPage = lazy(() => import('@/app/carrinho/page'));
const CheckoutPage = lazy(() => import('@/app/checkout/page'));
const CheckoutSucessoPage = lazy(() => import('@/app/checkout/sucesso/page'));
const CheckoutCanceladoPage = lazy(() => import('@/app/checkout/cancelado/page'));
const FavoritosPage = lazy(() => import('@/app/favoritos/page'));
const MeusPedidosPage = lazy(() => import('@/app/meus-pedidos/page'));
const MeusDadosPage = lazy(() => import('@/app/meus-dados/page'));
const ColegioMilitarPage = lazy(() => import('@/app/escolas/colegio-militar/page'));
const DynamicProductPage = lazy(() => import('@/app/escolas/colegio-militar/produto/[id]/page'));
const Produto1Page = lazy(() => import('@/app/escolas/colegio-militar/produto1/page'));
const Produto2Page = lazy(() => import('@/app/escolas/colegio-militar/produto2/page'));
const Produto3Page = lazy(() => import('@/app/escolas/colegio-militar/produto3/page'));
const Produto4Page = lazy(() => import('@/app/escolas/colegio-militar/produto4/page'));
const Produto5Page = lazy(() => import('@/app/escolas/colegio-militar/produto5/page'));
const Produto6Page = lazy(() => import('@/app/escolas/colegio-militar/produto6/page'));
const AdminPage = lazy(() => import('@/app/admin/page'));
const CaixaPage = lazy(() => import('@/app/caixa/page'));
const EmpresarialPage = lazy(() => import('@/app/empresarial/page'));
const LinhaEmpresarialPage = lazy(() => import('@/app/empresarial/linha/page'));
const PersonalizacaoPage = lazy(() => import('@/app/personalizacao/page'));
const LinhaPersonalizacaoPage = lazy(() => import('@/app/personalizacao/linha/page'));
const NotFoundPage = lazy(() => import('@/app/not-found/page'));

function App() {
  return (
    <PasswordGate>
    <BrowserRouter>
      <LoadingProvider>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <ScrollToTop />
<Suspense fallback={
  <div className="min-h-screen bg-white">
    <div className="h-[80px] bg-white border-b border-gray-100" />
    <div className="animate-pulse">
      <div className="w-full aspect-[16/7] bg-gray-200" />
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  </div>
}>
            <Routes>
              {/* Admin route without header */}
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/caixa" element={<CaixaPage />} />

              {/* Regular routes with header */}
              <Route path="/*" element={
                <>
                  <Header />
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/sobre" element={<SobrePage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/carrinho" element={<CarrinhoPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/checkout/sucesso" element={<CheckoutSucessoPage />} />
                    <Route path="/checkout/cancelado" element={<CheckoutCanceladoPage />} />
                    <Route path="/favoritos" element={<FavoritosPage />} />
                    <Route path="/meus-pedidos" element={<MeusPedidosPage />} />
                    <Route path="/meus-dados" element={<MeusDadosPage />} />
                    <Route path="/escolas/colegio-militar" element={<ColegioMilitarPage />} />
                    <Route path="/escolas/colegio-militar/produto/:id" element={<DynamicProductPage />} />
                    <Route path="/escolas/colegio-militar/produto1" element={<Produto1Page />} />
                    <Route path="/escolas/colegio-militar/produto2" element={<Produto2Page />} />
                    <Route path="/escolas/colegio-militar/produto3" element={<Produto3Page />} />
                    <Route path="/escolas/colegio-militar/produto4" element={<Produto4Page />} />
                    <Route path="/escolas/colegio-militar/produto5" element={<Produto5Page />} />
                    <Route path="/escolas/colegio-militar/produto6" element={<Produto6Page />} />
                    <Route path="/empresarial" element={<EmpresarialPage />} />
                    <Route path="/empresarial/:linhaId" element={<LinhaEmpresarialPage />} />
                    <Route path="/personalizacao" element={<PersonalizacaoPage />} />
                    <Route path="/personalizacao/:linhaId" element={<LinhaPersonalizacaoPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </>
              } />
            </Routes>
            </Suspense>
              <Toaster position="top-right" richColors />
              <CookieConsent />
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </LoadingProvider>
    </BrowserRouter>
    </PasswordGate>
  );
}

export default App;

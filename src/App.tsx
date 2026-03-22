import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { ScrollToTop } from '@/components/ScrollToTop';
import Header from '@/components/sections/header';
import Home from '@/app/page';

const SobrePage = lazy(() => import('@/app/sobre/page'));
const AuthPage = lazy(() => import('@/app/auth/page'));
const CarrinhoPage = lazy(() => import('@/app/carrinho/page'));
const CheckoutPage = lazy(() => import('@/app/checkout/page'));
const CheckoutSucessoPage = lazy(() => import('@/app/checkout/sucesso/page'));
const CheckoutCanceladoPage = lazy(() => import('@/app/checkout/cancelado/page'));
const FavoritosPage = lazy(() => import('@/app/favoritos/page'));
const MeusPedidosPage = lazy(() => import('@/app/meus-pedidos/page'));
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <ScrollToTop />
            <Suspense fallback={null}>
            <Routes>
              {/* Admin route without header */}
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/caixa" element={<CaixaPage />} />

              {/* Regular routes with header */}
              <Route path="/*" element={
                <>
                  <Header />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/sobre" element={<SobrePage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/carrinho" element={<CarrinhoPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/checkout/sucesso" element={<CheckoutSucessoPage />} />
                    <Route path="/checkout/cancelado" element={<CheckoutCanceladoPage />} />
                    <Route path="/favoritos" element={<FavoritosPage />} />
                    <Route path="/meus-pedidos" element={<MeusPedidosPage />} />
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
                  </Routes>
                </>
              } />
            </Routes>
            </Suspense>
            <Toaster position="top-right" richColors />
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

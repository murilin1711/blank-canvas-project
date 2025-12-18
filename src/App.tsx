import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import Header from '@/components/sections/header';
import Home from '@/app/page';
import SobrePage from '@/app/sobre/page';
import AuthPage from '@/app/auth/page';
import CheckoutPage from '@/app/checkout/page';
import FavoritosPage from '@/app/favoritos/page';
import MeusPedidosPage from '@/app/meus-pedidos/page';
import ColegioMilitarPage from '@/app/escolas/colegio-militar/page';
import Produto1Page from '@/app/escolas/colegio-militar/produto1/page';
import Produto2Page from '@/app/escolas/colegio-militar/produto2/page';
import Produto3Page from '@/app/escolas/colegio-militar/produto3/page';
import Produto4Page from '@/app/escolas/colegio-militar/produto4/page';
import Produto5Page from '@/app/escolas/colegio-militar/produto5/page';
import Produto6Page from '@/app/escolas/colegio-militar/produto6/page';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sobre" element={<SobrePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/favoritos" element={<FavoritosPage />} />
              <Route path="/meus-pedidos" element={<MeusPedidosPage />} />
              <Route path="/escolas/colegio-militar" element={<ColegioMilitarPage />} />
              <Route path="/escolas/colegio-militar/produto1" element={<Produto1Page />} />
              <Route path="/escolas/colegio-militar/produto2" element={<Produto2Page />} />
              <Route path="/escolas/colegio-militar/produto3" element={<Produto3Page />} />
              <Route path="/escolas/colegio-militar/produto4" element={<Produto4Page />} />
              <Route path="/escolas/colegio-militar/produto5" element={<Produto5Page />} />
              <Route path="/escolas/colegio-militar/produto6" element={<Produto6Page />} />
            </Routes>
            <Toaster position="top-right" richColors />
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

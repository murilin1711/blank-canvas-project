import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from '@/components/sections/header';
import Home from '@/app/page';
import SobrePage from '@/app/sobre/page';
import ColegioMilitarPage from '@/app/escolas/colegio-militar/page';
import Produto1Page from '@/app/escolas/colegio-militar/produto1/page';
import Produto2Page from '@/app/escolas/colegio-militar/produto2/page';
import Produto3Page from '@/app/escolas/colegio-militar/produto3/page';
import Produto4Page from '@/app/escolas/colegio-militar/produto4/page';
import Produto5Page from '@/app/escolas/colegio-militar/produto5/page';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<SobrePage />} />
        <Route path="/escolas/colegio-militar" element={<ColegioMilitarPage />} />
        <Route path="/escolas/colegio-militar/produto1" element={<Produto1Page />} />
        <Route path="/escolas/colegio-militar/produto2" element={<Produto2Page />} />
        <Route path="/escolas/colegio-militar/produto3" element={<Produto3Page />} />
        <Route path="/escolas/colegio-militar/produto4" element={<Produto4Page />} />
        <Route path="/escolas/colegio-militar/produto5" element={<Produto5Page />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

export default App;

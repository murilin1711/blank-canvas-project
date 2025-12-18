import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from '@/components/sections/header';
import Home from '@/app/page';
import SobrePage from '@/app/sobre/page';
import ColegioMilitarPage from '@/app/escolas/colegio-militar/page';
import Produto1Page from '@/app/escolas/colegio-militar/produto1/page';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<SobrePage />} />
        <Route path="/escolas/colegio-militar" element={<ColegioMilitarPage />} />
        <Route path="/escolas/colegio-militar/produto:id" element={<Produto1Page />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

export default App;

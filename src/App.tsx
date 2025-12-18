import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from '@/components/sections/header';
import Home from '@/app/page';
import SobrePage from '@/app/sobre/page';
import ColegioMilitarPage from '@/app/escolas/colegio-militar/page';
import Produto1Page from '@/app/escolas/colegio-militar/produto1/page';
import AdonaiPage from '@/app/escolas/adonai/page';
import ColegiosDeltaPage from '@/app/escolas/colegio-delta/page';
import EscolaModeloPage from '@/app/escolas/escola-modelo/page';
import EscolaEducarePage from '@/app/escolas/escola-educare/page';
import EscolaEducarPage from '@/app/escolas/escola-educar/page';
import EscolaPinguinhoDeGentePage from '@/app/escolas/escola-pinguinho-de-gente/page';
import EducandarioDomPedroIIPage from '@/app/escolas/educandario-dom-pedro-ii/page';
import VillaGalileuPage from '@/app/escolas/villa-galileu/page';
import DOMPage from '@/app/escolas/dom/page';
import ColegioGalileuPage from '@/app/escolas/colegio-galileu/page';
import ColegioSaoFranciscoDeAssisPage from '@/app/escolas/colegio-sao-francisco-de-assis/page';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<SobrePage />} />
        <Route path="/escolas/colegio-militar" element={<ColegioMilitarPage />} />
        <Route path="/escolas/colegio-militar/produto:id" element={<Produto1Page />} />
        <Route path="/escolas/adonai" element={<AdonaiPage />} />
        <Route path="/escolas/colegio-delta" element={<ColegiosDeltaPage />} />
        <Route path="/escolas/escola-modelo" element={<EscolaModeloPage />} />
        <Route path="/escolas/escola-educare" element={<EscolaEducarePage />} />
        <Route path="/escolas/escola-educar" element={<EscolaEducarPage />} />
        <Route path="/escolas/escola-pinguinho-de-gente" element={<EscolaPinguinhoDeGentePage />} />
        <Route path="/escolas/educandario-dom-pedro-ii" element={<EducandarioDomPedroIIPage />} />
        <Route path="/escolas/villa-galileu" element={<VillaGalileuPage />} />
        <Route path="/escolas/dom" element={<DOMPage />} />
        <Route path="/escolas/colegio-galileu" element={<ColegioGalileuPage />} />
        <Route path="/escolas/colegio-sao-francisco-de-assis" element={<ColegioSaoFranciscoDeAssisPage />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

export default App;

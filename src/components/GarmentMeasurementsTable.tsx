import React from 'react';
import { X, Ruler } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  productName: string;
  open: boolean;
  onClose: () => void;
}

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// ─── TABELAS (todos os valores em cm) ────────────────────────────────────────

const CAMISETA_U = [
  { tam: "10",   largura: 40, compr: 55, ombro: 9.5, manga: 16 },
  { tam: "12",   largura: 43, compr: 57, ombro: 10,  manga: 16 },
  { tam: "14",   largura: 46, compr: 63, ombro: 10,  manga: 20 },
  { tam: "P",    largura: 50, compr: 66, ombro: 11,  manga: 21 },
  { tam: "M",    largura: 52, compr: 69, ombro: 13,  manga: 23 },
  { tam: "G",    largura: 57, compr: 71, ombro: 13,  manga: 22 },
  { tam: "GG",   largura: 61, compr: 77, ombro: 15,  manga: 22 },
  { tam: "EXGG", largura: 65, compr: 81, ombro: 17,  manga: 23 },
];

const AGASALHO_GAB = [
  { tam: "10",  largura: 49, compr: 57, ombro: 13, manga: 54 },
  { tam: "12",  largura: 50, compr: 59, ombro: 15, manga: 55 },
  { tam: "14",  largura: 53, compr: 60, ombro: 16, manga: 58 },
  { tam: "P",   largura: 55, compr: 61, ombro: 18, manga: 60 },
  { tam: "M",   largura: 59, compr: 66, ombro: 17, manga: 65 },
  { tam: "G",   largura: 61, compr: 68, ombro: 20, manga: 65 },
  { tam: "GG",  largura: 64, compr: 75, ombro: 19, manga: 71 },
  { tam: "EXG", largura: 68, compr: 77, ombro: 20, manga: 73 },
];

const AGASALHO_TEC = [
  { tam: "10",   largura: 46, compr: 55, ombro: 14, manga: 50 },
  { tam: "12",   largura: 48, compr: 58, ombro: 14, manga: 52 },
  { tam: "14",   largura: 50, compr: 61, ombro: 15, manga: 57 },
  { tam: "P",    largura: 51, compr: 64, ombro: 15, manga: 61 },
  { tam: "M",    largura: 55, compr: 68, ombro: 16, manga: 66 },
  { tam: "G",    largura: 58, compr: 72, ombro: 16, manga: 71 },
  { tam: "GG",   largura: 60, compr: 74, ombro: 17, manga: 73 },
  { tam: "EXGG", largura: 66, compr: 80, ombro: 20, manga: 76 },
];

const CAMISA_BEGE = [
  { tam: "10",  largura: 43, compr: 58, ombro: 12, manga: 18 },
  { tam: "12",  largura: 45, compr: 59, ombro: 12, manga: 18 },
  { tam: "14",  largura: 48, compr: 63, ombro: 13, manga: 19 },
  { tam: "PP",  largura: 51, compr: 64, ombro: 14, manga: 20 },
  { tam: "P",   largura: 54, compr: 71, ombro: 16, manga: 22 },
  { tam: "M",   largura: 58, compr: 72, ombro: 18, manga: 23 },
  { tam: "G",   largura: 60, compr: 77, ombro: 20, manga: 27 },
  { tam: "GG",  largura: 63, compr: 80, ombro: 20, manga: 28 },
  { tam: "EXG", largura: 66, compr: 85, ombro: 23, manga: 28 },
];

const CAMISA_BRANCA_M = [
  { tam: "PP",  largura: 106, compr: 69, ombro: 15, manga: 59 },
  { tam: "P",   largura: 108, compr: 69, ombro: 16, manga: 59 },
  { tam: "M",   largura: 114, compr: 72, ombro: 18, manga: 60 },
  { tam: "G",   largura: 120, compr: 75, ombro: 20, manga: 60 },
  { tam: "GG",  largura: 128, compr: 78, ombro: 21, manga: 62 },
  { tam: "EXG", largura: 132, compr: 80, ombro: 22, manga: 62 },
];

const CAMISETE_F = [
  { tam: "PP",  busto: 90,  largura: 86,  compr: 55, ombro: 12, manga: 59 },
  { tam: "P",   busto: 88,  largura: 82,  compr: 55, ombro: 12, manga: 60 },
  { tam: "M",   busto: 94,  largura: 92,  compr: 55, ombro: 12, manga: 60 },
  { tam: "G",   busto: 100, largura: 96,  compr: 58, ombro: 13, manga: 60 },
  { tam: "GG",  busto: 104, largura: 102, compr: 59, ombro: 15, manga: 61 },
  { tam: "EXG", busto: 112, largura: 108, compr: 63, ombro: 16, manga: 62 },
];

const TUNICA_F = [
  { tam: "PP",   busto: 90,  cintura: 82,  compr: 56, ombro: 10, manga: 57 },
  { tam: "P",    busto: 94,  cintura: 86,  compr: 58, ombro: 11, manga: 59 },
  { tam: "M",    busto: 98,  cintura: 90,  compr: 62, ombro: 12, manga: 58 },
  { tam: "G",    busto: 104, cintura: 94,  compr: 63, ombro: 13, manga: 60 },
  { tam: "GG",   busto: 106, cintura: 100, compr: 65, ombro: 14, manga: 62 },
  { tam: "EXG",  busto: 114, cintura: 108, compr: 67, ombro: 15, manga: 63 },
  { tam: "EXGG", busto: 122, cintura: 120, compr: 68, ombro: 17, manga: 64 },
];

const TUNICA_M = [
  { tam: "12",   largura: 92,  compr: 62, ombro: 12, manga: 58 },
  { tam: "PP",   largura: 100, compr: 70, ombro: 14, manga: 64 },
  { tam: "P",    largura: 96,  compr: 69, ombro: 13, manga: 64 },
  { tam: "M",    largura: 106, compr: 72, ombro: 15, manga: 66 },
  { tam: "G",    largura: 108, compr: 72, ombro: 15, manga: 66 },
  { tam: "GG",   largura: 114, compr: 76, ombro: 16, manga: 66 },
  { tam: "EXG",  largura: 124, compr: 84, ombro: 18, manga: 66 },
  { tam: "EXGG", largura: 132, compr: 82, ombro: 20, manga: 67 },
];

const CALCA_TEC = [
  { tam: "10",   cintura: 100, compr: 88,  quadril: 85,  gancho: 23 },
  { tam: "12",   cintura: 108, compr: 90,  quadril: 90,  gancho: 27 },
  { tam: "14",   cintura: 120, compr: 102, quadril: 92,  gancho: 33 },
  { tam: "P",    cintura: 124, compr: 105, quadril: 100, gancho: 36 },
  { tam: "M",    cintura: 132, compr: 111, quadril: 106, gancho: 37 },
  { tam: "G",    cintura: 136, compr: 118, quadril: 114, gancho: 37 },
  { tam: "GG",   cintura: 148, compr: 121, quadril: 118, gancho: 38 },
  { tam: "EXG",  cintura: 152, compr: 122, quadril: 124, gancho: 40 },
  { tam: "EXGG", cintura: 154, compr: 124, quadril: 128, gancho: 40 },
];

const CALCA_SOC = [
  { tam: "30", cintura: 60,  compr: 105, quadril: 76,  gancho: 24 },
  { tam: "32", cintura: 64,  compr: 105, quadril: 84,  gancho: 25 },
  { tam: "34", cintura: 68,  compr: 105, quadril: 90,  gancho: 25 },
  { tam: "36", cintura: 72,  compr: 105, quadril: 90,  gancho: 26 },
  { tam: "38", cintura: 76,  compr: 107, quadril: 92,  gancho: 26 },
  { tam: "40", cintura: 80,  compr: 109, quadril: 94,  gancho: 27 },
  { tam: "42", cintura: 84,  compr: 111, quadril: 102, gancho: 29 },
  { tam: "44", cintura: 88,  compr: 111, quadril: 106, gancho: 30 },
  { tam: "46", cintura: 92,  compr: 111, quadril: 108, gancho: 30 },
  { tam: "48", cintura: 96,  compr: 113, quadril: 116, gancho: 31 },
  { tam: "50", cintura: 100, compr: 113, quadril: 118, gancho: 31 },
  { tam: "52", cintura: 104, compr: 113, quadril: 120, gancho: 32 },
  { tam: "54", cintura: 108, compr: 113, quadril: 130, gancho: 33 },
  { tam: "56", cintura: 112, compr: 116, quadril: 134, gancho: 35 },
];

const SAIA = [
  { tam: "30", cintura: 60,  compr: 52, quadril: 76  },
  { tam: "32", cintura: 62,  compr: 55, quadril: 80  },
  { tam: "34", cintura: 66,  compr: 56, quadril: 94  },
  { tam: "36", cintura: 74,  compr: 58, quadril: 104 },
  { tam: "38", cintura: 78,  compr: 60, quadril: 106 },
  { tam: "40", cintura: 84,  compr: 62, quadril: 112 },
  { tam: "42", cintura: 88,  compr: 65, quadril: 116 },
  { tam: "44", cintura: 90,  compr: 68, quadril: 120 },
  { tam: "46", cintura: 96,  compr: 72, quadril: 126 },
  { tam: "48", cintura: 100, compr: 73, quadril: 130 },
  { tam: "50", cintura: 104, compr: 75, quadril: 134 },
  { tam: "52", cintura: 108, compr: 76, quadril: 136 },
];

// ─── DETECÇÃO ─────────────────────────────────────────────────────────────────

type TableKey =
  | 'camiseta-u' | 'agasalho-gab' | 'agasalho-tec'
  | 'camisa-bege' | 'camisa-branca-m' | 'camisete-f'
  | 'tunica-f' | 'tunica-m'
  | 'calca-tec' | 'calca-soc' | 'saia'
  | null;

function detectTable(productName: string): TableKey {
  const n = normalize(productName);

  if (n.includes('agasalho') || n.includes('conjunto')) {
    return n.includes('tectel') || n.includes('tec') ? 'agasalho-tec' : 'agasalho-gab';
  }
  if (n.includes('tunica') || n.includes('blusa')) {
    return n.includes('masculi') ? 'tunica-m' : 'tunica-f';
  }
  if (n.includes('calca') || n.includes('bermuda')) {
    return n.includes('tectel') || n.includes('tec') ? 'calca-tec' : 'calca-soc';
  }
  if (n.includes('saia')) return 'saia';
  if (n.includes('camiseta')) return 'camiseta-u';
  if (n.includes('camisete')) return 'camisete-f';
  if (n.includes('camisa')) {
    if (n.includes('bege') || n.includes('unissex') || n.includes('social')) return 'camisa-bege';
    return n.includes('masculi') || n.includes('masculin') ? 'camisa-branca-m' : 'camisete-f';
  }
  return null;
}

// ─── RENDERIZADORES DE TABELA ─────────────────────────────────────────────────

function fmt(v: number) {
  return v % 1 === 0 ? String(v) : String(v).replace('.', ',');
}

function UpperTable({ rows }: { rows: typeof CAMISETA_U }) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-[#2e3091]/8 text-[#2e3091] text-xs font-semibold uppercase tracking-wide">
          <th className="px-3 py-2 text-left border-b border-gray-200">Tam.</th>
          <th className="px-3 py-2 text-center border-b border-gray-200">Largura</th>
          <th className="px-3 py-2 text-center border-b border-gray-200">Compr.</th>
          <th className="px-3 py-2 text-center border-b border-gray-200">Ombro</th>
          <th className="px-3 py-2 text-center border-b border-gray-200">Manga</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50">
            <td className="px-3 py-2 font-semibold text-gray-900">{r.tam}</td>
            <td className="px-3 py-2 text-center text-gray-700">{fmt(r.largura)}</td>
            <td className="px-3 py-2 text-center text-gray-700">{fmt(r.compr)}</td>
            <td className="px-3 py-2 text-center text-gray-700">{fmt(r.ombro)}</td>
            <td className="px-3 py-2 text-center text-gray-700">{fmt(r.manga)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CamiseteTable({ rows }: { rows: typeof CAMISETE_F }) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-[#2e3091]/8 text-[#2e3091] text-xs font-semibold uppercase tracking-wide">
          <th className="px-3 py-2 text-left border-b border-gray-200">Tam.</th>
          <th className="px-3 py-2 text-center border-b border-gray-200">Busto</th>
          <th className="px-3 py-2 text-center border-b border-gray-200">Largura</th>
          <th className="px-3 py-2 text-center border-b border-gray-200">Compr.</th>
          <th className="px-3 py-2 text-center border-b border-gray-200">Ombro</th>
          <th className="px-3 py-2 text-center border-b border-gray-200">Manga</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50">
            <td className="px-3 py-2 font-semibold text-gray-900">{r.tam}</td>
            <td className="px-3 py-2 text-center text-gray-700">{fmt(r.busto)}</td>
            <td className="px-3 py-2 text-center text-gray-700">{fmt(r.largura)}</td>
            <td className="px-3 py-2 text-center text-gray-700">{fmt(r.compr)}</td>
            <td className="px-3 py-2 text-center text-gray-700">{fmt(r.ombro)}</td>
            <td className="px-3 py-2 text-center text-gray-700">{fmt(r.manga)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TunicaFTable({ rows }: { rows: typeof TUNICA_F }) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-[#2e3091]/8 text-[#2e3091] text-xs font-semibold uppercase tracking-wide">
          <th className="px-3 py-2 text-left border-b border-gray-200">Tam.</th>
          <th className="px-3 py-2 text-center border-b border-gray-200">Busto</th>
          <th className="px-3 py-2 text-center border-b border-gray-200">Cintura</th>
          <th className="px-3 py-2 text-center border-b border-gray-200">Compr.</th>
          <th className="px-3 py-2 text-center border-b border-gray-200">Ombro</th>
          <th className="px-3 py-2 text-center border-b border-gray-200">Manga</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50">
            <td className="px-3 py-2 font-semibold text-gray-900">{r.tam}</td>
            <td className="px-3 py-2 text-center text-gray-700">{fmt(r.busto)}</td>
            <td className="px-3 py-2 text-center text-gray-700">{fmt(r.cintura)}</td>
            <td className="px-3 py-2 text-center text-gray-700">{fmt(r.compr)}</td>
            <td className="px-3 py-2 text-center text-gray-700">{fmt(r.ombro)}</td>
            <td className="px-3 py-2 text-center text-gray-700">{fmt(r.manga)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LowerTable({ rows }: { rows: typeof CALCA_TEC }) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-[#2e3091]/8 text-[#2e3091] text-xs font-semibold uppercase tracking-wide">
          <th className="px-3 py-2 text-left border-b border-gray-200">Tam.</th>
          <th className="px-3 py-2 text-center border-b border-gray-200">Cintura</th>
          <th className="px-3 py-2 text-center border-b border-gray-200">Compr.</th>
          <th className="px-3 py-2 text-center border-b border-gray-200">Quadril</th>
          <th className="px-3 py-2 text-center border-b border-gray-200">Gancho</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50">
            <td className="px-3 py-2 font-semibold text-gray-900">{r.tam}</td>
            <td className="px-3 py-2 text-center text-gray-700">{fmt(r.cintura)}</td>
            <td className="px-3 py-2 text-center text-gray-700">{fmt(r.compr)}</td>
            <td className="px-3 py-2 text-center text-gray-700">{fmt(r.quadril)}</td>
            <td className="px-3 py-2 text-center text-gray-700">{fmt(r.gancho)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SaiaTable({ rows }: { rows: typeof SAIA }) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-[#2e3091]/8 text-[#2e3091] text-xs font-semibold uppercase tracking-wide">
          <th className="px-3 py-2 text-left border-b border-gray-200">Tam.</th>
          <th className="px-3 py-2 text-center border-b border-gray-200">Cintura</th>
          <th className="px-3 py-2 text-center border-b border-gray-200">Compr.</th>
          <th className="px-3 py-2 text-center border-b border-gray-200">Quadril</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50">
            <td className="px-3 py-2 font-semibold text-gray-900">{r.tam}</td>
            <td className="px-3 py-2 text-center text-gray-700">{fmt(r.cintura)}</td>
            <td className="px-3 py-2 text-center text-gray-700">{fmt(r.compr)}</td>
            <td className="px-3 py-2 text-center text-gray-700">{fmt(r.quadril)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function getTableContent(key: TableKey): React.ReactNode {
  switch (key) {
    case 'camiseta-u':     return <UpperTable rows={CAMISETA_U} />;
    case 'agasalho-gab':   return <UpperTable rows={AGASALHO_GAB} />;
    case 'agasalho-tec':   return <UpperTable rows={AGASALHO_TEC} />;
    case 'camisa-bege':    return <UpperTable rows={CAMISA_BEGE} />;
    case 'camisa-branca-m':return <UpperTable rows={CAMISA_BRANCA_M} />;
    case 'camisete-f':     return <CamiseteTable rows={CAMISETE_F} />;
    case 'tunica-f':       return <TunicaFTable rows={TUNICA_F} />;
    case 'tunica-m':       return <UpperTable rows={TUNICA_M} />;
    case 'calca-tec':      return <LowerTable rows={CALCA_TEC} />;
    case 'calca-soc':      return <LowerTable rows={CALCA_SOC} />;
    case 'saia':           return <SaiaTable rows={SAIA} />;
    default:               return null;
  }
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export function GarmentMeasurementsTable({ productName, open, onClose }: Props) {
  const key = detectTable(productName);
  const content = getTableContent(key);

  if (!content) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.36 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40"
            onClick={onClose}
          />

          {/* Painel lateral */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: "easeInOut" }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-[#2e3091]" />
                <h2 className="text-base font-bold text-gray-900">Medidas da peça</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
                <p className="text-xs text-blue-700">
                  Todas as medidas são da <span className="font-semibold">peça pronta</span>, em centímetros (cm).
                  Para comparar: meça uma roupa que já te serve bem.
                </p>
              </div>

              <div className="overflow-x-auto">
                {content}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Retorna true se o produto tem tabela de medidas de vestuário disponível.
 * Usado para esconder o link "Medidas do produto" em produtos sem tabela (sapatos, acessórios).
 */
export function hasGarmentMeasurements(productName: string): boolean {
  return detectTable(productName) !== null;
}

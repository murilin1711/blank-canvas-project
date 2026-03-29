import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface BoinaSizeTableProps {
  productName: string;
}

const boinaData = [
  { size: "54", length: "54 cm" },
  { size: "55", length: "55 cm" },
  { size: "56", length: "56 cm" },
  { size: "57", length: "57 cm" },
  { size: "58", length: "58 cm" },
  { size: "59", length: "59 cm" },
  { size: "60", length: "60 cm" },
  { size: "61", length: "61 cm" },
];

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function BoinaSizeTable({ productName }: BoinaSizeTableProps) {
  const [isOpen, setIsOpen] = useState(false);
  const name = normalize(productName);

  if (!name.includes("boina")) return null;

  return (
    <div className="mt-8 border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50/50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-semibold text-gray-900 tracking-wide text-sm">
          Tabela de Medidas (Boina)
        </span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      
      {isOpen && (
        <div className="border-t border-gray-200 p-0 overflow-x-auto">
          {/* Instruções de Medida */}
          <div className="p-6 bg-white flex flex-col items-center border-b border-gray-200 text-center">
            <h3 className="font-bold text-gray-900 text-lg mb-4 uppercase tracking-wider">
              Como medir o tamanho da boina
            </h3>
            
            {/* Foto Ilustrativa (placeholder, altere o src para usar a foto real se adicionada no projeto) */}
            {/* <img src="/caminho-da-sua-foto.jpg" alt="Instruções" className="max-w-xs mb-4" /> */}
            
            <div className="flex items-start max-w-sm mx-auto text-left gap-3 bg-gray-50 p-4 rounded-xl">
              <span className="flex-shrink-0 font-bold text-lg bg-gray-900 text-white rounded-full w-8 h-8 flex items-center justify-center">
                1
              </span>
              <p className="text-sm text-gray-700 font-medium leading-relaxed">
                Passe uma fita métrica ao redor da cabeça acima da sobrancelha e das orelhas.
              </p>
            </div>
          </div>
          
          <div className="p-4">
            <table className="w-full text-sm text-center border border-gray-200 rounded-lg overflow-hidden border-collapse">
              <thead className="bg-[#1a1a1a] text-white">
                <tr>
                  <th className="px-4 py-3 font-semibold w-1/2 border-r border-[#333]">Tamanho</th>
                  <th className="px-4 py-3 font-semibold w-1/2">Circunferência da Cabeça</th>
                </tr>
              </thead>
              <tbody>
                {boinaData.map((row, i) => (
                  <tr key={i} className="border-b border-gray-200 last:border-0 hover:bg-gray-100 transition-colors even:bg-gray-50/50">
                    <td className="px-4 py-3 font-extrabold text-gray-900 text-base border-r border-gray-200">{row.size}</td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="bg-[#f0e8d0]/60 px-5 py-4 flex items-center gap-4 border-t border-b border-[#e1d3ad]">
            <div className="bg-[#e1ad40] text-amber-950 font-black rounded-md px-3 py-1 text-lg flex items-center justify-center transform scale-110 shadow-sm">
              !
            </div>
            <p className="text-sm font-semibold text-gray-800 flex-1 leading-snug">
              Caso a medida fique entre dois tamanhos, opte pelo maior para mais conforto.
            </p>
          </div>
          
          <div className="text-xs text-center px-5 py-4 bg-gray-50 font-medium text-gray-600">
            Meça a circunferência da cabeça com uma fita métrica e confira o tamanho ideal na tabela.
          </div>
        </div>
      )}
    </div>
  );
}

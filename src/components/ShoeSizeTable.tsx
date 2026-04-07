import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ShoeSizeTableProps {
  productName: string;
}

const olympikusErosData = [
  { size: "34", length: "22,7" },
  { size: "35", length: "23,4" },
  { size: "36", length: "24" },
  { size: "37", length: "24,7" },
  { size: "38", length: "25,4" },
  { size: "39", length: "26" },
  { size: "40", length: "26,7" },
  { size: "41", length: "27,4" },
  { size: "42", length: "28" },
  { size: "43", length: "28,7" },
  { size: "44", length: "29,4" },
];

const olympikusMarteData = [
  { sizeBr: "33", length: "22,5" },
  { sizeBr: "34", length: "23" },
  { sizeBr: "35", length: "23,5" },
  { sizeBr: "36", length: "24" },
  { sizeBr: "37", length: "24,5" },
  { sizeBr: "38", length: "25" },
  { sizeBr: "39", length: "25,5" },
  { sizeBr: "40", length: "26,5" },
  { sizeBr: "41", length: "27,5" },
  { sizeBr: "42", length: "28" },
  { sizeBr: "43", length: "29" },
  { sizeBr: "44", length: "30" },
];

const tenisRandalData = [
  { br: "33", mercosul: "34", euro: "35", cm: "22" },
  { br: "34", mercosul: "35", euro: "36", cm: "22,6" },
  { br: "35", mercosul: "36", euro: "37", cm: "23,3" },
  { br: "36", mercosul: "37", euro: "38", cm: "24" },
  { br: "37", mercosul: "38", euro: "39", cm: "24,6" },
  { br: "38", mercosul: "39", euro: "40", cm: "25,2" },
  { br: "39", mercosul: "40", euro: "41", cm: "25,9" },
  { br: "40", mercosul: "41", euro: "42", cm: "26,6" },
  { br: "41", mercosul: "42", euro: "43", cm: "27,3" },
  { br: "42", mercosul: "43", euro: "44", cm: "28" },
  { br: "43", mercosul: "44", euro: "45", cm: "28,6" },
  { br: "44", mercosul: "45", euro: "46", cm: "29,3" },
];

const tenisLyndData = [
  { size: "34", length: "22,7" },
  { size: "35", length: "23,3" },
  { size: "36", length: "24" },
  { size: "37", length: "24,7" },
  { size: "38", length: "25,3" },
  { size: "39", length: "26" },
  { size: "40", length: "26,7" },
  { size: "41", length: "27,3" },
  { size: "42", length: "28" },
  { size: "43", length: "28,6" },
];

const sapatoModareData = [
  { size: "33", length: "22.1" },
  { size: "34", length: "22.8" },
  { size: "35", length: "23.5" },
  { size: "36", length: "24.1" },
  { size: "37", length: "24.8" },
  { size: "38", length: "25.5" },
  { size: "39", length: "26.1" },
  { size: "40", length: "26.8" },
];

const sapatoSaadData = [
  { size: "35", length: "24,9" },
  { size: "36", length: "25,5" },
  { size: "37", length: "26,1" },
  { size: "38", length: "26,7" },
  { size: "39", length: "27,3" },
  { size: "40", length: "27,9" },
  { size: "41", length: "28,4" },
  { size: "42", length: "29,0" },
  { size: "43", length: "29,5" },
  { size: "44", length: "30,5" },
  { size: "45", length: "31,5" },
];

const sapatoCalpradoData = [
  { size: "34", length: "23,7" },
  { size: "35", length: "24,3" },
  { size: "36", length: "25" },
  { size: "37", length: "25,7" },
  { size: "38", length: "26,3" },
  { size: "39", length: "27" },
  { size: "40", length: "27,7" },
  { size: "41", length: "28,3" },
  { size: "42", length: "29" },
  { size: "43", length: "29,7" },
  { size: "44", length: "30,3" },
];

const sapatoBootWearData = [
  { size: "35", length: "24,80" },
  { size: "36", length: "25,30" },
  { size: "37", length: "25,80" },
  { size: "38", length: "26,30" },
  { size: "39", length: "26,80" },
  { size: "40", length: "27,30" },
  { size: "41", length: "27,80" },
  { size: "42", length: "28,30" },
  { size: "43", length: "28,80" },
  { size: "44", length: "29,30" },
  { size: "45", length: "29,80" },
];

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function ShoeSizeTable({ productName }: ShoeSizeTableProps) {
  const [isOpen, setIsOpen] = useState(false);
  const name = normalize(productName);

  let TypeComponent = null;

  if (name.includes("olympikus eros")) {
    TypeComponent = (
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gray-50 text-gray-600 font-medium">
          <tr>
            <th className="px-4 py-3 border-b">Tamanho</th>
            <th className="px-4 py-3 border-b">Comp. do Pé (cm)</th>
          </tr>
        </thead>
        <tbody>
          {olympikusErosData.map((row, i) => (
            <tr key={i} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{row.size}</td>
              <td className="px-4 py-3 text-gray-700">{row.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else if (name.includes("olympikus marte")) {
    TypeComponent = (
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gray-50 text-gray-600 font-medium">
          <tr>
            <th className="px-4 py-3 border-b">Tamanho (BR)</th>
            <th className="px-4 py-3 border-b">Comp. do Pé (cm)</th>
          </tr>
        </thead>
        <tbody>
          {olympikusMarteData.map((row, i) => (
            <tr key={i} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{row.sizeBr}</td>
              <td className="px-4 py-3 text-gray-700">{row.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else if (name.includes("randal")) {
    TypeComponent = (
      <table className="w-full text-sm text-center border-collapse">
        <thead className="bg-gray-50 text-gray-600 font-medium">
          <tr>
            <th className="px-2 py-3 border-b">TAM BR</th>
            <th className="px-2 py-3 border-b">MERCOSUL</th>
            <th className="px-2 py-3 border-b">EURO</th>
            <th className="px-2 py-3 border-b">CM</th>
          </tr>
        </thead>
        <tbody>
          {tenisRandalData.map((row, i) => (
            <tr key={i} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
              <td className="px-2 py-3 font-medium text-gray-900">{row.br}</td>
              <td className="px-2 py-3 text-gray-700">{row.mercosul}</td>
              <td className="px-2 py-3 text-gray-700">{row.euro}</td>
              <td className="px-2 py-3 text-gray-700">{row.cm}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else if (name.includes("lynd")) {
    TypeComponent = (
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gray-50 text-gray-600 font-medium">
          <tr>
            <th className="px-4 py-3 border-b">Tamanho</th>
            <th className="px-4 py-3 border-b">Comp. do Pé (cm)</th>
          </tr>
        </thead>
        <tbody>
          {tenisLyndData.map((row, i) => (
            <tr key={i} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{row.size}</td>
              <td className="px-4 py-3 text-gray-700">{row.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else if (name.includes("modare")) {
    TypeComponent = (
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gray-50 text-gray-600 font-medium">
          <tr>
            <th className="px-4 py-3 border-b">Tamanho (BR)</th>
            <th className="px-4 py-3 border-b">Comprimento do Pé (cm)</th>
          </tr>
        </thead>
        <tbody>
          {sapatoModareData.map((row, i) => (
            <tr key={i} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{row.size}</td>
              <td className="px-4 py-3 text-gray-700">{row.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else if (name.includes("saad")) {
    TypeComponent = (
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gray-50 text-gray-600 font-medium">
          <tr>
            <th className="px-4 py-3 border-b">Tamanho (BR)</th>
            <th className="px-4 py-3 border-b">Comprimento do Pé (cm)</th>
          </tr>
        </thead>
        <tbody>
          {sapatoSaadData.map((row, i) => (
            <tr key={i} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{row.size}</td>
              <td className="px-4 py-3 text-gray-700">{row.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else if (name.includes("calprado")) {
    TypeComponent = (
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gray-50 text-gray-600 font-medium">
          <tr>
            <th className="px-4 py-3 border-b">Tamanho (BR)</th>
            <th className="px-4 py-3 border-b">Comprimento do Pé (cm)</th>
          </tr>
        </thead>
        <tbody>
          {sapatoCalpradoData.map((row, i) => (
            <tr key={i} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{row.size}</td>
              <td className="px-4 py-3 text-gray-700">{row.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else if (name.includes("bootwear")) {
    TypeComponent = (
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gray-50 text-gray-600 font-medium">
          <tr>
            <th className="px-4 py-3 border-b">Tamanho (BR)</th>
            <th className="px-4 py-3 border-b">Comprimento do Pé (cm)</th>
          </tr>
        </thead>
        <tbody>
          {sapatoBootWearData.map((row, i) => (
            <tr key={i} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{row.size}</td>
              <td className="px-4 py-3 text-gray-700">{row.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (!TypeComponent) return null;

  return (
    <div className="mt-8 border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50/50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-semibold text-gray-900 tracking-wide text-sm">
          Tabela de Medidas
        </span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      
      {isOpen && (
        <div className="border-t border-gray-200 p-0 overflow-x-auto">
          {TypeComponent}
          <div className="text-xs text-gray-500 px-5 py-4 bg-gray-50/30">
            Dica: Meça do calcanhar à ponta do dedão para encontrar a medida correta.
          </div>
        </div>
      )}
    </div>
  );
}

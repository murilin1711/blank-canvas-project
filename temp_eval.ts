
import { recommendSize } from './src/lib/sizeFinder';

const altura = 174;
const peso = 81;
const gender = 'm';
const caimento = 'regular';

const products = [
  { name: 'Camiseta bege manga curta', sizes: ['10', '12', '14', 'P', 'M', 'G', 'GG', 'EXGG'] },
  { name: 'Camisa social bege', sizes: ['10', '12', '14', 'PP', 'P', 'M', 'G', 'GG'] },
  { name: 'Calça Social marrom', sizes: ['30', '32', '34', '36', '38', '40', '42', '44', '46', '48', '50', '52', '54', '56'] },
  { name: 'Calça tectel marrom', sizes: ['10', '12', '14', 'PP', 'P', 'M', 'G', 'GG', 'EXG'] },
  { name: 'Bibico marrom', sizes: ['P', 'M', 'G', 'GG'] },
  { name: 'Agasalho Tectel', sizes: ['10', '12', '14', 'P', 'M', 'G', 'GG', 'EXGG'] },
  { name: 'Agasalho gabardine', sizes: ['10', '12', '14', 'P', 'M', 'G', 'GG', 'EXG'] }
];

products.forEach(p => {
  const result = recommendSize(p.name, gender as "m"|"f", caimento as "regular", altura, peso, p.sizes);
  console.log(`${p.name} -> Size: ${result.primary}`);
});

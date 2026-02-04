
# Plano: Remover Setas + Precos por Variacao + Performance

## 1. Remover Setas de Navegacao das Fotos

As setas serao removidas dos cards de produtos. O usuario navega apenas deslizando o dedo (mobile) ou arrastando/scroll (desktop).

### Arquivos Afetados

| Arquivo | O que remover |
|---------|---------------|
| `src/app/escolas/colegio-militar/page.tsx` | Remover botoes ChevronLeft e ChevronRight (linhas 484-506) |
| `src/components/sections/SimilarProducts.tsx` | Remover botoes de scroll lateral do carrossel (linhas 95-108) |

### Resultado
- Cards de produtos: apenas swipe/drag para trocar fotos
- Indicadores de posicao (bolinhas/linhas) permanecem para mostrar quantas fotos tem

---

## 2. Precos Diferentes por Variacao/Tamanho

### Estrutura Atual das Variacoes
```json
{
  "id": "123",
  "name": "Tamanho",
  "options": ["P", "M", "G", "GG"]
}
```

### Nova Estrutura (com Precos)
```json
{
  "id": "123",
  "name": "Tamanho",
  "options": [
    { "value": "P", "price": null },
    { "value": "M", "price": null },
    { "value": "G", "price": 99.90 },
    { "value": "GG", "price": 109.90 }
  ]
}
```

- `price: null` = usa o preco base do produto
- `price: 99.90` = usa esse preco especifico

### Alteracoes no Admin (ProductFormModal.tsx)

1. Mudar o input de opcoes para incluir campo de preco opcional
2. Interface visual:
```text
┌──────────────────────────────────────────────────┐
│  Tamanho                               [Apagar] │
├──────────────────────────────────────────────────┤
│  [P] R$ ___   [M] R$ ___   [G] R$ 99,90  [x]   │
│                                                  │
│  Nova opcao: [____] Preco: R$ [____] [+]       │
└──────────────────────────────────────────────────┘
```

3. Se o preco estiver vazio, usa o preco base do produto

### Alteracoes na Pagina do Produto

1. Ao selecionar um tamanho/variacao com preco especifico, atualizar o preco exibido
2. Passar o preco correto para o carrinho

---

## 3. Melhorar Performance de Carregamento

### Problemas Identificados
- Imagens do Supabase Storage ja suportam redimensionamento via URL
- Funcao `getOptimizedImageUrl()` existe mas pode nao estar sendo usada em todos os lugares
- Falta lazy loading em algumas imagens

### Solucoes

| Local | Melhoria |
|-------|----------|
| `src/app/escolas/colegio-militar/page.tsx` | Verificar se todas imagens usam `getOptimizedImageUrl(src, 400)` e `loading="lazy"` |
| `src/components/ProductPage.tsx` | Adicionar `getOptimizedImageUrl()` nas imagens da galeria |
| Imagens principais | Usar tamanho menor (400px) para cards, tamanho maior (800px) para pagina do produto |

### Adicionar Skeleton Loading
- Mostrar placeholders cinzas enquanto as imagens carregam
- Melhora a percepcao de velocidade

---

## Arquivos a Modificar

| Arquivo | Alteracoes |
|---------|------------|
| `src/app/escolas/colegio-militar/page.tsx` | Remover setas de navegacao de imagens |
| `src/components/sections/SimilarProducts.tsx` | Remover botoes de scroll do carrossel |
| `src/components/admin/ProductFormModal.tsx` | Adicionar campo de preco por opcao de variacao |
| `src/components/ProductPage.tsx` | Atualizar preco ao selecionar variacao + otimizar imagens |

---

## Detalhes Tecnicos

### Nova Interface de Variacao (TypeScript)
```typescript
interface VariationOption {
  value: string;      // Ex: "P", "M", "G"
  price: number | null; // null = usa preco base
}

interface Variation {
  id: string;
  name: string;
  options: VariationOption[];
}
```

### Compatibilidade com Dados Antigos
O sistema verificara se `option` e string (formato antigo) ou objeto (formato novo) e fara a conversao automatica.

### Calculo de Preco no Frontend
```typescript
const getEffectivePrice = (basePrice: number, selectedSize: string, variations: Variation[]) => {
  const sizeVariation = variations.find(v => 
    v.name.toLowerCase() === 'tamanho' || v.name.toLowerCase() === 'tamanhos'
  );
  
  if (!sizeVariation) return basePrice;
  
  const option = sizeVariation.options.find(o => 
    typeof o === 'object' ? o.value === selectedSize : o === selectedSize
  );
  
  if (typeof option === 'object' && option.price !== null) {
    return option.price;
  }
  
  return basePrice;
};
```

---

## Resultado Esperado

### Navegacao de Fotos
- Sem setas, apenas swipe/drag
- Interface mais limpa e moderna

### Precos por Tamanho
- Admin pode definir preco diferente para cada tamanho
- Preco atualiza dinamicamente na pagina do produto
- Preco correto vai para o carrinho

### Performance
- Imagens otimizadas carregam mais rapido
- Lazy loading evita carregar imagens fora da tela
- Skeleton loading melhora percepcao de velocidade

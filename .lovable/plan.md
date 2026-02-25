

# Exibir Todas as Variacoes do Produto (nao so Tamanho)

## Problema

O `ProductPage` so renderiza o prop `sizes` como botoes selecionaveis. Variacoes customizadas criadas no admin (como "Series", "Cor", etc.) sao passadas no prop `variations` mas **nunca sao renderizadas na tela**. So sao usadas internamente para calcular preco por tamanho.

## Solucao

Renderizar TODAS as variacoes do produto como grupos de botoes selecionaveis, alem do seletor de tamanho que ja existe.

---

## Detalhes Tecnicos

### Arquivo: `src/components/ProductPage.tsx`

**1. Novo estado para variacoes selecionadas**

Trocar o estado simples `selectedSize` por um mapa de selecoes por variacao:

```typescript
// Estado: { "Tamanho": "M", "Series": "1a Serie", "Cor": "Azul" }
const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
```

Manter `selectedSize` como um alias derivado para nao quebrar a logica existente de carrinho e Fit Finder:

```typescript
const selectedSize = selectedVariations["Tamanho"] || selectedVariations["Tamanhos"] || null;
```

**2. Separar variacoes: "Tamanho" vs outras**

```typescript
const sizeVariation = variations.find(v => 
  v.name.toLowerCase() === 'tamanho' || v.name.toLowerCase() === 'tamanhos'
);
const otherVariations = variations.filter(v => 
  v.name.toLowerCase() !== 'tamanho' && v.name.toLowerCase() !== 'tamanhos'
);
```

**3. Renderizar variacoes extras ABAIXO do seletor de tamanho**

Para cada variacao que nao e "Tamanho", renderizar um bloco com titulo e botoes:

```tsx
{otherVariations.map((variation) => (
  <div key={variation.id} className="mt-4">
    <span className="text-sm font-medium text-gray-900 mb-2 block">
      {variation.name}
    </span>
    <div className="flex gap-2 flex-wrap">
      {variation.options.map((opt) => {
        const value = getOptionValue(opt);
        const selected = selectedVariations[variation.name] === value;
        const optionImg = getOptionImage(opt);
        return (
          <button
            key={value}
            onClick={() => {
              setSelectedVariations(prev => ({...prev, [variation.name]: value}));
              if (optionImg) {
                const idx = images.findIndex(img => img === optionImg);
                if (idx >= 0) setActiveIndex(idx);
              }
            }}
            className={/* mesmo estilo dos botoes de tamanho */}
          >
            {value}
          </button>
        );
      })}
    </div>
  </div>
))}
```

**4. Incluir variacoes selecionadas no carrinho**

Atualizar o `size` enviado ao carrinho para incluir todas as selecoes. Por exemplo, se o usuario selecionou Tamanho M e Series 1a Serie, o campo `size` ficaria: `"M | Series: 1a Serie"`.

```typescript
const buildSizeLabel = (): string => {
  const parts: string[] = [];
  if (selectedSize) parts.push(selectedSize);
  otherVariations.forEach(v => {
    const sel = selectedVariations[v.name];
    if (sel) parts.push(`${v.name}: ${sel}`);
  });
  return parts.join(" | ") || "";
};
```

**5. Validacao antes de adicionar ao carrinho**

Verificar que todas as variacoes obrigatorias foram selecionadas (nao apenas tamanho):

```typescript
if (!selectedSize) {
  toast.error("Selecione um tamanho");
  return;
}
// Verificar outras variacoes
for (const v of otherVariations) {
  if (!selectedVariations[v.name]) {
    toast.error(`Selecione: ${v.name}`);
    return;
  }
}
```

**6. Calculo de preco efetivo**

Expandir o calculo de preco para considerar precos de qualquer variacao (nao so Tamanho):

```typescript
const effectivePrice = useMemo(() => {
  let finalPrice = basePrice ?? parseFloat(...);
  for (const variation of variations) {
    const selectedVal = selectedVariations[variation.name];
    if (!selectedVal) continue;
    const opt = variation.options.find(o => getOptionValue(o) === selectedVal);
    if (opt) {
      const optPrice = getOptionPrice(opt);
      if (optPrice !== null) finalPrice = optPrice;
    }
  }
  return finalPrice;
}, [selectedVariations, variations, price, basePrice]);
```

---

## Resumo

| Arquivo | O que muda |
|---------|-----------|
| `src/components/ProductPage.tsx` | Novo estado `selectedVariations` (mapa), renderizar todas as variacoes como botoes, incluir selecoes no carrinho, validar todas antes de adicionar |

## Observacoes

- O seletor de "Tamanho" continua no mesmo lugar com Fit Finder
- As variacoes extras aparecem logo abaixo do seletor de tamanho
- Nenhuma mudanca no banco de dados ou no admin e necessaria
- Se um produto nao tem variacoes extras, o comportamento e identico ao atual


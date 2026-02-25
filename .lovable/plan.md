

# Remover Tamanhos Padrao Quando Nao Ha Variacao de Tamanho

## Problema

Quando um produto tem apenas variacoes customizadas (ex: "Series") mas nenhuma variacao de "Tamanho", o sistema ainda exibe os tamanhos padrao P, M, G, GG. Isso acontece porque:

1. Em `produto/[id]/page.tsx` linha 103: `product.sizes || ["P", "M", "G", "GG"]` sempre gera um fallback
2. O `sizes` prop e sempre passado ao `ProductPage`, que renderiza os botoes de tamanho incondicionalmente

## Solucao

Se o produto tem variacoes definidas no admin mas nenhuma delas e "Tamanho"/"Tamanhos", nao passar tamanhos padrao.

---

## Detalhes Tecnicos

### Arquivo: `src/app/escolas/colegio-militar/produto/[id]/page.tsx`

Alterar a logica de calculo de `productSizes` (linhas 102-115):

```typescript
let productSizes: string[] = [];

if (product.variations && Array.isArray(product.variations)) {
  const sizeVariation = product.variations.find(
    (v: any) => v.name?.toLowerCase() === "tamanho" || v.name?.toLowerCase() === "tamanhos"
  );
  if (sizeVariation && Array.isArray(sizeVariation.options)) {
    productSizes = sizeVariation.options.map((opt: any) =>
      typeof opt === 'string' ? opt : opt.value
    );
  }
} else {
  // Sem variacoes definidas no admin -> usar sizes do produto ou fallback
  productSizes = product.sizes || ["P", "M", "G", "GG"];
}
```

Logica: se o produto tem variacoes no admin, so mostra tamanhos se existir uma variacao "Tamanho". Se nao tem variacoes nenhuma, usa o fallback padrao.

### Arquivo: `src/components/ProductPage.tsx`

Garantir que o bloco de selecao de tamanho so renderiza se `sizes` tiver itens (provavelmente ja funciona se `sizes` for array vazio, mas verificar).

| Arquivo | O que muda |
|---------|-----------|
| `src/app/escolas/colegio-militar/produto/[id]/page.tsx` | Logica condicional para nao gerar tamanhos padrao quando ha variacoes sem "Tamanho" |
| `src/components/ProductPage.tsx` | Condicionar renderizacao do seletor de tamanho a `sizes.length > 0` |


# Plano: Remover Setas + Precos por Variacao + Performance

## ✅ CONCLUÍDO

### 1. Remover Setas de Navegacao das Fotos

**Status:** ✅ Concluído

As setas foram removidas dos cards de produtos. O usuario navega apenas deslizando o dedo (mobile) ou arrastando/scroll (desktop).

**Arquivos Modificados:**
- `src/app/escolas/colegio-militar/page.tsx` - Removidos botões ChevronLeft e ChevronRight
- `src/components/sections/SimilarProducts.tsx` - Removidos botões de scroll lateral do carrossel

**Resultado:**
- Cards de produtos: apenas swipe/drag para trocar fotos
- Indicadores de posição (linhas finas) permanecem para mostrar quantas fotos tem

---

### 2. Precos Diferentes por Variacao/Tamanho

**Status:** ✅ Concluído

**Nova Estrutura de Variação:**
```typescript
interface VariationOption {
  value: string;      // Ex: "P", "M", "G"
  price: number | null; // null = usa preço base
}

interface Variation {
  id: string;
  name: string;
  options: (string | VariationOption)[]; // Suporta formato antigo e novo
}
```

**Arquivos Modificados:**
- `src/components/admin/ProductFormModal.tsx` - Adicionado campo de preço por opção de variação
- `src/components/ProductPage.tsx` - Preço atualiza dinamicamente ao selecionar variação
- `src/app/escolas/colegio-militar/produto/[id]/page.tsx` - Passa variações para o ProductPage

**Funcionalidades:**
- Admin pode definir preço diferente para cada tamanho/opção
- Se o preço estiver vazio, usa o preço base do produto
- Preço atualiza dinamicamente na página do produto ao selecionar tamanho
- Preço correto vai para o carrinho
- Compatível com dados antigos (formato string)

---

### 3. Melhorar Performance de Carregamento

**Status:** ✅ Concluído

**Arquivos Modificados:**
- `src/components/ProductPage.tsx` - Adicionado `getOptimizedImageUrl()` e `loading="lazy"` em todas as imagens
- `src/app/escolas/colegio-militar/page.tsx` - Já estava usando otimização
- `src/components/sections/SimilarProducts.tsx` - Já estava usando otimização

**Melhorias:**
- Imagens da galeria do produto usam `getOptimizedImageUrl(img, 800)` para tamanho maior
- Thumbnails usam `getOptimizedImageUrl(img, 300)` para tamanho menor
- Lazy loading aplicado em imagens secundárias
- Cards de produto na listagem usam `getOptimizedImageUrl(src, 400)`

---

## Resumo das Alterações

| Arquivo | Alterações |
|---------|------------|
| `src/app/escolas/colegio-militar/page.tsx` | Removidas setas de navegação de imagens |
| `src/components/sections/SimilarProducts.tsx` | Removidos botões de scroll do carrossel |
| `src/components/admin/ProductFormModal.tsx` | Adicionado campo de preço por opção de variação |
| `src/components/ProductPage.tsx` | Preço dinâmico por variação + otimização de imagens |
| `src/app/escolas/colegio-militar/produto/[id]/page.tsx` | Passa variações para ProductPage |

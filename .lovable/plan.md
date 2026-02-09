
# Plano: Corrigir Produtos com Preço por Tamanho + Acelerar Carregamento

## Problema 1: Produtos com preço variável não abrem

A causa raiz está no arquivo `src/app/escolas/colegio-militar/produto/[id]/page.tsx`. Quando um produto tem variações com preço por tamanho (ex: Saia Marrom), os dados vêm assim do banco:

```text
options: ["30", "32", ..., {price: 116.9, value: "46"}, {price: 116.9, value: "48"}]
```

O código atual na linha 84 passa esses objetos diretamente para o prop `sizes`, que espera apenas strings. Quando o React tenta renderizar `{size}` com um objeto, dá erro e a página quebra.

### Correção

No `DynamicProductPage`, ao extrair os tamanhos das variações, converter os objetos para strings:

```typescript
// Antes (quebra):
productSizes = sizeVariation.options;

// Depois (funciona):
productSizes = sizeVariation.options.map((opt: any) =>
  typeof opt === 'string' ? opt : opt.value
);
```

O preço por variação já é tratado corretamente pelo `ProductPage.tsx` via o prop `variations` (que recebe os dados completos com preços).

**Arquivo:** `src/app/escolas/colegio-militar/produto/[id]/page.tsx` (linha 85)

---

## Problema 2: Produtos demoram para abrir

Atualmente, ao clicar num produto, a tela fica em branco com um spinner enquanto faz a query ao banco. Para parecer "quase instantâneo":

### Correções

1. **Substituir tela de loading por skeleton** -- ao invés de uma tela branca com spinner, mostrar um layout esqueleto (skeleton) que já tem o formato da página de produto (galeria + info). Isso dá percepção de velocidade.

2. **Preload da imagem principal** -- após buscar o produto do banco, usar `<link rel="preload">` para a primeira imagem antes de renderizar.

**Arquivo:** `src/app/escolas/colegio-militar/produto/[id]/page.tsx`

---

## Resumo de Alterações

| Arquivo | O que muda |
|---------|-----------|
| `src/app/escolas/colegio-militar/produto/[id]/page.tsx` | Converter objetos de variação para strings no `sizes`; trocar spinner por skeleton layout |

### Detalhes Técnicos

O skeleton layout terá:
- Um retangulo cinza animado no lugar da galeria (aspect-ratio 3/4)
- Barras cinzas animadas no lugar do nome, preco e descricao
- Botoes cinzas no lugar dos tamanhos

Isso faz o usuario perceber que a pagina ja carregou e so os dados estao chegando, em vez de ver uma tela vazia.

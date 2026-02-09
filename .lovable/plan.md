

# Plano: Imagens Carregando Instantaneamente

## Problema Raiz Identificado

A funcao `getOptimizedImageUrl` nao esta funcionando. As URLs dos produtos usam o caminho `/object/public/` (arquivo original, sem transformacao). A funcao apenas adiciona `?width=400` nesse caminho, mas o Supabase **ignora esses parametros** em URLs `/object/`. Para que a transformacao funcione, a URL precisa usar `/render/image/public/`.

Resultado atual: o navegador baixa a imagem **original em tamanho cheio** (varios MB) em vez de uma versao redimensionada (poucos KB). Por isso demora e as fotos "carregam pela metade".

## Correcao

### 1. Corrigir `getOptimizedImageUrl` (src/lib/utils.ts)

Converter URLs de `/object/public/` para `/render/image/public/` antes de adicionar os parametros de redimensionamento. Isso faz o Supabase servir a imagem ja redimensionada no servidor.

```text
Antes:  .../storage/v1/object/public/product-images/foto.png?width=400
Depois: .../storage/v1/render/image/public/product-images/foto.png?width=400&resize=contain
```

Tambem limpar parametros duplicados caso a URL ja tenha `width`/`height`/`resize`.

### 2. Reduzir tamanho das imagens no mobile

- Grade de produtos (listing): 400px de largura (ja esta)
- Pagina do produto no mobile: reduzir de 800px para 500px (suficiente para telas de celular)
- Thumbnails no desktop: usar 200px em vez de 800px

### 3. Preload da primeira imagem na pagina de produto

Apos buscar o produto do banco, injetar um `<link rel="preload">` no `<head>` para a primeira imagem ja com a URL otimizada, fazendo o browser comecar o download antes mesmo do React renderizar o componente.

## Resumo de Alteracoes

| Arquivo | O que muda |
|---------|-----------|
| `src/lib/utils.ts` | Corrigir `getOptimizedImageUrl` para usar `/render/image/` em vez de `/object/`; limpar params duplicados |
| `src/components/ProductPage.tsx` | Reduzir imagem mobile para 500px; thumbnails para 200px |
| `src/app/escolas/colegio-militar/produto/[id]/page.tsx` | Preload da primeira imagem no head |

## Impacto Esperado

- Imagens na grade: de ~2-5MB cada para ~30-80KB cada (reducao de 95%+)
- Imagens no produto: de ~2-5MB para ~100-200KB
- Carregamento percebido: praticamente instantaneo


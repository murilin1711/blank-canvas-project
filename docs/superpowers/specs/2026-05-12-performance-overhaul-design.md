# Performance Overhaul — GM Minas
**Data:** 2026-05-12
**Escopo:** Imagens, bundle JS, carregamento de páginas, checkout

---

## Contexto

Usuários relatam lentidão geral: imagens, navegação entre páginas e checkout. Análise do build e do código identificou 6 problemas concretos.

---

## Problemas identificados

| # | Problema | Impacto |
|---|----------|---------|
| 1 | `getOptimizedImageUrl` remove parâmetros em vez de otimizar | Todas as imagens servidas em tamanho original |
| 2 | Carrossel de produtos pede `width=8000` nas URLs | Imagens ~10× maiores que o necessário |
| 3 | Várias imagens abaixo da dobra sem `loading="lazy"` | Baixadas desnecessariamente no carregamento inicial |
| 4 | Home page não usa `lazy()` — entra no bundle principal (325 KB) | Primeiro carregamento mais lento |
| 5 | Framer Motion (118 KB) carrega antes de qualquer página aparecer | Bloqueia renderização inicial |
| 6 | `Suspense fallback={null}` — tela branca durante navegação | UX degradada em conexões lentas |

---

## Seção 1 — Imagens

### 1.1 Corrigir `getOptimizedImageUrl` (`src/lib/utils.ts`)

Usar a API de transformação do Supabase (`/render/image/public/`) com parâmetros corretos.

Tamanhos por contexto:
- Banners hero: `width=1200, quality=80`
- Produtos (carrossel / grid / página): `width=600, quality=80`
- Thumbnails (carrinho / header / similares): `width=120, quality=80`

A função recebe `url` e `width` e devolve a URL otimizada. Se a URL já tem `/render/image/public/`, substitui os parâmetros. Se tem `/object/public/`, converte para `/render/image/public/`.

### 1.2 Corrigir URLs hardcoded do carrossel (`src/components/sections/product-carousel.tsx`)

Substituir todos os `?width=8000&height=8000&resize=contain` por `?width=600&quality=80&resize=contain`.

### 1.3 `loading="lazy"` e dimensões explícitas

Adicionar `loading="lazy"` em:
- `product-carousel.tsx` — imagens dos cards
- `suppliers-carousel.tsx` — logos dos fornecedores
- `SimilarProducts.tsx` — já tem, verificar

O banner hero (primeiro slide) mantém `fetchPriority="high"` e `loading="eager"`. Slides seguintes recebem `loading="lazy"`.

---

## Seção 2 — Bundle e Carregamento de Páginas

### 2.1 Lazy load da Home page (`src/App.tsx`)

Converter:
```ts
// antes
import Home from '@/app/page';

// depois
const HomePage = lazy(() => import('@/app/page'));
```

### 2.2 Chunk separado para Framer Motion (`vite.config.ts`)

O chunk `vendor-motion` já existe mas é carregado junto com o bundle inicial. Garantir que ele seja um chunk assíncrono separado, não referenciado diretamente pelo `index.js`.

### 2.3 Skeleton de carregamento (`src/components/LoadingScreen.tsx` ou inline no `App.tsx`)

Substituir `fallback={null}` por um skeleton leve:
- Header com altura fixa (não reflash)
- Área de conteúdo com `animate-pulse` cinza
- Desaparece assim que o chunk da página carrega

### 2.4 Preload do vídeo hero (`index.html`)

Adicionar antes do `</head>`:
```html
<link rel="preload" as="video" href="/videos/hero-video.mp4" type="video/mp4">
```

---

## Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `src/lib/utils.ts` | Reescrever `getOptimizedImageUrl` |
| `src/components/sections/product-carousel.tsx` | Corrigir URLs + `loading="lazy"` |
| `src/components/sections/suppliers-carousel.tsx` | Adicionar `loading="lazy"` |
| `src/components/sections/hero-banner.tsx` | Garantir `loading="eager"` só no slide 0 |
| `src/App.tsx` | Lazy load da Home + skeleton no Suspense |
| `vite.config.ts` | Ajuste nos `manualChunks` |
| `index.html` | Preload do vídeo hero |

---

## Resultado esperado

- **LCP (Largest Contentful Paint):** redução com preload do vídeo/banner e imagens otimizadas
- **Bundle inicial:** redução com lazy load da Home e separação do Framer Motion
- **CLS (Layout Shift):** eliminado com dimensões explícitas nas imagens
- **Navegação:** sem tela branca graças ao skeleton

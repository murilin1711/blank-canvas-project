

# Corrigir Swipe Mobile (de vez) + Setas Desktop nos Cards de Produto

## Problema 1: Swipe Pulando Foto

Mesmo com `passive: false` e a flag `swiped`, o swipe continua pulando uma foto. A causa mais provavel e que o browser ainda dispara um segundo evento (pointer ou gesture) que acaba chamando `setActiveIndex` uma segunda vez antes do proximo render. A solucao definitiva e adicionar um **lock com timeout** alem da flag `swiped` -- isso garante que nenhum evento consiga avancar a foto por pelo menos 400ms apos um swipe.

## Problema 2: Setas no Desktop (Cards da Listagem)

Na pagina do Colegio Militar (`/escolas/colegio-militar`), os cards de produto nao tem setas para navegar entre as fotos no desktop. Precisa adicionar botoes ChevronLeft/ChevronRight que aparecem no hover, igual ao que ja existe na pagina de detalhe do produto.

---

## Detalhes Tecnicos

### Arquivo: `src/components/ProductPage.tsx`

Adicionar um ref `swipeLocked` e um timeout de 400ms no handler `onTouchEnd` dentro do `useEffect`:

```typescript
const swipeLocked = useRef(false);

// Dentro do useEffect, no onTouchEnd:
const onTouchEnd = (e: TouchEvent) => {
  if (touchDirection.current !== 'horizontal' || swiped.current || swipeLocked.current) return;
  const diff = touchStartX.current - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 60) {
    swiped.current = true;
    swipeLocked.current = true;
    setTimeout(() => { swipeLocked.current = false; }, 400);
    if (diff > 0) {
      setActiveIndex((prev) => (prev + 1) % images.length);
    } else {
      setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  }
};
```

### Arquivo: `src/app/escolas/colegio-militar/page.tsx`

Adicionar setas de navegacao nos cards de produto (dentro do container da imagem), visiveis apenas no hover no desktop:

```typescript
{/* Setas desktop - dentro do container da imagem, apos os indicadores */}
{p.images.length > 1 && (
  <>
    <button
      onClick={(ev) => { ev.stopPropagation(); prevImage(p.id, p.images.length); }}
      className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-md"
      aria-label="Foto anterior"
    >
      <ChevronLeft className="w-4 h-4 text-gray-700" />
    </button>
    <button
      onClick={(ev) => { ev.stopPropagation(); nextImage(p.id, p.images.length); }}
      className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-md"
      aria-label="Proxima foto"
    >
      <ChevronRight className="w-4 h-4 text-gray-700" />
    </button>
  </>
)}
```

---

## Resumo

| Arquivo | O que muda |
|---------|-----------|
| `src/components/ProductPage.tsx` | Adicionar lock com timeout de 400ms para impedir duplo-avanco no swipe mobile |
| `src/app/escolas/colegio-militar/page.tsx` | Adicionar setas ChevronLeft/ChevronRight nos cards de produto, visiveis no hover desktop |


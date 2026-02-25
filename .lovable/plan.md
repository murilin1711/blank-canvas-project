

# Plano: Corrigir Swipe Mobile, Verificar Scroll e Adicionar Setas no Desktop

## 1. Corrigir Swipe Mobile na Pagina do Produto (ProductPage.tsx)

**Problema persistente**: O `touchAction: 'pan-y'` permite o browser processar gestos horizontais nativamente em paralelo com o JavaScript. Mesmo com `passive: false` e `preventDefault()`, o CSS `transition-all` pode causar re-renders que disparam mudancas duplas de indice.

**Solucao definitiva**:
- Remover `touchAction: 'pan-y'` e usar `touchAction: 'none'` no container da galeria mobile para bloquear completamente o handling nativo de toque
- Implementar scroll vertical manualmente: quando `touchDirection` for `'vertical'`, fazer `window.scrollBy()` no `touchmove` para manter o scroll da pagina funcionando
- Adicionar debounce no `setActiveIndex`: usar um `setTimeout` de 350ms (duracao da animacao) para ignorar novos swipes durante a transicao
- Adicionar ref `isAnimating` que impede novos swipes ate a animacao terminar

## 2. Adicionar Setas no Desktop na Listagem de Produtos (colegio-militar/page.tsx)

**Problema**: As setas de navegacao foram removidas dos cards de produto na listagem do Colegio Militar. O usuario quer que voltem.

**Solucao**: Adicionar botoes `ChevronLeft` e `ChevronRight` nos cards de produto da pagina de listagem:
- Aparecem apenas no hover do card (desktop)
- Posicionadas nos lados esquerdo e direito da imagem
- So aparecem se o produto tem mais de 1 imagem
- Estilo: fundo branco/80, backdrop-blur, arredondado, com `stopPropagation` para nao navegar ao produto

## 3. Verificar Scroll Restoration (ja implementado)

O `ScrollToTop.tsx` ja implementa restauracao de scroll com `MutationObserver`. Vou verificar se esta funcionando corretamente e ajustar se necessario.

---

## Detalhes Tecnicos

### Arquivo: `src/components/ProductPage.tsx`

Substituir a logica de touch na galeria mobile:

```text
// Adicionar ref de animacao
const isAnimating = useRef(false);

// No useEffect de touch listeners:
const onTouchEnd = (e: TouchEvent) => {
  if (touchDirection.current !== 'horizontal' || swiped.current || isAnimating.current) return;
  const diff = touchStartX.current - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 60) {
    swiped.current = true;
    isAnimating.current = true;
    // ... setActiveIndex ...
    setTimeout(() => { isAnimating.current = false; }, 350);
  }
};

// Mudar touchAction de 'pan-y' para 'none'
// No onTouchMove, quando vertical, fazer window.scrollBy manualmente
```

### Arquivo: `src/app/escolas/colegio-militar/page.tsx`

Adicionar setas de navegacao nos cards de produto (dentro do container de imagem, apos os indicadores):

```text
{p.images.length > 1 && (
  <>
    <button
      onClick={(ev) => { ev.stopPropagation(); prevImage(p.id, p.images.length); }}
      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
    >
      <ChevronLeft className="w-4 h-4 text-gray-700" />
    </button>
    <button
      onClick={(ev) => { ev.stopPropagation(); nextImage(p.id, p.images.length); }}
      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
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
| `src/components/ProductPage.tsx` | Corrigir swipe definitivamente: `touchAction: none`, scroll vertical manual, guard de animacao |
| `src/app/escolas/colegio-militar/page.tsx` | Adicionar setas ChevronLeft/Right nos cards de produto no desktop |


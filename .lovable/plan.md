
# Corrigir Swipe da Galeria de Fotos (Bug de Pular Foto)

## Causa Raiz

O problema e que o React registra os eventos `onTouchMove` como **passive listeners** por padrao. Isso significa que `e.preventDefault()` dentro do `handleTouchMove` **nao funciona** -- o navegador ignora a chamada. O resultado e que o browser continua processando o toque nativamente ao mesmo tempo que o codigo JavaScript tambem processa, causando **dois avancos** por gesto (o nativo + o do codigo).

## Solucao

Usar `useEffect` + `addEventListener` com `{ passive: false }` no container da galeria mobile. Isso garante que `preventDefault()` realmente bloqueia o comportamento nativo do browser durante swipes horizontais.

## Detalhes Tecnicos

### Arquivo: `src/components/ProductPage.tsx`

1. Adicionar um `ref` para o container da galeria mobile (`galleryRef`)

2. Mover os handlers `touchmove` e `touchstart` para um `useEffect` que registra os eventos diretamente no DOM com `{ passive: false }`:

```typescript
const galleryRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const el = galleryRef.current;
  if (!el) return;

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchDirection.current = null;
    swiped.current = false;
  };

  const onTouchMove = (e: TouchEvent) => {
    if (touchDirection.current === 'vertical' || swiped.current) return;
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (!touchDirection.current && (dx > 10 || dy > 10)) {
      touchDirection.current = dx > dy ? 'horizontal' : 'vertical';
    }
    if (touchDirection.current === 'horizontal') {
      e.preventDefault(); // Agora funciona porque passive: false
    }
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (touchDirection.current !== 'horizontal' || swiped.current) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      swiped.current = true;
      if (diff > 0) {
        setActiveIndex(prev => (prev + 1) % images.length);
      } else {
        setActiveIndex(prev => (prev - 1 + images.length) % images.length);
      }
    }
  };

  el.addEventListener('touchstart', onTouchStart, { passive: true });
  el.addEventListener('touchmove', onTouchMove, { passive: false });
  el.addEventListener('touchend', onTouchEnd, { passive: true });

  return () => {
    el.removeEventListener('touchstart', onTouchStart);
    el.removeEventListener('touchmove', onTouchMove);
    el.removeEventListener('touchend', onTouchEnd);
  };
}, [images.length]);
```

3. Remover os handlers `onTouchStart`, `onTouchMove`, `onTouchEnd` inline do JSX e os `useCallback` correspondentes

4. Adicionar `ref={galleryRef}` no container da galeria mobile

5. Manter `style={{ touchAction: 'pan-y' }}` no container

## Resumo

| Arquivo | O que muda |
|---------|-----------|
| `src/components/ProductPage.tsx` | Trocar event listeners React (passive) por addEventListener nativo com `passive: false` para que `preventDefault()` funcione no touchmove |

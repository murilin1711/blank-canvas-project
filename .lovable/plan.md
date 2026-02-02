

# Plano: Melhorar Reordenação de Fotos no Mobile + Performance

## Problemas Identificados

### 1. Reordenação de Fotos Ruim no Mobile
- O `Reorder.Group axis="x"` do framer-motion não funciona bem com toque
- A classe `touch-none` impede interação normal
- Arrastar horizontal compete com scroll da página
- Imagens pequenas (96px) são difíceis de segurar com o dedo

### 2. Site Travado
- O arquivo admin/page.tsx tem 2096 linhas
- Framer-motion com muitas animações pode causar lentidão
- Re-renders desnecessários do modal de produto

---

## Solução: Interface Híbrida Desktop/Mobile

### No Mobile: Botões de Seta
Substituir drag-and-drop por **botões simples** para mover imagens:

```text
┌─────────────────────────────────┐
│  ◀ Mover   [IMAGEM]   Mover ▶  │
│            🗑️ Apagar            │
│          "Principal"            │
└─────────────────────────────────┘
```

- Botão ◀ move a imagem para esquerda
- Botão ▶ move a imagem para direita  
- Funciona perfeitamente com toque
- Sem conflito com scroll

### No Desktop: Manter Drag-and-Drop
- Continua usando `Reorder.Group` para quem usa mouse
- Experiência intuitiva para desktop

---

## Detalhes Técnicos

### 1. Detectar Dispositivo Mobile
Usar o hook `useIsMobile()` existente em `src/hooks/use-mobile.ts`

### 2. Funções de Reordenação
```typescript
const moveImage = (index: number, direction: 'left' | 'right') => {
  const newIndex = direction === 'left' ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= form.images.length) return;
  
  const newImages = [...form.images];
  [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
  setForm(prev => ({ ...prev, images: newImages }));
};
```

### 3. Renderização Condicional
- **Mobile:** Grid de imagens com botões de seta (sem Reorder)
- **Desktop:** `Reorder.Group` com drag-and-drop normal

### 4. Otimização de Performance
- Remover `touch-none` que impede interações
- Usar `React.memo` para evitar re-renders desnecessários
- Simplificar animações no mobile

---

## Arquivo a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/admin/ProductFormModal.tsx` | Adicionar detecção mobile + interface com botões de seta + manter drag para desktop |

---

## Resultado Esperado

### Mobile (Depois)
- Botões ◀ ▶ claros e grandes em cada imagem
- Botão 🗑️ sempre visível
- Operação com **um toque** por vez
- Scroll normal da página funciona
- Site mais responsivo

### Desktop (Sem mudança significativa)
- Drag-and-drop continua funcionando


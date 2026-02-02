
# Plano: Corrigir Botão de Apagar Fotos no Mobile + Melhorias

## Problema Identificado
O botão de remover imagens usa `opacity-0 group-hover:opacity-100`, que depende do hover do mouse. Em celulares/tablets não existe hover, então o botão fica **permanentemente invisível**.

---

## Solução

### 1. Botão de Apagar Sempre Visível
Modificar o estilo do botão para ficar **sempre visível** (sem depender de hover):

**Antes:**
```
className="... opacity-0 group-hover:opacity-100 ..."
```

**Depois:**
```
className="... opacity-100 ..."
```

Também vou melhorar o visual para que fique mais discreto mas ainda visível:
- Fundo vermelho semi-transparente
- Ícone de lixeira (Trash2) em vez de X simples
- Posição no canto superior direito

---

### 2. Adicionar Drag-and-Drop para Reordenar
Implementar arrastar e soltar nas imagens:
- Usar `framer-motion` (já instalado) com `Reorder` 
- Ícone de arrastar (GripVertical) no canto superior esquerdo
- Animação suave ao mover imagens
- A primeira imagem continua sendo marcada como "Principal"

---

### 3. Outras Melhorias do Plano Anterior
- Remover "troca ou devolução grátis" dos produtos
- Trocar "Similares" para "Você pode precisar"
- Otimizar carregamento de imagens

---

## Arquivo a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/admin/ProductFormModal.tsx` | Botão apagar sempre visível + drag-and-drop |
| `src/components/ProductPage.tsx` | Remover "troca ou devolução grátis" |
| `src/components/sections/SimilarProducts.tsx` | Trocar título para "Você pode precisar" |
| `src/app/escolas/colegio-militar/page.tsx` | Otimizar imagens com lazy loading |
| `src/lib/utils.ts` | Função para URLs otimizadas |

---

## Resultado Visual Esperado

### Antes (Mobile)
- Botão de apagar: **Invisível**
- Reordenar: Não disponível

### Depois (Mobile)
- Botão de apagar: **Sempre visível** (ícone vermelho no canto)
- Reordenar: Arrastar imagens com toque
- Visual limpo e funcional


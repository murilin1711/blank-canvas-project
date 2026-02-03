

# Plano: Corrigir Categorias + Seleção de Produtos Similares + Preservar Scroll

## Problemas Identificados

### 1. Gerenciar Categorias Nao Funciona
**Problema:** O `CategoryManager` mostra "Categoria adicionada!" mas nao salva de verdade no banco de dados. A funcao `handleAddCategory` no admin apenas exibe um toast, sem persistir nada.

```typescript
// Codigo atual - NAO SALVA NADA!
const handleAddCategory = async (category: string) => {
  toast.success(`Categoria "${category}" adicionada!`);
  // Falta: adicionar a categoria ao estado local e/ou banco
};
```

As categorias sao extraidas dos produtos existentes (`availableCategories`), entao nao existe uma tabela separada para gerenciar. Isso causa:
- Adicionar categoria: Aparece mensagem de sucesso, mas nao aparece na lista
- Editar categoria: Funciona parcialmente (atualiza os produtos)
- A lista fica vazia se nenhum produto tiver categoria

### 2. Selecao de Produtos Similares e Trabalhosa
**Problema:** O dropdown atual adiciona apenas 1 produto por vez, fechando apos cada selecao. Para adicionar 5 produtos, o usuario precisa clicar 5 vezes no dropdown.

### 3. Scroll Volta ao Topo ao Navegar
**Problema:** O componente `ScrollToTop` faz `window.scrollTo(0, 0)` em TODA mudanca de rota, inclusive ao voltar. O comportamento correto seria:
- Scroll pro topo em navegacao nova (clique em link)
- Manter posicao anterior ao usar o botao "Voltar" do navegador

---

## Solucoes Propostas

### Correcao 1: Sistema de Categorias com Persistencia Local

Como as categorias sao dinamicas (extraidas dos produtos), vamos:
1. Adicionar um estado local `customCategories` para categorias adicionadas manualmente
2. Combinar `customCategories` + categorias dos produtos para exibir na lista
3. Salvar `customCategories` no `localStorage` para persistir entre sessoes
4. Ao adicionar categoria: adiciona ao estado local + localStorage
5. Ao editar/deletar: atualiza produtos E estado local

```typescript
// Estado para categorias personalizadas
const [customCategories, setCustomCategories] = useState<string[]>(() => {
  const saved = localStorage.getItem('admin_custom_categories');
  return saved ? JSON.parse(saved) : [];
});

// Combinar categorias
const allCategories = [...new Set([
  ...customCategories,
  ...products.filter(p => p.category).map(p => p.category!)
])].sort();
```

### Correcao 2: Seletor Multi-Select com Checkboxes

Substituir o dropdown `<select>` por um painel com checkboxes que permite:
- Ver todos os produtos disponiveis com imagem miniatura
- Marcar/desmarcar varios de uma vez
- Fechar quando terminar
- Grid visual com imagens para facilitar identificacao

```text
┌─────────────────────────────────────────────────┐
│  Selecionar Produtos Similares                 │
├─────────────────────────────────────────────────┤
│  ☑ [img] Calca Tectel           ☑ [img] Agasalho│
│  ☐ [img] Camiseta Bege          ☐ [img] Boina  │
│  ☑ [img] Tenis Preto            ☐ [img] Cinto  │
└─────────────────────────────────────────────────┘
```

### Correcao 3: Preservar Scroll com Historico

Mudar de `ScrollToTop` simples para um sistema que detecta o tipo de navegacao:
- **Navegacao nova (Link/clique):** Scroll pro topo
- **Navegacao de historico (Voltar/Avancar):** Restaura posicao salva

Usaremos `scrollRestoration: 'manual'` + `popstate` event para detectar navegacao de historico.

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/app/admin/page.tsx` | Adicionar estado `customCategories` + localStorage + corrigir `handleAddCategory` |
| `src/components/admin/ProductFormModal.tsx` | Substituir dropdown por grid com checkboxes para produtos similares |
| `src/components/ScrollToTop.tsx` | Implementar preservacao de scroll no historico de navegacao |
| `src/App.tsx` | Configurar `scrollRestoration: 'manual'` |

---

## Detalhes Tecnicos

### 1. Persistencia de Categorias (admin/page.tsx)

```typescript
// Estado inicial com localStorage
const [customCategories, setCustomCategories] = useState<string[]>(() => {
  try {
    const saved = localStorage.getItem('admin_custom_categories');
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
});

// Salvar no localStorage quando mudar
useEffect(() => {
  localStorage.setItem('admin_custom_categories', JSON.stringify(customCategories));
}, [customCategories]);

// Combinar todas as categorias
const availableCategories = [...new Set([
  ...customCategories,
  ...products.filter(p => p.category).map(p => p.category!)
])].sort();

// Corrigir handleAddCategory
const handleAddCategory = (category: string) => {
  if (!customCategories.includes(category)) {
    setCustomCategories(prev => [...prev, category]);
  }
};

// Corrigir handleDeleteCategory para remover do local tambem
const handleDeleteCategory = async (category: string) => {
  setCustomCategories(prev => prev.filter(c => c !== category));
  // + codigo existente para atualizar produtos
};
```

### 2. Multi-Select para Produtos Similares (ProductFormModal.tsx)

```tsx
const [showSimilarPicker, setShowSimilarPicker] = useState(false);

{/* Grid de selecao com checkboxes */}
<div className="border rounded-lg p-3 max-h-64 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-2">
  {allProducts
    .filter(p => p.id !== editingProduct?.id)
    .map(product => {
      const isSelected = form.similar_products.includes(product.id);
      return (
        <label key={product.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleSimilarProduct(product.id)}
            className="w-4 h-4 accent-[#2e3091]"
          />
          <img src={product.image} className="w-8 h-8 object-cover rounded" />
          <span className="text-sm truncate">{product.name}</span>
        </label>
      );
    })
  }
</div>
```

### 3. Scroll Inteligente (ScrollToTop.tsx)

```typescript
import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname, key } = useLocation();
  const navigationType = useNavigationType();
  const scrollPositions = useRef<Map<string, number>>(new Map());
  const prevKey = useRef<string>('');

  useEffect(() => {
    // Salvar posicao atual antes de navegar
    if (prevKey.current) {
      scrollPositions.current.set(prevKey.current, window.scrollY);
    }
    prevKey.current = key;

    // POP = Voltar/Avancar do navegador
    if (navigationType === 'POP') {
      const savedPosition = scrollPositions.current.get(key);
      if (savedPosition !== undefined) {
        // Pequeno delay para garantir que o conteudo carregou
        requestAnimationFrame(() => {
          window.scrollTo(0, savedPosition);
        });
        return;
      }
    }

    // PUSH/REPLACE = navegacao nova - vai pro topo
    window.scrollTo(0, 0);
  }, [pathname, key, navigationType]);

  return null;
}
```

---

## Resultado Esperado

### Categorias
- Adicionar categoria: Salva localmente e aparece na lista imediatamente
- Editar categoria: Atualiza todos os produtos com essa categoria
- Deletar categoria: Remove da lista local + remove dos produtos
- Categorias persistem entre sessoes (localStorage)

### Produtos Similares
- Grid visual com checkboxes
- Selecionar multiplos produtos com um clique cada
- Ver imagem do produto para identificar facilmente
- Nao precisa fechar/abrir o seletor repetidamente

### Navegacao
- Clicar em produto: Vai pro topo da pagina do produto
- Apertar "Voltar": Volta exatamente onde estava na lista
- Melhor experiencia de navegacao na loja



# Plano: Otimização de Performance do Admin

## Problemas Identificados

### 1. Recarregamento Completo Após Cada Ação
Atualmente, após qualquer ação (salvar produto, reordenar, atualizar feedback), o código chama `loadData()` que recarrega **TODAS** as seções:
- Bolsa Uniforme
- Pedidos  
- Produtos
- Feedbacks
- Clientes

Isso causa delays desnecessários porque busca dados que não mudaram.

### 2. Reordenação Sequencial no Backend
O `reorder_products` faz UPDATE um por um em loop:
```text
for (let i = 0; i < productIds.length; i++) {
  await supabase.update({ display_order: i + 1 }).eq("id", productIds[i])
}
```
Com 10 produtos, são 10 queries sequenciais ao banco.

### 3. Falta de Atualização Local Otimista
Apesar de ter código de atualização local (linhas 598-603), outras ações não usam isso.

---

## Solução Proposta

### Parte 1: Carregar Seções Sob Demanda

Ao invés de carregar tudo no login, carregar apenas a seção ativa:
- Quando muda de aba, carrega os dados daquela aba (se ainda não carregados)
- Ações de update usam atualização local otimista + reload apenas da seção afetada

### Parte 2: Atualização Local Otimista

Após cada ação bem-sucedida:
- Atualizar o estado local imediatamente
- Não chamar `loadData()` completo
- Se necessário recarregar, só recarrega a seção específica

### Parte 3: Batch Update no Backend

Trocar o loop sequencial por uma única query com CASE/WHEN:
```text
UPDATE products SET display_order = CASE
  WHEN id = 1 THEN 1
  WHEN id = 2 THEN 2
  ...
END WHERE id IN (1, 2, ...);
```

---

## Mudanças no Código

### Arquivo: `src/app/admin/page.tsx`

**1. Adicionar funções de reload por seção:**
```text
const reloadSection = async (section: 'products' | 'feedbacks' | 'orders' | 'bolsa' | 'customers') => {
  // Carrega apenas a seção específica
}
```

**2. Modificar handlers para usar atualização otimista:**

```text
// Exemplo para salvar produto
const handleSaveProduct = async (productData, isNew) => {
  // ... salvar no backend ...
  
  // Atualização otimista local
  if (isNew) {
    setProducts(prev => [...prev, { ...productData, id: Date.now() }]);
  } else {
    setProducts(prev => prev.map(p => p.id === productData.id ? productData : p));
  }
  
  // Recarrega só produtos (não tudo)
  reloadSection('products');
}
```

**3. Remover chamadas desnecessárias de `loadData()`:**
- `updatePaymentStatus` -> reload só bolsa
- `toggleFeedbackVisibility` -> atualização local + reload só feedbacks
- `saveFeedback` -> atualização local
- `deleteProduct` -> atualização local
- `handleDrop` (reordenar) -> já faz local, remover reload

### Arquivo: `supabase/functions/admin-data/index.ts`

**1. Otimizar `reorder_products` com batch update:**

Usar `Promise.all` para fazer todas as atualizações em paralelo ao invés de sequencial:
```text
case 'reorder_products': {
  const { productIds, schoolSlug } = data;
  
  // Atualização em paralelo
  await Promise.all(productIds.map((id, index) => 
    supabase.from("products")
      .update({ display_order: index + 1 })
      .eq("id", id)
      .eq("school_slug", schoolSlug)
  ));
  
  result = { success: true };
  break;
}
```

---

## Resumo de Arquivos

| Arquivo | Alteração |
|---------|-----------|
| `src/app/admin/page.tsx` | Atualização otimista + reload por seção |
| `supabase/functions/admin-data/index.ts` | Batch update paralelo para reordenação |

---

## Resultados Esperados

- **Carregamento inicial:** Mais rápido (só carrega aba ativa)
- **Ações de update:** Feedback visual imediato
- **Reordenação:** De 10 queries sequenciais para 10 paralelas (até 5x mais rápido)
- **Experiência do usuário:** Sem "travamentos" visuais ao interagir

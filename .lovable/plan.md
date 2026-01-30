
# Plano: Correções e Melhorias

Este plano corrige três áreas do sistema: pagamento Pix, galeria de imagens na vitrine, e reordenação de produtos no admin.

---

## 1. Pix via Mercado Pago - Correção do Erro 403

**Problema identificado nos logs:**
O erro `PA_UNAUTHORIZED_RESULT_FROM_POLICIES` (status 403) indica que o Access Token de produção não tem autorização para criar pagamentos Pix.

**Possíveis causas:**
- A conta Mercado Pago não completou a habilitação para Pix em produção
- O token não tem o escopo necessário (`payments:write`)
- Verificação de identidade pendente na conta

**Solução:**
1. Orientar o usuário a verificar no painel do Mercado Pago:
   - Acessar Configurações > Credenciais
   - Verificar se Pix está habilitado para produção
   - Gerar um novo Access Token com permissões de pagamento

2. Melhorar o tratamento de erro no código para mostrar mensagens mais claras

**Ação recomendada:** Antes de fazer alterações técnicas, é necessário verificar as configurações da conta no Mercado Pago. Se o problema for de habilitação, nenhuma mudança de código resolverá.

---

## 2. Galeria de Imagens na Vitrine (Grid)

**Problema:** Na página `/escolas/colegio-militar`, o código busca produtos do banco mas usa apenas `image_url` repetida 3 vezes, ignorando o array `images` que contém múltiplas fotos.

**Causa no código (linha ~65-72):**
```text
images: p.image_url ? [p.image_url, p.image_url, p.image_url] : []
```

**Solução:**
Modificar a função `fetchProducts` para usar o array `images` do banco quando disponível:

```text
images: (p.images && p.images.length > 0) 
  ? p.images 
  : (p.image_url ? [p.image_url] : [])
```

Isso permitirá que as setinhas e o swipe funcionem corretamente navegando entre imagens diferentes.

**Arquivo afetado:**
- `src/app/escolas/colegio-militar/page.tsx`

---

## 3. Reordenação de Produtos por Arrastar e Soltar (Admin)

**Objetivo:** Permitir que o administrador defina a ordem de exibição dos produtos por escola usando drag-and-drop.

### Etapa 1: Adicionar coluna `display_order` na tabela `products`

**Migração SQL:**
```text
ALTER TABLE products
ADD COLUMN display_order INTEGER DEFAULT 0;

-- Inicializar com ordem baseada no ID
UPDATE products SET display_order = id WHERE display_order = 0;
```

### Etapa 2: Atualizar a busca de produtos para usar ordem

**Arquivos afetados:**
- `supabase/functions/admin-data/index.ts` - ordenar por `display_order`
- `src/app/escolas/colegio-militar/page.tsx` - ordenar por `display_order`

### Etapa 3: Implementar drag-and-drop no admin

**Biblioteca:** Usar HTML5 Drag and Drop nativo (sem dependências extras)

**Mudanças no admin:**
- Adicionar ícone de "arrastar" (grip) ao lado de cada produto
- Implementar handlers `onDragStart`, `onDragOver`, `onDrop`
- Ao soltar, calcular nova ordem e salvar no banco

**Nova ação na Edge Function `admin-data`:**
- `reorder_products`: recebe array de IDs na nova ordem e atualiza `display_order`

**Arquivos afetados:**
- `src/app/admin/page.tsx` - UI de drag-and-drop
- `supabase/functions/admin-data/index.ts` - nova ação de reordenação

---

## Resumo de Arquivos

| Arquivo | Alteração |
|---------|-----------|
| `supabase/migrations/*.sql` | Adicionar coluna `display_order` |
| `src/app/escolas/colegio-militar/page.tsx` | Corrigir mapeamento de imagens + ordenar por `display_order` |
| `src/app/admin/page.tsx` | Adicionar drag-and-drop na tabela de produtos |
| `supabase/functions/admin-data/index.ts` | Adicionar ação `reorder_products` + ordenar por `display_order` |

---

## Sobre o Pix

Para o Pix funcionar, é necessário que você verifique no seu painel do Mercado Pago:

1. Acesse: https://www.mercadopago.com.br/settings/account/credentials
2. Verifique se a opção "Pix" está habilitada para produção
3. Se necessário, complete a verificação de identidade da conta
4. Gere um novo Access Token de produção

Se após essas verificações o erro persistir, pode ser necessário atualizar o token no sistema.

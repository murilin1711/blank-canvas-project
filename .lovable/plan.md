
# Plano: Performance + Scroll + Bordado + Dashboard Caixa

## Problemas Identificados

### 1. Site Lento para Carregar
O site está lento porque:
- Imagens grandes sendo carregadas sem otimização consistente
- Falta de lazy loading em algumas imagens críticas
- Falta de preload nas imagens principais

### 2. Scroll Não Restaura Posição ao Voltar
O componente `ScrollToTop.tsx` existe e usa a lógica correta, mas:
- Precisa de um delay maior para aguardar o conteúdo carregar
- Precisa desabilitar o scroll automático do navegador no App.tsx

### 3. Sistema de Bordado (Nova Feature)
Precisa criar:
- Campo `allows_embroidery` na tabela products
- UI no ProductPage para perguntar sobre bordado
- Pop-up de confirmação do nome
- Modificar o carrinho para armazenar nome bordado
- Controle no admin para habilitar/desabilitar bordado por produto

### 4. Dashboard Caixa (Nova Feature)
Precisa criar:
- Nova rota /caixa
- Senha diferente (140904gm) - precisa adicionar novo secret
- Acesso apenas a: Pedidos, Bolsa Uniforme, Feedbacks, Clientes

---

## Alterações no Banco de Dados

### Adicionar campo de bordado na tabela products
```sql
ALTER TABLE products ADD COLUMN allows_embroidery BOOLEAN DEFAULT false;
```

### Adicionar nova senha para caixa (Edge Function)
Precisamos adicionar o secret `CAIXA_PASSWORD` com valor `140904gm`

---

## Arquivos a Modificar

### Performance e Scroll
| Arquivo | Alteração |
|---------|-----------|
| `src/App.tsx` | Adicionar `window.history.scrollRestoration = 'manual'` |
| `src/components/ScrollToTop.tsx` | Aumentar delay e adicionar fallback mais robusto |
| `src/app/escolas/colegio-militar/page.tsx` | Garantir lazy loading em todas as imagens |

### Sistema de Bordado
| Arquivo | Alteração |
|---------|-----------|
| `src/components/ProductPage.tsx` | Adicionar UI de bordado com pergunta, input e confirmação |
| `src/contexts/CartContext.tsx` | Adicionar campo `embroideryName` no CartItem |
| `src/components/admin/ProductFormModal.tsx` | Adicionar toggle "Permite Bordado" |
| `src/app/carrinho/page.tsx` | Exibir nome bordado e valor adicional |

### Dashboard Caixa
| Arquivo | Alteração |
|---------|-----------|
| `src/App.tsx` | Adicionar rota /caixa |
| `src/app/caixa/page.tsx` | NOVO - Dashboard com abas limitadas |
| `supabase/functions/admin-auth/index.ts` | Adicionar suporte para senha do caixa |

---

## Detalhes Técnicos

### 1. Performance - Scroll Restoration Robusto

```typescript
// ScrollToTop.tsx - versão melhorada
export function ScrollToTop() {
  const { pathname, key } = useLocation();
  const navigationType = useNavigationType();
  const scrollPositions = useRef<Map<string, number>>(new Map());
  const prevKey = useRef<string>('');

  useEffect(() => {
    // Salvar posição atual antes de navegar
    if (prevKey.current) {
      scrollPositions.current.set(prevKey.current, window.scrollY);
    }
    prevKey.current = key;

    if (navigationType === 'POP') {
      const savedPosition = scrollPositions.current.get(key);
      if (savedPosition !== undefined) {
        // Múltiplas tentativas com delays crescentes
        const attempts = [0, 50, 150, 300];
        attempts.forEach((delay) => {
          setTimeout(() => {
            window.scrollTo(0, savedPosition);
          }, delay);
        });
        return;
      }
    }

    window.scrollTo(0, 0);
  }, [pathname, key, navigationType]);

  return null;
}
```

### 2. Sistema de Bordado - CartItem Atualizado

```typescript
export interface CartItem {
  id?: string;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  size: string;
  quantity: number;
  schoolSlug: string;
  embroideryName?: string;      // Nome para bordar (opcional)
  embroideryPrice?: number;     // Preço adicional do bordado
}
```

### 3. UI de Bordado no ProductPage

```text
┌─────────────────────────────────────────────────────┐
│  Deseja bordar sua peça com seu nome?              │
│                                                     │
│  ⚠️ Observação: O cartão Bolsa Uniforme não cobre │
│     o bordado. O valor é cobrado à parte.          │
│                                                     │
│  [   ] Não, obrigado                               │
│  [ ✓ ] Sim, quero bordar                           │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  Nome para bordado (máx. 3 nomes)          │   │
│  │  [João Pedro Silva___________________]     │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  + R$ 15,00 (valor sugerido para bordado)          │
└─────────────────────────────────────────────────────┘
```

### 4. Pop-up de Confirmação do Bordado

Quando o cliente clicar em "Comprar" ou "Adicionar ao Carrinho":

```text
┌─────────────────────────────────────────────────────┐
│        ⚠️ Confirmação de Bordado                   │
│                                                     │
│  O nome a seguir será bordado na sua peça:         │
│                                                     │
│          "João Pedro Silva"                        │
│                                                     │
│  Esta ação não pode ser desfeita após a            │
│  confirmação do pedido.                             │
│                                                     │
│       [Cancelar]        [Confirmar Bordado]        │
└─────────────────────────────────────────────────────┘
```

### 5. Dashboard Caixa - Estrutura

A página `/caixa` será similar à `/admin`, mas:
- Senha diferente (140904gm)
- Apenas 4 abas: Pedidos, Bolsa Uniforme, Feedbacks, Clientes
- Sem acesso a: Produtos, Financeiro
- Token de sessão separado (caixa_token)

### 6. Edge Function admin-auth atualizada

```typescript
// Verificar qual tipo de login
const { password, type } = await req.json();

const adminPassword = Deno.env.get('ADMIN_PASSWORD');
const caixaPassword = Deno.env.get('CAIXA_PASSWORD');

if (type === 'caixa') {
  if (password !== caixaPassword) {
    return new Response(
      JSON.stringify({ error: 'Senha incorreta' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  // Token com prefixo caixa
  const token = btoa(`caixa:${expiresAt}:${crypto.randomUUID()}`);
  // ...
}
```

---

## Fluxo do Bordado

```text
1. Cliente acessa página do produto
2. Se produto permite bordado (allows_embroidery = true):
   - Mostra pergunta "Deseja bordar sua peça com seu nome?"
   - Mostra observação sobre Bolsa Uniforme
3. Cliente clica "Sim"
   - Aparece input para digitar nome (máx. 3 nomes)
   - Mostra preço adicional
4. Cliente clica "Comprar" ou "Adicionar ao Carrinho"
   - Pop-up de confirmação aparece
   - Cliente confirma
5. Item é adicionado ao carrinho com embroideryName e embroideryPrice
6. No carrinho e checkout, mostra nome bordado e valor adicional
7. No admin (Pedidos), mostra nome bordado no item
```

---

## Secrets Necessários

| Nome | Valor |
|------|-------|
| CAIXA_PASSWORD | 140904gm |

---

## Resumo das Alterações

### Banco de Dados
- Adicionar coluna `allows_embroidery` na tabela products

### Novos Arquivos
- `src/app/caixa/page.tsx` - Dashboard do caixa

### Arquivos Modificados
- `src/App.tsx` - Rota /caixa + scroll restoration manual
- `src/components/ScrollToTop.tsx` - Restauração mais robusta
- `src/components/ProductPage.tsx` - UI de bordado
- `src/contexts/CartContext.tsx` - Campos de bordado
- `src/components/admin/ProductFormModal.tsx` - Toggle de bordado
- `src/app/carrinho/page.tsx` - Exibir bordado
- `supabase/functions/admin-auth/index.ts` - Suporte senha caixa

---

## Resultado Esperado

### Performance
- Imagens carregam mais rápido com lazy loading
- Scroll restaura corretamente ao voltar

### Bordado
- Cliente pode adicionar nome para bordar
- Aviso claro sobre Bolsa Uniforme não cobrir
- Pop-up de confirmação antes de finalizar
- Admin controla quais produtos permitem bordado

### Dashboard Caixa
- Acesso separado com senha 140904gm
- Apenas abas relevantes para o caixa
- Mesma experiência visual do admin

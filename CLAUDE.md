# CLAUDE.md — Blank Canvas Project (GM Minas)

Contexto permanente do projeto para o Claude Code. Lido automaticamente em cada sessão.

---

## Visão Geral

Plataforma de e-commerce para venda de uniformes escolares e empresariais. Marca: **GM Minas**.
Stack: **Vite + React 19 + TypeScript + Supabase + Tailwind CSS v4**.
Hospedagem: **Vercel** (SPA com rewrite de todas as rotas para `index.html`).

---

## Comandos Úteis

```bash
npm run dev        # Servidor de desenvolvimento (porta 8080)
npm run build      # Build de produção
npm run build:dev  # Build em modo development
npm run preview    # Preview do build (porta 8080)
```

> Gerenciador de pacotes: **npm** (há também `bun.lock` — ambos funcionam).

---

## Estrutura do Projeto

```
src/
├── app/              # Páginas (convenção page.tsx por rota)
│   ├── globals.css   # Variáveis CSS globais e Tailwind
│   └── admin/        # Painel admin
├── components/
│   ├── ui/           # 53 componentes Shadcn/Radix UI
│   ├── sections/     # Seções de página (header, footer, banners…)
│   └── admin/        # Componentes exclusivos do admin
├── contexts/         # AuthContext, CartContext, FavoritesContext
├── hooks/            # Custom hooks (useAuth, useCart, useFavorites, useIsMobile)
├── integrations/
│   └── supabase/     # client.ts + types gerados
├── lib/              # Utilitários (utils.ts com cn())
├── types/            # Definições TypeScript globais
└── assets/           # Imagens e mídia estática
supabase/
└── functions/        # 13 Edge Functions Deno (pagamentos, frete, webhooks)
public/               # Vídeos e SVGs estáticos
```

---

## Arquitetura

### Roteamento
React Router DOM v7. Todas as rotas definidas em `src/App.tsx`.
Rotas relevantes:
- `/` — Home
- `/escolas/colegio-militar` — Catálogo escolar
- `/escolas/colegio-militar/produto/:id` — Produto dinâmico
- `/empresarial` e `/empresarial/:linhaId` — Linha empresarial
- `/personalizacao` e `/personalizacao/:linhaId` — Personalização
- `/carrinho`, `/checkout`, `/checkout/sucesso`, `/checkout/cancelado`
- `/favoritos`, `/meus-pedidos`, `/sobre`, `/auth`
- `/admin`, `/caixa`

### Hierarquia de Providers (App.tsx)
```
BrowserRouter → AuthProvider → CartProvider → FavoritesProvider → Routes
```

### State Management
Somente **React Context API** + `localStorage` para persistência do carrinho.
Não há Redux, Zustand ou similares.

### Backend
**Supabase** (auth, banco PostgreSQL, storage, edge functions).
ID do projeto: `tjbydqkbcoqhmxitqazq`.
Tabelas principais: `products`, `orders`, `order_items`, `cart_items`, `favorites`, `bolsa_uniforme_payments`, `abandoned_carts`.

### Pagamentos
- **Stripe** — cartão (embedded checkout)
- **MercadoPago** — PIX
- Bolsa Uniforme — pagamento próprio
- Frete: **Juma** (local Anápolis) + **Melhor Envio** (nacional)

---

## Padrões de Código

### Nomenclatura de Arquivos
| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Página | `page.tsx` dentro da pasta da rota | `app/carrinho/page.tsx` |
| Componente de seção | kebab-case | `hero-banner.tsx` |
| Context / Provider | PascalCase | `AuthContext.tsx` |
| Hook | camelCase com prefixo `use` | `useCart.ts` |
| Tipo global | camelCase | `types.ts` |

### Variáveis e Funções
- `camelCase` para variáveis e funções
- `PascalCase` para componentes React e tipos/interfaces
- `UPPER_SNAKE_CASE` para constantes

### Imports
- Alias `@/` aponta para `./src/` — **sempre usar** em vez de caminhos relativos longos.
- Componentes Shadcn ficam em `@/components/ui/`.
- Utilitário de classes: `cn()` de `@/lib/utils`.

### Estilização
- **Tailwind CSS v4**, utilitário-first, mobile-first.
- Variáveis CSS de tema em `src/app/globals.css` (não hardcode cores).
- Breakpoints: `sm` 640px · `md` 768px · `lg` 1024px · `xl` 1280px · `xll` 1366px · `4xl` 1920px · `5xl` 2560px.
- Cor de acento primária: `#2A2826` (charcoal escuro).
- Efeitos: glassmorphism com `backdrop-blur`, transições `cubic-bezier` 0.3s.
- Somente light mode.

### Componentes UI
- Usar os 53 componentes em `@/components/ui/` antes de criar novos.
- Animações via **Framer Motion** (`framer-motion`).
- Ícones via **Lucide React**.
- Toasts via **Sonner** (`toast.success`, `toast.error`).

### Formulários
- **React Hook Form** + validação com `zod` quando necessário.

### TypeScript
- Strict mode ativado — sem `any` sem justificativa.
- Tipos de Supabase gerados em `src/integrations/supabase/types.ts` — não editar manualmente.

---

## Supabase Edge Functions

Ficam em `/supabase/functions/`. Runtime: **Deno**.
JWT verification está desativado em todas as functions.
Para testar localmente: `supabase functions serve <nome>`.

Functions existentes (13):
- `create-stripe-session`, `stripe-webhook`
- `create-mercadopago-pix`, `mercadopago-webhook`
- `get-shipping-quote` (Juma), `get-melhor-envio-quote`
- `send-order-confirmation`, `send-bolsa-uniforme-confirmation`
- `admin-*` (operações administrativas)

---

## Variáveis de Ambiente

Definidas em `.env` (não commitado). Chaves necessárias:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`

Segredos das edge functions são configurados no dashboard do Supabase.

---

## Pontos de Atenção

- O **README.md** está desatualizado (referencia Next.js — o projeto é Vite).
- Lovable Tagger (`lovable-tagger`) é um plugin de dev apenas — não afeta produção.
- O arquivo `website_design.md` contém o design system oficial (tipografia, espaçamento, paleta). Consultar antes de criar novos estilos.
- O campo `embroidery` em produtos adiciona custo extra — lógica no `CartContext`.
- Variações de produto (tamanho/cor) têm preços opcionais sobrescritos.
- Carrinho persiste em `localStorage` sob a chave `cart-items`.

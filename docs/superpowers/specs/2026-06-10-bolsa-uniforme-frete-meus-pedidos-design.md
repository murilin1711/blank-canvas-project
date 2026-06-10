# Design: Bolsa Uniforme — Frete em Meus Pedidos + Rejeição com Motivo

**Data:** 2026-06-10  
**Status:** Aprovado

---

## Contexto

Quando um cliente paga com Bolsa Uniforme, o frete é cobrado separadamente. Atualmente:
- Se o cliente fechar o checkout sem pagar o frete, não há como pagar depois
- `meus-pedidos` só busca a tabela `orders` — pedidos Bolsa pendentes de aprovação são invisíveis para o cliente
- Quando o admin rejeita, nenhum motivo é informado ao cliente
- O cliente não pode reenviar foto/senha após rejeição

---

## Requisitos

### 1. Meus Pedidos — cards de Bolsa Uniforme

Buscar `bolsa_uniforme_payments` do usuário além de `orders`. Pedidos com `status ≠ 'approved'` (ou sem `order_id`) aparecem como cards especiais **acima** dos pedidos normais.

**4 estados do card:**

| Estado | Condição | UI |
|---|---|---|
| Frete pendente | `shipping_amount > 0` AND `shipping_payment_status ≠ 'paid'` | Banner laranja + botão "Pagar frete — R$ X" |
| Aguardando aprovação | Frete pago (ou sem frete) AND `status = 'pending'` | Badge azul "Aguardando análise do cartão" |
| Rejeitado | `status = 'rejected'` | Banner vermelho + motivo (de `notes`) + botão "Reenviar dados" |
| Aprovado | `status = 'approved'` | Não aparece aqui — já existe como `order` normal |

**Pagar frete:** abre modal inline com escolha Stripe ou PIX. Após pagamento confirmado, faz `UPDATE bolsa_uniforme_payments SET shipping_payment_status = 'paid'`. O modal usa os componentes `StripeCustomPayment` e `MercadoPagoPixPayment` já existentes, passando apenas o valor do frete (`items=[]`, `shipping=shipping_amount`, `total=shipping_amount`).

**Reenviar dados:** abre o componente `BolsaUniformePayment` existente em modo de reenvio. Ao completar, faz `UPDATE bolsa_uniforme_payments SET qr_code_image = ?, password = ?, status = 'pending', notes = null` — reseta o status para pending sem criar novo registro.

### 2. Checkout — mensagem ao fechar sem pagar frete

Quando `bolsaUniformeCompleted && shipping > 0 && !shippingPaid` e o cliente não inicia o pagamento do frete, mostrar:

> ✅ **Bolsa Uniforme recebido!**  
> Seus produtos (R$ X,XX) estão aguardando análise.  
> ⚠️ **Você ainda precisa pagar o frete (R$ X,XX) para confirmar o envio.**  
> Acesse **Meus Pedidos** para pagar o frete quando quiser.  
> [Ir para Meus Pedidos →]

Este estado já existe no checkout (bloco `bolsaUniformeCompleted && shipping > 0 && !shippingPaid`). Apenas a mensagem é melhorada — o botão leva para `/meus-pedidos`.

### 3. Status clareza — frete ≠ pedido confirmado

Em todos os cards de Bolsa pendente em Meus Pedidos, mostrar duas linhas de status separadas:

- `✓ Frete pago` (verde) — quando `shipping_payment_status = 'paid'`
- `⏳ Cartão Bolsa Uniforme: aguardando aprovação` (azul) — quando `status = 'pending'`

Nunca usar a palavra "confirmado" para o pedido inteiro até `status = 'approved'`.

No admin, o card expandido da aba Bolsa Uniforme já mostra `shipping_payment_status`. Nenhuma mudança adicional necessária.

### 4. Admin — rejeição com motivo

Ao clicar em "Rejeitar" no modal de detalhes do pagamento, em vez de rejeitar diretamente, abre um modal de confirmação com radio buttons:

- Senha incorreta
- Foto com qualidade ruim
- Foto enviada do lado oposto do cartão

O motivo selecionado é salvo em `bolsa_uniforme_payments.notes` junto com a rejeição. A chamada `update_payment_status` no edge function `admin-data` recebe um campo adicional `rejectionReason` e faz o UPDATE incluindo `notes = rejectionReason`.

O cliente vê o motivo no card de Meus Pedidos como texto explicativo acima do botão "Reenviar dados".

---

## Fluxo de Dados

```
bolsa_uniforme_payments
  ├── status: 'pending' | 'approved' | 'rejected'
  ├── shipping_amount: number
  ├── shipping_payment_status: null | 'paid'
  ├── notes: null | string (motivo de rejeição)
  ├── qr_code_image: string (atualizável via reenvio)
  └── password: string (atualizável via reenvio)
```

### Reenvio de dados (UPDATE, não INSERT)
```
PATCH bolsa_uniforme_payments
SET qr_code_image = <nova foto>,
    password = <nova senha>,
    status = 'pending',
    notes = null,
    updated_at = now()
WHERE id = <payment_id> AND user_id = <user_id>
```

---

## Arquivos Afetados

| Arquivo | Mudança |
|---|---|
| `src/app/meus-pedidos/page.tsx` | Buscar bolsa payments, renderizar cards com 4 estados, modal de frete, fluxo de reenvio |
| `src/app/checkout/page.tsx` | Melhorar mensagem de frete pendente + link para Meus Pedidos |
| `src/app/admin/page.tsx` | Modal de rejeição com motivo (radio buttons) |
| `supabase/functions/admin-data/index.ts` | Aceitar `rejectionReason` em `update_payment_status` |

---

## Fora de Escopo

- Notificação por e-mail ao cliente sobre rejeição (pode ser adicionado depois)
- Paginação de pedidos em Meus Pedidos
- Histórico de reenvios

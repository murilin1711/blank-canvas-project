
# Plano: Integração de Pix via Mercado Pago

## Resumo

Vamos adicionar o Pix como forma de pagamento no checkout, usando a API do Mercado Pago. O usuário verá o QR Code e o código "copia e cola" para pagar, junto com as opções existentes (Cartão/Boleto/Bolsa Uniforme).

## O que o usuário vai ver

1. **Na tela de pagamento**: Nova opção "Pix" com ícone verde do Pix
2. **Ao selecionar Pix**: Botão "Pagar com Pix"
3. **Tela de pagamento Pix**:
   - QR Code grande e claro para escanear
   - Código "copia e cola" com botão para copiar
   - Valor e tempo de expiração
   - Instruções simples de como pagar

## Estrutura das Mudanças

```text
┌─────────────────────────────────────────────────┐
│ Checkout - Formas de Pagamento                  │
├─────────────────────────────────────────────────┤
│ ○ Cartão de Crédito / Boleto  (Stripe)          │
│ ○ Pix                         (Mercado Pago)    │
│ ○ Bolsa Uniforme              (Manual)          │
└─────────────────────────────────────────────────┘
           │
           ▼ (Se Pix selecionado)
┌─────────────────────────────────────────────────┐
│        Pague com Pix                            │
│                                                 │
│    ┌─────────────────────┐                      │
│    │    [QR CODE]        │                      │
│    │                     │                      │
│    └─────────────────────┘                      │
│                                                 │
│    Código Pix (copia e cola):                   │
│    ┌────────────────────────┬───────┐           │
│    │ 00020126580014br.gov...│ Copiar│           │
│    └────────────────────────┴───────┘           │
│                                                 │
│    Total: R$ 156,80                             │
│    Expira em: 30 minutos                        │
│                                                 │
│    [ Já fiz o pagamento ]                       │
└─────────────────────────────────────────────────┘
```

## Etapas de Implementação

### 1. Configurar Secret do Mercado Pago
- Adicionar `MERCADO_PAGO_ACCESS_TOKEN` nos secrets do projeto

### 2. Criar Edge Function para Mercado Pago
**Novo arquivo:** `supabase/functions/create-mercadopago-pix/index.ts`
- Recebe dados do pedido (valor, email, itens)
- Chama API do Mercado Pago POST `/v1/payments`
- Retorna QR Code (imagem base64) e código "copia e cola"

### 3. Criar Componente de Pagamento Pix
**Novo arquivo:** `src/components/MercadoPagoPixPayment.tsx`
- Modal/tela com QR Code e código copia e cola
- Botão para copiar código
- Timer de expiração
- Polling para verificar se pagamento foi confirmado

### 4. Atualizar Checkout
**Arquivo:** `src/app/checkout/page.tsx`
- Adicionar opção "Pix" na lista de pagamentos
- Lógica para abrir componente de Pix quando selecionado

### 5. Criar Webhook para confirmação
**Novo arquivo:** `supabase/functions/mercadopago-webhook/index.ts`
- Recebe notificação quando Pix é pago
- Atualiza status do pedido no banco

### 6. Atualizar Footer do Checkout
**Arquivo:** `src/components/sections/checkout-footer.tsx`
- Garantir que ícone Pix está visível

---

## Detalhes Técnicos

### Edge Function: create-mercadopago-pix

```text
POST /create-mercadopago-pix
Body: {
  items: CartItem[],
  customerEmail: string,
  customerName: string,
  cpf: string,
  total: number,
  userId: string
}

Response: {
  paymentId: string,
  qrCodeBase64: string,  // Imagem do QR Code
  qrCode: string,        // Código copia e cola
  expirationDate: string
}
```

### API Mercado Pago para Pix

```json
POST https://api.mercadopago.com/v1/payments
{
  "transaction_amount": 100.00,
  "payment_method_id": "pix",
  "payer": {
    "email": "cliente@email.com",
    "identification": {
      "type": "CPF",
      "number": "12345678909"
    }
  }
}
```

Resposta inclui:
- `point_of_interaction.transaction_data.qr_code_base64` - imagem
- `point_of_interaction.transaction_data.qr_code` - código texto

### Componente MercadoPagoPixPayment

Funcionalidades:
- Exibe QR Code em tamanho grande
- Botão "Copiar código Pix" que copia para área de transferência
- Mostra tempo restante para pagar (30 min padrão)
- Polling a cada 5 segundos para verificar se pagou
- Ao confirmar pagamento: limpa carrinho e vai para página de sucesso

### Webhook de confirmação

- Mercado Pago envia notificação para `/mercadopago-webhook`
- Verificamos assinatura de segurança
- Atualizamos pedido para "paid" quando `status === "approved"`

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `supabase/functions/create-mercadopago-pix/index.ts` | Criar |
| `supabase/functions/mercadopago-webhook/index.ts` | Criar |
| `src/components/MercadoPagoPixPayment.tsx` | Criar |
| `src/app/checkout/page.tsx` | Modificar |
| `src/components/sections/checkout-footer.tsx` | Verificar |
| `supabase/config.toml` | Modificar (adicionar functions) |

## Dependências

- **Secret necessário:** `MERCADO_PAGO_ACCESS_TOKEN`
- **Banco de dados:** Usaremos tabela `orders` existente com campo `payment_method: "pix"`

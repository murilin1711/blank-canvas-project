# Bolsa Uniforme — Frete em Meus Pedidos + Rejeição com Motivo

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que o cliente pague o frete do pedido Bolsa Uniforme depois no "Meus Pedidos", ver o motivo de rejeição, e reenviar foto/senha. Admin pode rejeitar com motivo selecionado.

**Architecture:** 4 mudanças independentes: (1) edge function admin-data aceita `rejectionReason`; (2) admin mostra modal de rejeição com radio buttons; (3) checkout melhora mensagem quando frete não pago; (4) meus-pedidos busca bolsa_uniforme_payments e renderiza cards com 4 estados + modal de pagamento + fluxo de reenvio.

**Tech Stack:** React 19 + TypeScript + Supabase + Tailwind CSS v4 + StripeCustomPayment + MercadoPagoPixPayment + BolsaUniformePayment (componentes já existentes)

---

## File Map

| Arquivo | Tipo | Mudança |
|---|---|---|
| `supabase/functions/admin-data/index.ts` | Modify | Aceitar `rejectionReason` em `update_payment_status`, salvar em `notes` |
| `src/app/admin/page.tsx` | Modify | Modal de rejeição com radio buttons (3 motivos) |
| `src/app/checkout/page.tsx` | Modify | Melhorar mensagem quando bolsa feito mas frete não pago |
| `src/app/meus-pedidos/page.tsx` | Modify | Buscar bolsa payments, 4-state cards, modal frete, fluxo reenvio |

---

## Task 1: Edge Function — rejectionReason em update_payment_status

**Files:**
- Modify: `supabase/functions/admin-data/index.ts:84-90`

- [ ] **Step 1: Localizar o bloco update_payment_status**

Em `supabase/functions/admin-data/index.ts` linha 84, o bloco atual é:
```ts
} else if (action === 'update_payment_status') {
  const { error: payStatusError } = await supabase
    .from("bolsa_uniforme_payments")
    .update({ status: data.status, processed_at: new Date().toISOString() })
    .eq("id", data.id);
```

- [ ] **Step 2: Alterar o UPDATE para incluir notes quando rejeitado**

Substituir as linhas 84-90 pela versão abaixo (apenas o UPDATE muda — o resto do bloco permanece igual):

```ts
} else if (action === 'update_payment_status') {
  const updatePayload: Record<string, any> = {
    status: data.status,
    processed_at: new Date().toISOString(),
  };
  if (data.status === 'rejected' && data.rejectionReason) {
    updatePayload.notes = data.rejectionReason;
  }
  const { error: payStatusError } = await supabase
    .from("bolsa_uniforme_payments")
    .update(updatePayload)
    .eq("id", data.id);
```

O resto do bloco (linhas 89–179) permanece sem alteração.

- [ ] **Step 3: Deploy da edge function**

```bash
supabase functions deploy admin-data
```

Ou via Lovable prompt:
> "Deploy the admin-data edge function"

- [ ] **Step 4: Commit**

```bash
git add supabase/functions/admin-data/index.ts
git commit -m "feat: admin-data aceita rejectionReason ao rejeitar bolsa uniforme"
```

---

## Task 2: Admin — Modal de Rejeição com Motivo

**Files:**
- Modify: `src/app/admin/page.tsx` (botão Rejeitar ~linha 2702)

O objetivo é: quando o admin clica em "Rejeitar", em vez de rejeitar diretamente, abre um modal com 3 opções de motivo. O admin seleciona um e confirma. Só então chama `updatePaymentStatus`.

- [ ] **Step 1: Adicionar estados para o modal de rejeição**

No topo do componente `AdminPage` (próximo aos demais `useState`), adicionar:

```tsx
const [showRejectionModal, setShowRejectionModal] = useState(false);
const [rejectionTarget, setRejectionTarget] = useState<string | null>(null);
const [rejectionReason, setRejectionReason] = useState<string>("");
```

- [ ] **Step 2: Alterar a função updatePaymentStatus para aceitar rejectionReason**

Localizar a função `updatePaymentStatus` (buscar por `updatePaymentStatus` em admin/page.tsx). Ela provavelmente chama `supabase.functions.invoke("admin-data", ...)` com `action: 'update_payment_status'`. Alterar para aceitar um argumento opcional:

```tsx
const updatePaymentStatus = async (id: string, status: "approved" | "rejected", rejectionReason?: string) => {
  // ... lógica existente ...
  await supabase.functions.invoke("admin-data", {
    body: {
      action: "update_payment_status",
      token: adminToken,
      data: { id, status, ...(rejectionReason ? { rejectionReason } : {}) },
    },
  });
  // ... refresh existente ...
};
```

(Adapte ao padrão exato da função existente — apenas acrescente o spread do rejectionReason no objeto `data`.)

- [ ] **Step 3: Substituir o botão "Rejeitar" para abrir modal**

Localizar o botão Rejeitar (por volta da linha 2702):

```tsx
<button
  onClick={() => {
    updatePaymentStatus(selectedPayment.id, "rejected");
    setShowDetailsModal(false);
  }}
  ...
>
  <XCircle className="w-4 h-4" />
  Rejeitar
</button>
```

Substituir o `onClick` para abrir o modal de rejeição em vez de rejeitar direto:

```tsx
<button
  onClick={() => {
    setRejectionTarget(selectedPayment.id);
    setRejectionReason("");
    setShowRejectionModal(true);
  }}
  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
>
  <XCircle className="w-4 h-4" />
  Rejeitar
</button>
```

- [ ] **Step 4: Adicionar o modal de rejeição ao JSX**

Logo antes do fechamento do return principal (ou perto dos outros modais), adicionar:

```tsx
{showRejectionModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Motivo da Rejeição</h3>
      <p className="text-sm text-gray-600 mb-4">Selecione o motivo para informar o cliente:</p>
      <div className="space-y-3 mb-6">
        {[
          "Senha incorreta",
          "Foto com qualidade ruim",
          "Foto enviada do lado oposto do cartão",
        ].map((reason) => (
          <label key={reason} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="rejectionReason"
              value={reason}
              checked={rejectionReason === reason}
              onChange={() => setRejectionReason(reason)}
              className="w-4 h-4 accent-red-500"
            />
            <span className="text-sm text-gray-800">{reason}</span>
          </label>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => {
            setShowRejectionModal(false);
            setRejectionTarget(null);
            setRejectionReason("");
          }}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          disabled={!rejectionReason}
          onClick={() => {
            if (rejectionTarget && rejectionReason) {
              updatePaymentStatus(rejectionTarget, "rejected", rejectionReason);
              setShowRejectionModal(false);
              setShowDetailsModal(false);
              setRejectionTarget(null);
              setRejectionReason("");
            }
          }}
          className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirmar Rejeição
        </button>
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 5: Testar manualmente**

1. Abrir admin → aba Bolsa Uniforme → expandir um pagamento com status `pending`
2. Clicar em "Rejeitar" → confirmar que abre modal com 3 opções
3. Selecionar um motivo → clicar "Confirmar Rejeição"
4. Verificar no Supabase: `bolsa_uniforme_payments.status = 'rejected'` e `notes = <motivo>`

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "feat: admin modal de rejeição com motivo para bolsa uniforme"
```

---

## Task 3: Checkout — Melhorar mensagem quando frete não pago

**Files:**
- Modify: `src/app/checkout/page.tsx` (bloco ~linha 1606)

O bloco existente é o `else` do `showShippingStripe ? ... : showShippingPix ? ... : (...)`. Dentro do `else`, há um banner verde confirmando o Bolsa Uniforme e os botões de pagamento do frete. Apenas a mensagem do banner precisa melhorar para explicar que o cliente pode pagar depois em Meus Pedidos.

- [ ] **Step 1: Verificar imports existentes**

Confirmar que `useNavigate` de `react-router-dom` já está importado em checkout/page.tsx (muito provável — já tem `navigate` no componente).

- [ ] **Step 2: Localizar e substituir o banner do bloco "frete pendente"**

Localizar (em torno da linha 1607):
```tsx
<div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
      <Check className="w-5 h-5 text-green-600" />
    </div>
    <div>
      <p className="font-semibold text-green-800">Bolsa Uniforme recebido! Vamos analisar e confirmar seu pedido.</p>
      <p className="text-sm text-green-700 mt-0.5">
        Produtos no valor de R$ {subtotal.toFixed(2).replace(".", ",")} aguardando confirmação. O frete precisa ser pago separadamente.
      </p>
    </div>
  </div>
</div>
```

Substituir por:
```tsx
<div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
      <Check className="w-5 h-5 text-green-600" />
    </div>
    <div>
      <p className="font-semibold text-green-800">Bolsa Uniforme recebido!</p>
      <p className="text-sm text-green-700 mt-0.5">
        Seus produtos (R$ {subtotal.toFixed(2).replace(".", ",")}) estão aguardando análise.
      </p>
    </div>
  </div>
</div>
<div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-6">
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
      <AlertTriangle className="w-5 h-5 text-orange-600" />
    </div>
    <div>
      <p className="font-semibold text-orange-800">Frete pendente — R$ {shipping.toFixed(2).replace(".", ",")}</p>
      <p className="text-sm text-orange-700 mt-0.5">
        Pague agora ou acesse <strong>Meus Pedidos</strong> para pagar quando quiser.
      </p>
      <button
        onClick={() => navigate("/meus-pedidos")}
        className="mt-2 text-sm text-orange-700 underline hover:no-underline font-medium"
      >
        Ir para Meus Pedidos →
      </button>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Verificar que AlertTriangle está importado**

Na lista de imports do Lucide React no topo do arquivo, confirmar `AlertTriangle`. Se não estiver, adicionar.

- [ ] **Step 4: Commit**

```bash
git add src/app/checkout/page.tsx
git commit -m "feat: checkout mostra link meus-pedidos quando frete bolsa pendente"
```

---

## Task 4: Meus Pedidos — Buscar bolsa payments e renderizar cards

**Files:**
- Modify: `src/app/meus-pedidos/page.tsx`

Esta é a maior tarefa. Será dividida em sub-etapas para clareza. O arquivo tem 184 linhas atualmente.

### 4a — Adicionar tipos e busca de bolsa_uniforme_payments

- [ ] **Step 1: Adicionar interface BolsaPayment após as interfaces existentes (linha ~26)**

```tsx
interface BolsaPayment {
  id: string;
  created_at: string;
  status: "pending" | "approved" | "rejected";
  total_amount: number;
  shipping_amount: number;
  shipping_payment_status: string | null;
  notes: string | null;
  order_id: string | null;
  items: Array<{
    productId: number;
    productName: string;
    productImage?: string;
    price: number;
    size: string;
    quantity: number;
  }>;
}
```

- [ ] **Step 2: Adicionar estado para bolsa payments**

Após `const [orders, setOrders] = useState<Order[]>([]);` (linha ~31), adicionar:

```tsx
const [bolsaPayments, setBolsaPayments] = useState<BolsaPayment[]>([]);
```

- [ ] **Step 3: Buscar bolsa_uniforme_payments no useEffect**

Dentro de `fetchOrders` (após o bloco `setOrders`), adicionar:

```tsx
const { data: bolsaData, error: bolsaError } = await supabase
  .from("bolsa_uniforme_payments")
  .select("id, created_at, status, total_amount, shipping_amount, shipping_payment_status, notes, order_id, items")
  .eq("user_id", user.id)
  .neq("status", "approved")
  .order("created_at", { ascending: false });

if (!bolsaError) {
  setBolsaPayments((bolsaData || []) as BolsaPayment[]);
}
```

> Filtramos `status != 'approved'` porque pedidos aprovados já aparecem em `orders` normalmente.

### 4b — Renderizar cards de bolsa pendente

- [ ] **Step 4: Adicionar imports necessários**

No topo do arquivo, adicionar à lista de imports do Lucide React:
`AlertTriangle, Clock, XCircle, CreditCard, RefreshCw`

E adicionar:
```tsx
import { Link } from "react-router-dom";
```

- [ ] **Step 5: Renderizar cards antes dos pedidos normais**

No JSX, substituir o bloco atual de renderização (buscar `{orders.length === 0 ? (` ~linha 123) pela versão que inclui os cards de bolsa acima dos pedidos normais:

```tsx
{bolsaPayments.length === 0 && orders.length === 0 ? (
  <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <h2 className="text-xl font-semibold text-gray-700 mb-2">Nenhum pedido encontrado</h2>
    <p className="text-gray-500 mb-6">Você ainda não fez nenhum pedido.</p>
    <button onClick={() => navigate("/escolas/colegio-militar")} className="bg-[#2e3091] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#252a7a] transition-colors">
      Ver Produtos
    </button>
  </div>
) : (
  <div className="space-y-6">
    {/* Cards de Bolsa Uniforme pendentes */}
    {bolsaPayments.map((bp) => (
      <BolsaPaymentCard
        key={bp.id}
        payment={bp}
        user={user}
        onRefresh={() => {
          // Re-fetch bolsa payments
          supabase
            .from("bolsa_uniforme_payments")
            .select("id, created_at, status, total_amount, shipping_amount, shipping_payment_status, notes, order_id, items")
            .eq("user_id", user!.id)
            .neq("status", "approved")
            .order("created_at", { ascending: false })
            .then(({ data }) => {
              if (data) setBolsaPayments(data as BolsaPayment[]);
            });
        }}
      />
    ))}

    {/* Pedidos normais */}
    {orders.map((order) => {
      const status = getStatusLabel(order.status);
      return (
        <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* ... JSX exato atual do card de order ... */}
        </div>
      );
    })}
  </div>
)}
```

> O JSX interno do card de order (`<div key={order.id} ...>`) deve ser copiado exatamente como está no arquivo atual (linhas 137–176).

---

## Task 5: Meus Pedidos — Componente BolsaPaymentCard

**Files:**
- Modify: `src/app/meus-pedidos/page.tsx` (adicionar componente no mesmo arquivo, antes do export default)

O card tem 4 estados. Para simplificar, criar como função interna no arquivo (não um arquivo separado, pois só é usada aqui).

- [ ] **Step 1: Adicionar imports de componentes de pagamento**

No topo de `meus-pedidos/page.tsx`, adicionar:

```tsx
import { StripeCustomPayment } from "@/components/StripeCustomPayment";
import { MercadoPagoPixPayment } from "@/components/MercadoPagoPixPayment";
import { BolsaUniformePayment } from "@/components/BolsaUniformePayment";
import { supabase } from "@/integrations/supabase/client";
```

(Verificar quais já estão importados — `supabase` e `useAuth` já devem estar.)

- [ ] **Step 2: Adicionar estados locais para o modal de pagamento/reenvio**

Dentro de `BolsaPaymentCard`, criar como componente separado dentro do mesmo arquivo (antes do `export default`):

```tsx
function BolsaPaymentCard({
  payment,
  user,
  onRefresh,
}: {
  payment: BolsaPayment;
  user: { id: string; email?: string; user_metadata?: { name?: string } } | null;
  onRefresh: () => void;
}) {
  const [showFreteModal, setShowFreteModal] = useState(false);
  const [showReenvioModal, setShowReenvioModal] = useState(false);
  const [fretePaymentMethod, setFretePaymentMethod] = useState<"stripe" | "pix">("stripe");
  const [showStripe, setShowStripe] = useState(false);
  const [showPix, setShowPix] = useState(false);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const fretePendente =
    payment.shipping_amount > 0 && payment.shipping_payment_status !== "paid";
  const aguardando =
    (!fretePendente || payment.shipping_amount === 0) && payment.status === "pending";
  const rejeitado = payment.status === "rejected";

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 border-[#2e3091]">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#2e3091]">Bolsa Uniforme</p>
              <p className="text-sm text-gray-500">{formatDate(payment.created_at)}</p>
            </div>
            {fretePendente && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Frete pendente
              </span>
            )}
            {aguardando && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Aguardando análise
              </span>
            )}
            {rejeitado && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                Rejeitado
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Itens */}
          <div className="space-y-3 mb-4">
            {(payment.items || []).map((item, i) => (
              <div key={i} className="flex gap-3 items-center">
                {item.productImage && (
                  <img src={item.productImage} alt={item.productName} className="w-14 h-14 object-cover rounded-lg" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                  <p className="text-xs text-gray-500">Tam: {item.size} · Qtd: {item.quantity}</p>
                  <p className="text-sm font-medium text-[#2e3091]">R$ {item.price.toFixed(2).replace(".", ",")}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Totais */}
          <div className="border-t border-gray-100 pt-3 text-sm space-y-1">
            <div className="flex justify-between text-gray-600">
              <span>Produtos</span>
              <span>R$ {payment.total_amount.toFixed(2).replace(".", ",")}</span>
            </div>
            {payment.shipping_amount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Frete</span>
                <span className={fretePendente ? "text-orange-600 font-medium" : ""}>
                  {fretePendente ? "⚠ " : ""}R$ {payment.shipping_amount.toFixed(2).replace(".", ",")}
                  {!fretePendente && <span className="ml-1 text-green-600 text-xs">✓ pago</span>}
                </span>
              </div>
            )}
          </div>

          {/* Status lines */}
          <div className="mt-3 space-y-1">
            {payment.shipping_payment_status === "paid" && (
              <p className="text-sm text-green-600 font-medium">✓ Frete pago</p>
            )}
            {payment.status === "pending" && (
              <p className="text-sm text-blue-600">⏳ Cartão Bolsa Uniforme: aguardando aprovação</p>
            )}
          </div>

          {/* Ações */}
          <div className="mt-4">
            {fretePendente && (
              <button
                onClick={() => setShowFreteModal(true)}
                className="w-full bg-[#2e3091] text-white py-3 rounded-xl font-medium hover:bg-[#252a7a] transition-colors"
              >
                Pagar frete — R$ {payment.shipping_amount.toFixed(2).replace(".", ",")}
              </button>
            )}
            {rejeitado && (
              <div>
                {payment.notes && (
                  <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-sm text-red-700 font-medium">Motivo: {payment.notes}</p>
                  </div>
                )}
                <button
                  onClick={() => setShowReenvioModal(true)}
                  className="w-full flex items-center justify-center gap-2 border-2 border-[#2e3091] text-[#2e3091] py-3 rounded-xl font-medium hover:bg-[#2e3091]/5 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reenviar dados
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de pagamento do frete */}
      {showFreteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Pagar frete — R$ {payment.shipping_amount.toFixed(2).replace(".", ",")}
                </h3>
                <button onClick={() => { setShowFreteModal(false); setShowStripe(false); setShowPix(false); }} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {!showStripe && !showPix && (
                <div className="space-y-3">
                  <label className={`block cursor-pointer rounded-2xl border-2 transition-all ${fretePaymentMethod === "stripe" ? "border-[#2e3091] bg-[#2e3091]/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <div className="p-4 flex items-center gap-3">
                      <input type="radio" checked={fretePaymentMethod === "stripe"} onChange={() => setFretePaymentMethod("stripe")} className="w-4 h-4 accent-[#2e3091]" />
                      <CreditCard className="w-5 h-5 text-[#2e3091]" />
                      <span className="font-medium text-gray-900">Cartão de Crédito / Boleto</span>
                    </div>
                  </label>
                  <label className={`block cursor-pointer rounded-2xl border-2 transition-all ${fretePaymentMethod === "pix" ? "border-[#2e3091] bg-[#2e3091]/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <div className="p-4 flex items-center gap-3">
                      <input type="radio" checked={fretePaymentMethod === "pix"} onChange={() => setFretePaymentMethod("pix")} className="w-4 h-4 accent-[#2e3091]" />
                      <span className="text-lg">🏦</span>
                      <span className="font-medium text-gray-900">PIX</span>
                    </div>
                  </label>
                  <button
                    onClick={() => {
                      if (fretePaymentMethod === "stripe") setShowStripe(true);
                      else setShowPix(true);
                    }}
                    className="w-full bg-[#2e3091] text-white py-3 rounded-xl font-medium hover:bg-[#252a7a] transition-colors mt-2"
                  >
                    Continuar
                  </button>
                </div>
              )}

              {showStripe && (
                <StripeCustomPayment
                  items={[]}
                  customerEmail={user?.email || ""}
                  customerName={user?.user_metadata?.name || user?.email?.split("@")[0] || ""}
                  shippingAddress={{ cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "" }}
                  shipping={payment.shipping_amount}
                  userId={user?.id || ""}
                  total={payment.shipping_amount}
                  onSuccess={async () => {
                    await supabase
                      .from("bolsa_uniforme_payments")
                      .update({ shipping_payment_status: "paid" })
                      .eq("id", payment.id);
                    setShowFreteModal(false);
                    setShowStripe(false);
                    onRefresh();
                  }}
                />
              )}

              {showPix && (
                <MercadoPagoPixPayment
                  items={[]}
                  customerEmail={user?.email || ""}
                  customerName={user?.user_metadata?.name || user?.email?.split("@")[0] || ""}
                  cpf=""
                  total={payment.shipping_amount}
                  userId={user?.id || ""}
                  shippingAddress={{ cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "" }}
                  shipping={0}
                  bolsaPaymentId={payment.id}
                  onBack={() => setShowPix(false)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de reenvio de dados */}
      {showReenvioModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Reenviar dados do Bolsa Uniforme</h3>
                <button onClick={() => setShowReenvioModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <BolsaUniformePayment
                suggestedAmount={payment.total_amount}
                maxAmount={970}
                cardNumber={1}
                onCancel={() => setShowReenvioModal(false)}
                onComplete={async ({ qrCodeImage, password }) => {
                  const { error } = await supabase
                    .from("bolsa_uniforme_payments")
                    .update({
                      qr_code_image: qrCodeImage,
                      password,
                      status: "pending",
                      notes: null,
                    })
                    .eq("id", payment.id)
                    .eq("user_id", user?.id || "");

                  if (error) {
                    toast.error("Erro ao reenviar dados. Tente novamente.");
                  } else {
                    toast.success("Dados reenviados! Aguardando nova análise.");
                    setShowReenvioModal(false);
                    onRefresh();
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 6: Adicionar import de toast**

```tsx
import { toast } from "sonner";
```

- [ ] **Step 7: Testar os 3 estados do card**

1. Criar um `bolsa_uniforme_payments` com `status = 'pending'` e `shipping_amount > 0` e `shipping_payment_status = null` → acessar Meus Pedidos → deve aparecer card com botão "Pagar frete"
2. Clicar "Pagar frete" → modal abre → escolher Stripe → preencher dados → pagar
3. Após pagar: card atualiza para "Aguardando análise do cartão"
4. No admin, rejeitar com motivo "Senha incorreta" → em Meus Pedidos, card mostra badge vermelho + motivo + botão "Reenviar dados"
5. Clicar "Reenviar dados" → fluxo BolsaUniformePayment abre → completar → card volta para "Aguardando análise"

- [ ] **Step 8: Commit**

```bash
git add src/app/meus-pedidos/page.tsx
git commit -m "feat: meus-pedidos mostra bolsa uniforme pendente com pagamento de frete e reenvio"
```

---

## Notas de Implementação

**Sobre `StripeCustomPayment` para frete-only:**
O componente aceita `items=[]` e `shipping=valor_do_frete`. O `create-payment-intent` vai calcular `subtotal = 0` e `total = shipping`, criando um order vazio. Para evitar criar um order errado no webhook, seria ideal um `flow: "frete_only"` guard — mas como o componente já tem `onSuccess` que atualiza o `shipping_payment_status`, o comportamento está correto mesmo que um order vazio seja criado. Se quiser evitar o order vazio, pode-se em `create-payment-intent` usar `flow: "frete_bolsa"` e guardar em `onSuccess` que não cria order para esse flow no webhook.

**Sobre `MercadoPagoPixPayment` para frete-only:**
O componente aceita `bolsaPaymentId` e ao receber confirmação de pagamento, já faz `UPDATE bolsa_uniforme_payments SET shipping_payment_status = 'paid'`. Funciona nativamente para este caso de uso.

**Sobre reenvio no `BolsaUniformePayment`:**
O componente não tem um "modo edição" nativo — ele sempre começa em `step = 'amount'`. Para o reenvio, o `suggestedAmount` deve ser `payment.total_amount` e o `maxAmount` deve ser 970 (máximo do cartão). O `onComplete` faz UPDATE em vez de INSERT. O step de "valor" será exibido mas o cliente pode apenas confirmar o valor atual sem alterar — isso é aceitável para MVP.

// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  size: string;
  quantity: number;
  schoolSlug: string;
}

interface PixPaymentRequest {
  items: CartItem[];
  customerEmail: string;
  customerName: string;
  cpf: string;
  total: number; // ignorado — recalculado no servidor
  userId: string;
  shippingAddress: {
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  shipping: number;
  bolsaPaymentId?: string;
  shippingMethod?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    if (!accessToken) throw new Error("MERCADO_PAGO_ACCESS_TOKEN not configured");

    const body: PixPaymentRequest = await req.json();
    const { items, customerEmail, customerName, cpf, userId, shippingAddress, shipping, bolsaPaymentId, shippingMethod } = body;

    const cleanCpf = cpf.replace(/\D/g, "");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ── 1. Calcula valores no SERVIDOR (nunca confia no `total` do cliente) ─────
    const itemsSubtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingSafe = Number(shipping) || 0;

    // Fluxo BU: cobra somente o frete real vindo de bolsa_uniforme_payments
    // Fluxo normal: cobra subtotal + shipping
    let chargeAmount: number;
    let realShipping = shippingSafe;
    let existingBu: any = null;

    if (bolsaPaymentId) {
      const { data } = await supabase
        .from("bolsa_uniforme_payments")
        .select("order_id, shipping_amount")
        .eq("id", bolsaPaymentId)
        .single();
      existingBu = data;
      realShipping = Number(existingBu?.shipping_amount) || 0;
      chargeAmount = Math.round(realShipping * 100) / 100;
    } else {
      chargeAmount = Math.round((itemsSubtotal + shippingSafe) * 100) / 100;
    }

    if (!(chargeAmount > 0)) throw new Error("Valor de cobrança inválido");

    // ── 2. Reaproveita pedido pendente existente (se houver) ────────────────────
    let order: any = null;

    if (bolsaPaymentId && existingBu?.order_id) {
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("*")
        .eq("id", existingBu.order_id)
        .eq("status", "pending")
        .single();
      if (existingOrder) order = existingOrder;
    } else if (!bolsaPaymentId) {
      // Pix normal: reaproveita pedido pendente MAIS RECENTE do usuário com
      // mesmo total E que já tenha payment_provider_id (Pix ativo no MP).
      // Se não existir MP vinculado, é órfão e não pode ser reutilizado.
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .eq("payment_method", "pix")
        .eq("status", "pending")
        .eq("total", itemsSubtotal + shippingSafe)
        .not("payment_provider_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existingOrder) {
        order = existingOrder;
        console.log("[CREATE-MERCADOPAGO-PIX] Reusing existing pending order:", order.id);
      }
    }

    // ── 3. Se já há Pix ativo no MP vinculado ao pedido, devolve o mesmo QR ─────
    if (order?.payment_provider_id) {
      try {
        const existingRes = await fetch(`https://api.mercadopago.com/v1/payments/${order.payment_provider_id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (existingRes.ok) {
          const existingPayment = await existingRes.json();
          if (existingPayment.status === "pending") {
            const td = existingPayment.point_of_interaction?.transaction_data;
            if (td?.qr_code_base64 && td?.qr_code) {
              return new Response(JSON.stringify({
                paymentId: String(existingPayment.id),
                qrCodeBase64: td.qr_code_base64,
                qrCode: td.qr_code,
                expirationDate: existingPayment.date_of_expiration,
                orderId: order.id,
              }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
            }
          }
        }
      } catch (e) {
        console.warn("[CREATE-MERCADOPAGO-PIX] Could not fetch existing MP payment:", e.message);
      }
    }

    // ── 4. Cria o Pix no Mercado Pago PRIMEIRO (antes de gravar pedido novo) ────
    // externalRef estável por bolsaPaymentId ou por (userId+valor) para o fluxo
    // normal — evita idempotency-keys sempre novos que dão margem a duplicatas.
    const externalRef = bolsaPaymentId
      ? `bu-${bolsaPaymentId}`
      : (order ? `order-${order.id}` : `user-${userId}-${Math.round(chargeAmount * 100)}`);

    const paymentData = {
      transaction_amount: chargeAmount,
      description: `Goiás & Minas Uniformes - ${items.length} produto(s)`,
      payment_method_id: "pix",
      external_reference: externalRef,
      payer: {
        email: customerEmail,
        first_name: customerName.split(" ")[0],
        last_name: customerName.split(" ").slice(1).join(" ") || customerName.split(" ")[0],
        identification: { type: "CPF", number: cleanCpf },
      },
      metadata: {
        user_id: userId,
        ...(order ? { order_id: order.id } : {}),
        ...(bolsaPaymentId ? { bolsa_payment_id: bolsaPaymentId } : {}),
      },
    };

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "X-Idempotency-Key": `${externalRef}-${Math.floor(Date.now() / 60000)}`,
      },
      body: JSON.stringify(paymentData),
    });

    const paymentResult = await response.json();

    if (!response.ok) {
      console.error("[CREATE-MERCADOPAGO-PIX] Mercado Pago error:", paymentResult);
      throw new Error(paymentResult.message || "Erro ao criar pagamento Pix");
    }

    const transactionData = paymentResult.point_of_interaction?.transaction_data;
    if (!transactionData?.qr_code_base64 || !transactionData?.qr_code) {
      throw new Error("QR Code não retornado pelo Mercado Pago");
    }

    console.log("[CREATE-MERCADOPAGO-PIX] MP payment created:", paymentResult.id);

    // ── 5. Só AGORA grava o pedido no banco (se ainda não existir) ──────────────
    if (!order) {
      const totalToStore = bolsaPaymentId
        ? itemsSubtotal + realShipping   // BU: pedido total real (produtos + frete real)
        : itemsSubtotal + shippingSafe;  // Pix normal

      const { data: createdOrder, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          subtotal: itemsSubtotal,
          shipping: bolsaPaymentId ? realShipping : shippingSafe,
          total: totalToStore,
          shipping_address: { ...shippingAddress, ...(shippingMethod ? { selected_shipping_method: shippingMethod } : {}) },
          status: "pending",
          payment_method: bolsaPaymentId ? "bolsa_uniforme" : "pix",
          payment_provider_id: String(paymentResult.id),
        })
        .select()
        .single();

      if (orderError) {
        // Pedido não pôde ser gravado mas o Pix já foi criado no MP — cancela lá
        try {
          await fetch(`https://api.mercadopago.com/v1/payments/${paymentResult.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify({ status: "cancelled" }),
          });
        } catch {}
        throw new Error("Erro ao criar pedido: " + orderError.message);
      }
      order = createdOrder;

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.productName,
        product_image: item.productImage,
        price: item.price,
        size: item.size,
        quantity: item.quantity,
      }));
      await supabase.from("order_items").insert(orderItems);

      if (bolsaPaymentId) {
        await supabase.from("bolsa_uniforme_payments").update({ order_id: order.id }).eq("id", bolsaPaymentId);
      }
    } else {
      // Reaproveitou pedido pendente sem MP vinculado — grava o novo payment_provider_id
      await supabase.from("orders").update({ payment_provider_id: String(paymentResult.id) }).eq("id", order.id);
    }

    return new Response(
      JSON.stringify({
        paymentId: String(paymentResult.id),
        qrCodeBase64: transactionData.qr_code_base64,
        qrCode: transactionData.qr_code,
        expirationDate: paymentResult.date_of_expiration,
        orderId: order.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("[CREATE-MERCADOPAGO-PIX] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

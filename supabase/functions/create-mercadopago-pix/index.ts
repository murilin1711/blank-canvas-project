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
  total: number;
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
    const { items, customerEmail, customerName, cpf, total, userId, shippingAddress, shipping, bolsaPaymentId, shippingMethod } = body;

    const cleanCpf = cpf.replace(/\D/g, "");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ── 1. Cria ou reutiliza o order ────────────────────────────────────────────
    let order: any = null;

    if (bolsaPaymentId) {
      // Frete BU: reutiliza order vinculado se já existir e ainda estiver pendente
      const { data: existingBu } = await supabase
        .from("bolsa_uniforme_payments")
        .select("order_id, shipping_amount")
        .eq("id", bolsaPaymentId)
        .single();

      if (existingBu?.order_id) {
        const { data: existingOrder } = await supabase
          .from("orders")
          .select("*")
          .eq("id", existingBu.order_id)
          .eq("status", "pending")
          .single();
        if (existingOrder) order = existingOrder;
      }

      if (!order) {
        // `total`/`shipping` recebidos no body são apenas o valor desta cobrança Pix
        // (o frete, já que os produtos são pagos no cartão Bolsa Uniforme). O pedido
        // precisa registrar os valores reais: subtotal dos itens + frete verdadeiro,
        // vindo de bolsa_uniforme_payments.shipping_amount — nunca o valor da cobrança.
        const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
        const realShipping = Number(existingBu?.shipping_amount) || 0;
        const { data: createdOrder, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: userId,
            subtotal,
            shipping: realShipping,
            total: subtotal + realShipping,
            shipping_address: { ...shippingAddress, ...(shippingMethod ? { selected_shipping_method: shippingMethod } : {}) },
            status: "pending",
            payment_method: "bolsa_uniforme",
          })
          .select()
          .single();

        if (orderError) throw new Error("Erro ao criar pedido: " + orderError.message);
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
        await supabase.from("bolsa_uniforme_payments").update({ order_id: order.id }).eq("id", bolsaPaymentId);
      }
    } else {
      // Pix normal: busca order pendente recente do mesmo usuário/valor
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .eq("payment_method", "pix")
        .eq("status", "pending")
        .eq("total", total)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingOrder) {
        order = existingOrder;
        console.log("[CREATE-MERCADOPAGO-PIX] Reusing existing pending order:", order.id);
      } else {
        const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
        const { data: createdOrder, error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: userId,
            subtotal,
            shipping,
            total,
            shipping_address: { ...shippingAddress, ...(shippingMethod ? { selected_shipping_method: shippingMethod } : {}) },
            status: "pending",
            payment_method: "pix",
          })
          .select()
          .single();

        if (orderError) throw new Error("Erro ao criar pedido: " + orderError.message);
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
      }
    }

    // ── 2. Verifica se já existe um Pix pendente para este order no MP ──────────
    if (order.payment_provider_id) {
      console.log("[CREATE-MERCADOPAGO-PIX] Checking existing MP payment:", order.payment_provider_id);
      try {
        const existingRes = await fetch(`https://api.mercadopago.com/v1/payments/${order.payment_provider_id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (existingRes.ok) {
          const existingPayment = await existingRes.json();
          if (existingPayment.status === "pending") {
            const td = existingPayment.point_of_interaction?.transaction_data;
            if (td?.qr_code_base64 && td?.qr_code) {
              console.log("[CREATE-MERCADOPAGO-PIX] Reusing existing pending MP payment");
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
        console.warn("[CREATE-MERCADOPAGO-PIX] Could not fetch existing payment, creating new one:", e.message);
      }
    }

    // ── 3. Cria novo Pix no Mercado Pago ────────────────────────────────────────
    const externalRef = bolsaPaymentId ? `bu-${bolsaPaymentId}` : `order-${order.id}`;

    const paymentData = {
      transaction_amount: total,
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
        order_id: order.id,
        ...(bolsaPaymentId ? { bolsa_payment_id: bolsaPaymentId } : {}),
      },
    };

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "X-Idempotency-Key": `${externalRef}-${Math.floor(Date.now() / 60000)}`, // muda a cada minuto
      },
      body: JSON.stringify(paymentData),
    });

    const paymentResult = await response.json();

    if (!response.ok) {
      console.error("[CREATE-MERCADOPAGO-PIX] Mercado Pago error:", paymentResult);
      throw new Error(paymentResult.message || "Erro ao criar pagamento Pix");
    }

    console.log("[CREATE-MERCADOPAGO-PIX] Payment created:", paymentResult.id);

    const transactionData = paymentResult.point_of_interaction?.transaction_data;
    if (!transactionData) throw new Error("QR Code data not found in response");

    // Salva o payment_provider_id no order para reutilização futura
    await supabase.from("orders").update({ payment_provider_id: String(paymentResult.id) }).eq("id", order.id);

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

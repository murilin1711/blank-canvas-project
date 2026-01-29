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
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    if (!accessToken) {
      throw new Error("MERCADO_PAGO_ACCESS_TOKEN not configured");
    }

    const body: PixPaymentRequest = await req.json();
    const { items, customerEmail, customerName, cpf, total, userId, shippingAddress, shipping } = body;

    // Clean CPF (remove dots and dashes)
    const cleanCpf = cpf.replace(/\D/g, "");

    console.log("[CREATE-MERCADOPAGO-PIX] Creating Pix payment", {
      total,
      customerEmail,
      itemsCount: items.length,
    });

    // Create payment request to Mercado Pago
    const paymentData = {
      transaction_amount: total,
      description: `Goiás & Minas Uniformes - ${items.length} produto(s)`,
      payment_method_id: "pix",
      payer: {
        email: customerEmail,
        first_name: customerName.split(" ")[0],
        last_name: customerName.split(" ").slice(1).join(" ") || customerName.split(" ")[0],
        identification: {
          type: "CPF",
          number: cleanCpf,
        },
      },
      metadata: {
        user_id: userId,
        items: JSON.stringify(items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          size: item.size,
          quantity: item.quantity,
        }))),
        shipping_address: JSON.stringify(shippingAddress),
        shipping: shipping.toString(),
      },
    };

    const response = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "X-Idempotency-Key": `${userId}-${Date.now()}`,
      },
      body: JSON.stringify(paymentData),
    });

    const paymentResult = await response.json();

    if (!response.ok) {
      console.error("[CREATE-MERCADOPAGO-PIX] Mercado Pago error:", paymentResult);
      throw new Error(paymentResult.message || "Erro ao criar pagamento Pix");
    }

    console.log("[CREATE-MERCADOPAGO-PIX] Payment created successfully", {
      paymentId: paymentResult.id,
      status: paymentResult.status,
    });

    // Extract QR Code data from response
    const transactionData = paymentResult.point_of_interaction?.transaction_data;
    
    if (!transactionData) {
      throw new Error("QR Code data not found in response");
    }

    // Create order in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        subtotal,
        shipping,
        total,
        shipping_address: shippingAddress,
        status: "pending",
        payment_method: "pix",
      })
      .select()
      .single();

    if (orderError) {
      console.error("[CREATE-MERCADOPAGO-PIX] Error creating order:", orderError);
    } else {
      // Create order items
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

    return new Response(
      JSON.stringify({
        paymentId: paymentResult.id.toString(),
        qrCodeBase64: transactionData.qr_code_base64,
        qrCode: transactionData.qr_code,
        expirationDate: paymentResult.date_of_expiration,
        orderId: order?.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("[CREATE-MERCADOPAGO-PIX] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

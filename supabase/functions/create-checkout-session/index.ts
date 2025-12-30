import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

interface CheckoutRequest {
  items: CartItem[];
  customerEmail: string;
  customerName: string;
  shippingAddress: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  shipping: number;
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-08-27.basil",
    });

    const {
      items,
      customerEmail,
      customerName,
      shippingAddress,
      shipping,
      userId,
    }: CheckoutRequest = await req.json();

    console.log("Creating checkout session for:", {
      customerEmail,
      itemCount: items.length,
      shipping,
    });

    // Create line items for Stripe - use dynamic pricing
    const lineItems: Array<{
      price_data: {
        currency: string;
        product_data: {
          name: string;
          images?: string[];
        };
        unit_amount: number;
      };
      quantity: number;
    }> = items.map((item) => ({
      price_data: {
        currency: "brl",
        product_data: {
          name: `${item.productName} - Tamanho ${item.size}`,
          images: item.productImage ? [item.productImage] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if applicable
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: "brl",
          product_data: {
            name: "Frete",
          },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      });
    }

    const origin = req.headers.get("origin") || "https://lovable.dev";

    // Create checkout session with card and boleto payment methods
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "boleto"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancelado`,
      customer_email: customerEmail,
      payment_method_options: {
        boleto: {
          expires_after_days: 3,
        },
      },
      metadata: {
        userId,
        customerName,
        shippingAddress: JSON.stringify(shippingAddress),
        itemsCount: items.length.toString(),
        shipping: shipping.toString(),
      },
      payment_intent_data: {
        metadata: {
          userId,
          customerName,
          shippingAddress: JSON.stringify(shippingAddress),
          itemsJson: JSON.stringify(
            items.map((i) => ({
              id: i.productId,
              name: i.productName,
              img: i.productImage,
              price: i.price,
              size: i.size,
              qty: i.quantity,
              school: i.schoolSlug,
            }))
          ),
          shipping: shipping.toString(),
        },
      },
    });

    console.log("Checkout session created:", session.id);

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

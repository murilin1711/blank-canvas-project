// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const h24ago = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const h48ago = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();

    // Busca carrinhos abandonados entre 24h e 48h atrás (sem enviar duas vezes)
    const { data: carts, error } = await supabase
      .from("abandoned_carts")
      .select("*")
      .lt("last_interaction", h24ago)
      .gt("last_interaction", h48ago)
      .eq("email_sent", false);

    if (error) throw error;
    if (!carts || carts.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    for (const cart of carts) {
      const email = cart.email || cart.customer_email;
      if (!email) continue;

      // Busca perfil para nome
      let customerName = cart.customer_name || "";
      if (!customerName && cart.user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("user_id", cart.user_id)
          .maybeSingle();
        customerName = profile?.name || "";
      }

      const items = Array.isArray(cart.items)
        ? cart.items
        : (typeof cart.items === "string" ? JSON.parse(cart.items) : []);

      // Envia email
      const sendRes = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          template: "abandoned_cart",
          to: email,
          data: { customerName, items },
        }),
      });

      if (sendRes.ok) {
        // Marca como enviado
        await supabase
          .from("abandoned_carts")
          .update({ email_sent: true })
          .eq("id", cart.id);
        sent++;
      }
    }

    console.log(`[abandoned-cart-email] Sent ${sent} emails out of ${carts.length} carts`);
    return new Response(JSON.stringify({ processed: carts.length, sent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e: any) {
    console.error("[abandoned-cart-email] Error:", e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

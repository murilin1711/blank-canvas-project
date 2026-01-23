// @ts-nocheck
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, token, data } = await req.json();
    
    // Validate admin token
    const adminPassword = Deno.env.get('ADMIN_PASSWORD');
    if (!adminPassword) {
      return new Response(
        JSON.stringify({ error: 'Configuração de servidor inválida' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Decode and validate token
    try {
      const decoded = atob(token);
      const [prefix, expiresAt] = decoded.split(':');
      if (prefix !== 'admin' || Date.now() > parseInt(expiresAt)) {
        throw new Error('Token inválido ou expirado');
      }
    } catch {
      return new Response(
        JSON.stringify({ error: 'Token inválido ou expirado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let result;

    switch (action) {
      case 'get_all_data': {
        // Load all admin data
        const [
          bolsaPaymentsRes,
          ordersRes,
          abandonedCartsRes,
          feedbacksRes,
          productsRes,
          profilesRes
        ] = await Promise.all([
          supabase.from("bolsa_uniforme_payments").select("*").order("created_at", { ascending: false }),
          supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }),
          supabase.from("abandoned_carts").select("*").order("last_interaction", { ascending: false }),
          supabase.from("feedbacks").select("*").order("created_at", { ascending: false }),
          supabase.from("products").select("*").order("name", { ascending: true }),
          supabase.from("profiles").select("*").order("created_at", { ascending: false })
        ]);

        // Get customer data for each profile
        const customers = [];
        if (profilesRes.data) {
          for (const profile of profilesRes.data) {
            const [userOrders, cartData, activitiesData] = await Promise.all([
              supabase.from("orders").select("total, created_at").eq("user_id", profile.user_id),
              supabase.from("cart_items").select("*").eq("user_id", profile.user_id),
              supabase.from("user_activities").select("*").eq("user_id", profile.user_id).order("created_at", { ascending: false }).limit(5)
            ]);

            const ordersCount = userOrders.data?.length || 0;
            const totalSpent = userOrders.data?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
            const lastOrder = userOrders.data?.sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];

            customers.push({
              profile,
              ordersCount,
              totalSpent,
              cartItems: cartData.data || [],
              lastActivity: lastOrder?.created_at || profile.created_at,
              recentActivities: activitiesData.data || []
            });
          }
        }

        result = {
          bolsaPayments: bolsaPaymentsRes.data || [],
          orders: ordersRes.data || [],
          abandonedCarts: abandonedCartsRes.data || [],
          feedbacks: feedbacksRes.data || [],
          products: productsRes.data || [],
          customers
        };
        break;
      }

      case 'update_payment_status': {
        const { id, status } = data;
        const { error } = await supabase
          .from("bolsa_uniforme_payments")
          .update({ status, processed_at: new Date().toISOString() })
          .eq("id", id);
        
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'toggle_feedback_visibility': {
        const { id, is_visible } = data;
        const { error } = await supabase
          .from("feedbacks")
          .update({ is_visible })
          .eq("id", id);
        
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'save_product': {
        const { product, isNew } = data;
        if (isNew) {
          const { error } = await supabase.from("products").insert(product);
          if (error) throw error;
        } else {
          const { id, ...productData } = product;
          const { error } = await supabase.from("products").update(productData).eq("id", id);
          if (error) throw error;
        }
        result = { success: true };
        break;
      }

      case 'delete_product': {
        const { id } = data;
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (error) throw error;
        result = { success: true };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Ação desconhecida' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in admin-data:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

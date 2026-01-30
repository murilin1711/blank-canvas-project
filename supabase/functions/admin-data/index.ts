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
      // Section-based loading for better performance
      case 'get_bolsa_payments': {
        const { data: bolsaPayments, error } = await supabase
          .from("bolsa_uniforme_payments")
          .select("*")
          .order("created_at", { ascending: true }); // Oldest first
        
        if (error) throw error;
        result = { bolsaPayments: bolsaPayments || [] };
        break;
      }

      case 'get_orders': {
        const { data: orders, error } = await supabase
          .from("orders")
          .select("*, order_items(*)")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        result = { orders: orders || [] };
        break;
      }

      case 'get_products': {
        const { data: products, error } = await supabase
          .from("products")
          .select("*")
          .order("school_slug", { ascending: true })
          .order("display_order", { ascending: true });
        
        if (error) throw error;
        result = { products: products || [] };
        break;
      }

      case 'get_feedbacks': {
        const { data: feedbacks, error } = await supabase
          .from("feedbacks")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        result = { feedbacks: feedbacks || [] };
        break;
      }

      case 'get_customers': {
        // Optimized: single query for profiles, then batch queries for related data
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (profilesError) throw profilesError;
        
        if (!profiles || profiles.length === 0) {
          result = { customers: [] };
          break;
        }

        const userIds = profiles.map(p => p.user_id);
        
        // Batch queries in parallel
        const [ordersRes, cartsRes, activitiesRes] = await Promise.all([
          supabase.from("orders").select("user_id, total, created_at").in("user_id", userIds),
          supabase.from("cart_items").select("user_id, id").in("user_id", userIds),
          supabase.from("user_activities").select("user_id, activity_type, description, created_at, metadata").in("user_id", userIds).order("created_at", { ascending: false })
        ]);

        // Group data by user_id for O(1) lookup
        const ordersByUser: Record<string, any[]> = {};
        const cartsByUser: Record<string, any[]> = {};
        const activitiesByUser: Record<string, any[]> = {};

        (ordersRes.data || []).forEach(o => {
          if (!ordersByUser[o.user_id]) ordersByUser[o.user_id] = [];
          ordersByUser[o.user_id].push(o);
        });

        (cartsRes.data || []).forEach(c => {
          if (!cartsByUser[c.user_id]) cartsByUser[c.user_id] = [];
          cartsByUser[c.user_id].push(c);
        });

        (activitiesRes.data || []).forEach(a => {
          if (!activitiesByUser[a.user_id]) activitiesByUser[a.user_id] = [];
          activitiesByUser[a.user_id].push(a);
        });

        // Map profiles with aggregated data
        const customers = profiles.map(profile => {
          const userOrders = ordersByUser[profile.user_id] || [];
          const ordersCount = userOrders.length;
          const totalSpent = userOrders.reduce((sum, o) => sum + Number(o.total), 0);
          const lastOrder = userOrders.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0];
          const recentActivities = (activitiesByUser[profile.user_id] || []).slice(0, 5);

          return {
            profile,
            ordersCount,
            totalSpent,
            cartItems: cartsByUser[profile.user_id] || [],
            lastActivity: lastOrder?.created_at || profile.created_at,
            recentActivities
          };
        });

        result = { customers };
        break;
      }

      case 'get_abandoned_carts': {
        const { data: abandonedCarts, error } = await supabase
          .from("abandoned_carts")
          .select("*")
          .order("last_interaction", { ascending: false });
        
        if (error) throw error;
        result = { abandonedCarts: abandonedCarts || [] };
        break;
      }

      case 'get_financials': {
        // Get orders for financial calculations
        const { data: orders, error } = await supabase
          .from("orders")
          .select("total, created_at, status")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        result = { orders: orders || [] };
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

      case 'update_feedback': {
        const { id, user_name, rating, comment } = data;
        const { error } = await supabase
          .from("feedbacks")
          .update({ user_name, rating, comment, updated_at: new Date().toISOString() })
          .eq("id", id);
        
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'delete_feedback': {
        const { id } = data;
        const { error } = await supabase
          .from("feedbacks")
          .delete()
          .eq("id", id);
        
        if (error) throw error;
        result = { success: true };
        break;
      }

      case 'create_feedback': {
        const { user_name, rating, comment } = data;
        const { error } = await supabase
          .from("feedbacks")
          .insert({
            user_id: '00000000-0000-0000-0000-000000000000', // Admin-created feedback
            user_name,
            rating,
            comment,
            is_visible: true
          });
        
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

      case 'reorder_products': {
        const { productIds, schoolSlug } = data;
        // Update display_order in parallel for better performance
        await Promise.all(productIds.map((id: number, index: number) => 
          supabase
            .from("products")
            .update({ display_order: index + 1 })
            .eq("id", id)
            .eq("school_slug", schoolSlug)
        ));
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

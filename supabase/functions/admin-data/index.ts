// @ts-nocheck
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, token, data } = await req.json();
    
    // Validate token
    const decoded = atob(token);
    const parts = decoded.split(':');
    const prefix = parts[0];
    const expiresAt = parseInt(parts[1]);
    if ((prefix !== 'admin' && prefix !== 'caixa') || Date.now() > expiresAt) {
      return new Response(JSON.stringify({ error: 'Token inválido' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    let result: any = {};

    if (action === 'get_bolsa_payments') {
      // IMPORTANT: do not send qr_code_image in the list payload (it's a large base64 string)
      const { data: d } = await supabase
        .from("bolsa_uniforme_payments")
        .select("id, user_id, order_id, total_amount, items, notes, password, status, customer_name, customer_phone, customer_email, created_at, updated_at, processed_at, processed_by")
        .order("created_at", { ascending: true });

      result = { bolsaPayments: d || [] };
    } else if (action === 'get_bolsa_payment_details') {
      const paymentId = data?.id;
      if (!paymentId) {
        return new Response(JSON.stringify({ error: 'ID do pagamento é obrigatório' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const { data: d } = await supabase
        .from("bolsa_uniforme_payments")
        .select("*")
        .eq("id", paymentId)
        .maybeSingle();

      result = { bolsaPayment: d };
    } else if (action === 'get_orders') {
      const { data: d } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
      result = { orders: d || [] };
    } else if (action === 'get_products') {
      const { data: d } = await supabase.from("products").select("*").order("school_slug").order("display_order");
      result = { products: d || [] };
    } else if (action === 'get_feedbacks') {
      const { data: d } = await supabase.from("feedbacks").select("*").order("created_at", { ascending: false });
      result = { feedbacks: d || [] };
    } else if (action === 'get_customers') {
      const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (!profiles?.length) { result = { customers: [] }; }
      else {
        const ids = profiles.map(p => p.user_id);
        const [o, c, a] = await Promise.all([
          supabase.from("orders").select("user_id, total, created_at").in("user_id", ids),
          supabase.from("cart_items").select("user_id, id").in("user_id", ids),
          supabase.from("user_activities").select("user_id, activity_type, description, created_at, metadata").in("user_id", ids).order("created_at", { ascending: false })
        ]);
        const ob: any = {}, cb: any = {}, ab: any = {};
        (o.data || []).forEach(x => { ob[x.user_id] = ob[x.user_id] || []; ob[x.user_id].push(x); });
        (c.data || []).forEach(x => { cb[x.user_id] = cb[x.user_id] || []; cb[x.user_id].push(x); });
        (a.data || []).forEach(x => { ab[x.user_id] = ab[x.user_id] || []; ab[x.user_id].push(x); });
        result = { customers: profiles.map(p => {
          const uo = ob[p.user_id] || [];
          return { profile: p, ordersCount: uo.length, totalSpent: uo.reduce((s: number, x: any) => s + Number(x.total), 0), cartItems: cb[p.user_id] || [], lastActivity: uo.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.created_at || p.created_at, recentActivities: (ab[p.user_id] || []).slice(0, 5) };
        })};
      }
    } else if (action === 'get_abandoned_carts') {
      const { data: d } = await supabase.from("abandoned_carts").select("*").order("last_interaction", { ascending: false });
      result = { abandonedCarts: d || [] };
    } else if (action === 'get_financials') {
      const { data: d } = await supabase.from("orders").select("total, created_at, status").order("created_at", { ascending: false });
      result = { orders: d || [] };
    } else if (action === 'update_payment_status') {
      await supabase.from("bolsa_uniforme_payments").update({ status: data.status, processed_at: new Date().toISOString() }).eq("id", data.id);
      result = { success: true };
    } else if (action === 'toggle_feedback_visibility') {
      await supabase.from("feedbacks").update({ is_visible: data.is_visible }).eq("id", data.id);
      result = { success: true };
    } else if (action === 'update_feedback') {
      await supabase.from("feedbacks").update({ user_name: data.user_name, rating: data.rating, comment: data.comment, updated_at: new Date().toISOString() }).eq("id", data.id);
      result = { success: true };
    } else if (action === 'delete_feedback') {
      await supabase.from("feedbacks").delete().eq("id", data.id);
      result = { success: true };
    } else if (action === 'create_feedback') {
      await supabase.from("feedbacks").insert({ user_id: '00000000-0000-0000-0000-000000000000', user_name: data.user_name, rating: data.rating, comment: data.comment, is_visible: true });
      result = { success: true };
    } else if (action === 'save_product') {
      if (data.isNew) { await supabase.from("products").insert(data.product); }
      else { const { id, ...p } = data.product; await supabase.from("products").update(p).eq("id", id); }
      result = { success: true };
    } else if (action === 'delete_product') {
      await supabase.from("products").delete().eq("id", data.id);
      result = { success: true };
    } else if (action === 'reorder_products') {
      await Promise.all(data.productIds.map((id: number, i: number) => supabase.from("products").update({ display_order: i + 1 }).eq("id", id).eq("school_slug", data.schoolSlug)));
      result = { success: true };
    } else if (action === 'update_category') {
      await supabase.from("products").update({ category: data.newCategory }).eq("category", data.oldCategory);
      result = { success: true };
    } else if (action === 'delete_category') {
      await supabase.from("products").update({ category: null }).eq("category", data.category);
      result = { success: true };
    } else {
      return new Response(JSON.stringify({ error: 'Ação desconhecida' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify(result), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Erro interno' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

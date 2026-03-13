// @ts-nocheck
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MELHOR_ENVIO_API = "https://sandbox.melhorenvio.com.br";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const clientId = Deno.env.get("MELHOR_ENVIO_CLIENT_ID");
    const clientSecret = Deno.env.get("MELHOR_ENVIO_CLIENT_SECRET");

    if (!clientId || !clientSecret) {
      throw new Error("MELHOR_ENVIO_CLIENT_ID or MELHOR_ENVIO_CLIENT_SECRET not configured");
    }

    const { action, code, redirect_uri } = await req.json();

    // Action: "authorize_url" — returns the URL the user must visit
    if (action === "authorize_url") {
      const callbackUri = redirect_uri || `${supabaseUrl}/functions/v1/melhor-envio-auth`;
      const url = `${MELHOR_ENVIO_API}/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUri)}&response_type=code&scope=shipping-calculate shipping-cancel shipping-checkout shipping-companies shipping-generate shipping-preview shipping-print shipping-share shipping-tracking ecommerce-shipping cart-read cart-write orders-read&state=auth`;
      return new Response(
        JSON.stringify({ success: true, url }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: "exchange" — exchange authorization code for token
    if (action === "exchange") {
      if (!code) {
        return new Response(
          JSON.stringify({ error: "Authorization code is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const callbackUri = redirect_uri || `${supabaseUrl}/functions/v1/melhor-envio-auth`;

      const tokenResponse = await fetch(`${MELHOR_ENVIO_API}/oauth/token`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "GenesisPoint contato@genesispoint.com.br",
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: callbackUri,
          code,
        }),
      });

      if (!tokenResponse.ok) {
        const errText = await tokenResponse.text();
        console.error("Token exchange error:", tokenResponse.status, errText);
        return new Response(
          JSON.stringify({ error: "Token exchange failed", details: errText }),
          { status: tokenResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const tokenData = await tokenResponse.json();
      console.log("Token exchange successful, expires_in:", tokenData.expires_in);

      const expiresAt = new Date(Date.now() + (tokenData.expires_in || 2592000) * 1000).toISOString();

      // Delete old tokens and store new one
      await supabase.from("melhor_envio_tokens").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      
      const { error: insertError } = await supabase.from("melhor_envio_tokens").insert({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
      });

      if (insertError) {
        console.error("Error storing token:", insertError);
        throw new Error("Failed to store token");
      }

      return new Response(
        JSON.stringify({ success: true, message: "Token obtido e armazenado com sucesso!", expires_at: expiresAt }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: "refresh" — refresh token
    if (action === "refresh") {
      const { data: tokenRow } = await supabase
        .from("melhor_envio_tokens")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!tokenRow?.refresh_token) {
        return new Response(
          JSON.stringify({ error: "No refresh token found. Please authorize first." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const refreshResponse = await fetch(`${MELHOR_ENVIO_API}/oauth/token`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "GenesisPoint contato@genesispoint.com.br",
        },
        body: JSON.stringify({
          grant_type: "refresh_token",
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: tokenRow.refresh_token,
        }),
      });

      if (!refreshResponse.ok) {
        const errText = await refreshResponse.text();
        console.error("Token refresh error:", errText);
        return new Response(
          JSON.stringify({ error: "Token refresh failed", details: errText }),
          { status: refreshResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const refreshData = await refreshResponse.json();
      const newExpiresAt = new Date(Date.now() + (refreshData.expires_in || 2592000) * 1000).toISOString();

      await supabase.from("melhor_envio_tokens").update({
        access_token: refreshData.access_token,
        refresh_token: refreshData.refresh_token,
        expires_at: newExpiresAt,
        updated_at: new Date().toISOString(),
      }).eq("id", tokenRow.id);

      return new Response(
        JSON.stringify({ success: true, message: "Token renovado com sucesso!", expires_at: newExpiresAt }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: "status" — check current token status
    if (action === "status") {
      const { data: tokenRow } = await supabase
        .from("melhor_envio_tokens")
        .select("expires_at, updated_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!tokenRow) {
        return new Response(
          JSON.stringify({ success: true, hasToken: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const isExpired = new Date(tokenRow.expires_at) < new Date();
      return new Response(
        JSON.stringify({ success: true, hasToken: true, isExpired, expiresAt: tokenRow.expires_at }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: authorize_url, exchange, refresh, status" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in melhor-envio-auth:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

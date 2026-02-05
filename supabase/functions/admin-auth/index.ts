// @ts-nocheck
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const { password, type } = await req.json();
    
    const adminPassword = Deno.env.get('ADMIN_PASSWORD');
    const caixaPassword = Deno.env.get('CAIXA_PASSWORD');
    
    // Determine which login type
    const loginType = type === 'caixa' ? 'caixa' : 'admin';
    const targetPassword = loginType === 'caixa' ? caixaPassword : adminPassword;
    
    if (!targetPassword) {
      console.error(`${loginType.toUpperCase()}_PASSWORD not configured`);
      return new Response(
        JSON.stringify({ error: 'Configuração de servidor inválida' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (password !== targetPassword) {
      console.log(`Invalid ${loginType} password attempt`);
      return new Response(
        JSON.stringify({ error: 'Senha incorreta' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a session token (valid for 1 hour)
    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour from now
    const token = btoa(`${loginType}:${expiresAt}:${crypto.randomUUID()}`);

    console.log(`${loginType} login successful`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        token,
        expiresAt,
        type: loginType
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in admin-auth:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

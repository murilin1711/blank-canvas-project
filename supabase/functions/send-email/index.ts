// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = "Goiás Minas Uniformes <suporte@goiasminas.com>";
const LOGO = "https://www.goiasminas.com/logo-white.png";

const fmt = (n: number) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;

const STATUS_LABEL: Record<string, string> = {
  pending: "Aguardando pagamento",
  paid: "Pagamento confirmado",
  separating: "Separando seu pedido",
  shipped: "Pedido enviado",
  delivered: "Pedido entregue",
  cancelled: "Pedido cancelado",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "#f59e0b",
  paid: "#10b981",
  separating: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  cancelled: "#ef4444",
};

function baseLayout(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR" xmlns="http://www.w3.org/1999/xhtml" style="color-scheme: light;">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${title}</title>
  <style>
    html { color-scheme: light !important; }
    :root { color-scheme: light !important; supported-color-schemes: light !important; }
    body { background-color: #f4f4f7 !important; }
    @media (prefers-color-scheme: dark) {
      body { background-color: #f4f4f7 !important; }
      .wrapper { background-color: #f4f4f7 !important; }
      .header-cell { background-color: #2e3091 !important; }
      .content-cell { background-color: #ffffff !important; color: #111827 !important; }
      .footer-cell { background-color: #f9f9fb !important; }
      h1, h2, p { color: inherit !important; }
    }
    @media only screen and (max-width:600px) {
      .wrapper { padding: 16px 8px !important; }
      .container { width: 100% !important; }
      .content-cell { padding: 24px 20px !important; }
      .header-cell { padding: 24px 20px !important; }
      .footer-cell { padding: 20px !important; }
      .logo-img { height: 56px !important; }
      .cta-btn { padding: 13px 24px !important; font-size: 13px !important; }
      .item-img { display: none !important; width: 0 !important; height: 0 !important; overflow: hidden !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" class="wrapper" style="background:#f4f4f7;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" class="container" style="max-width:560px;">

        <!-- Logo Header -->
        <tr>
          <td class="header-cell" bgcolor="#2e3091" style="background:#2e3091 !important;background-color:#2e3091 !important;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
            <img src="${LOGO}" alt="Goiás Minas Uniformes" class="logo-img" style="height:70px;width:auto;display:block;margin:0 auto;" />
            <p style="color:#ffffff;opacity:0.8;font-size:12px;margin:10px 0 0;letter-spacing:0.5px;">UNIFORMES ESCOLARES DE QUALIDADE</p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td class="content-cell" bgcolor="#ffffff" style="background:#ffffff;padding:36px 32px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td class="footer-cell" bgcolor="#f9f9fb" style="background:#f9f9fb;border-radius:0 0 16px 16px;border-top:1px solid #eee;padding:24px 32px;text-align:center;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">
              Goiás Minas Uniformes &bull;
              <a href="mailto:suporte@goiasminas.com" style="color:#2e3091;text-decoration:none;">suporte@goiasminas.com</a>
            </p>
            <p style="color:#9ca3af;font-size:11px;margin:6px 0 0;">
              &copy; 2026 Goiás Minas Uniformes. Todos os direitos reservados.<br>
              <a href="https://goiasminas.com" style="color:#2e3091;text-decoration:none;">goiasminas.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function ctaButton(text: string, url: string): string {
  return `<div style="text-align:center;margin:28px 0 8px;">
    <a href="${url}" class="cta-btn" style="background:#2e3091;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:50px;font-size:14px;font-weight:bold;display:inline-block;letter-spacing:0.3px;">${text}</a>
  </div>`;
}

function itemsTable(items: any[]): string {
  if (!items || items.length === 0) return "";
  const rows = items.map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;vertical-align:middle;">
        ${item.product_image ? `<img src="${item.product_image}" alt="${item.product_name}" class="item-img" style="width:52px;height:52px;object-fit:cover;border-radius:8px;float:left;margin-right:12px;">` : ""}
        <div style="overflow:hidden;">
          <p style="margin:0;font-size:14px;font-weight:bold;color:#111827;">${item.product_name}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Tamanho: ${item.size || "&mdash;"} &bull; Qtd: ${item.quantity}</p>
        </div>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;text-align:right;vertical-align:middle;white-space:nowrap;">
        <p style="margin:0;font-size:14px;font-weight:bold;color:#111827;">${fmt(item.price * item.quantity)}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#9ca3af;">${fmt(item.price)} cada</p>
      </td>
    </tr>`).join("");

  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">${rows}</table>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0;">`;
}

function orderConfirmationHtml(data: any): string {
  const { orderId, customerName, items = [], subtotal, shipping, total, shippingAddress } = data;
  const firstName = (customerName || "Cliente").split(" ")[0];
  const addr = shippingAddress || {};

  const content = `
    <h1 style="font-size:22px;font-weight:bold;color:#111827;margin:0 0 4px;">Pedido confirmado! 🎉</h1>
    <p style="font-size:14px;color:#6b7280;margin:0 0 24px;">Olá, ${firstName}! Seu pedido foi recebido e está sendo processado.</p>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#166534;font-weight:bold;">✅ Pedido #${orderId} confirmado</p>
      <p style="margin:4px 0 0;font-size:12px;color:#166534;">Você receberá atualizações por email sobre o andamento do seu pedido.</p>
    </div>

    <h2 style="font-size:15px;font-weight:bold;color:#374151;margin:0 0 4px;">Itens do pedido</h2>
    ${itemsTable(items)}

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
      <tr>
        <td style="font-size:13px;color:#6b7280;padding:4px 0;">Subtotal</td>
        <td style="font-size:13px;color:#374151;text-align:right;padding:4px 0;">${fmt(subtotal || 0)}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#6b7280;padding:4px 0;">Frete</td>
        <td style="font-size:13px;color:#374151;text-align:right;padding:4px 0;">${shipping > 0 ? fmt(shipping) : "Grátis"}</td>
      </tr>
      <tr>
        <td style="font-size:16px;font-weight:bold;color:#111827;padding:12px 0 4px;border-top:2px solid #f3f4f6;">Total</td>
        <td style="font-size:16px;font-weight:bold;color:#2e3091;text-align:right;padding:12px 0 4px;border-top:2px solid #f3f4f6;">${fmt(total || 0)}</td>
      </tr>
    </table>

    ${addr.street ? `${divider()}
    <h2 style="font-size:15px;font-weight:bold;color:#374151;margin:0 0 8px;">Endereço de entrega</h2>
    <p style="font-size:13px;color:#6b7280;margin:0;line-height:1.7;">
      ${addr.street}, ${addr.number}${addr.complement ? ` - ${addr.complement}` : ""}<br>
      ${addr.neighborhood ? `${addr.neighborhood}, ` : ""}${addr.city} - ${addr.state}<br>
      CEP: ${addr.cep}
    </p>` : ""}

    ${ctaButton("Ver meu pedido", "https://goiasminas.com/meus-pedidos")}

    <p style="font-size:12px;color:#9ca3af;text-align:center;margin:16px 0 0;">
      Dúvidas? Fale conosco em <a href="mailto:suporte@goiasminas.com" style="color:#2e3091;">suporte@goiasminas.com</a>
    </p>`;

  return baseLayout("Pedido confirmado - Goiás Minas Uniformes", content);
}

function statusUpdateHtml(data: any): string {
  const { orderId, customerName, status, items = [], total } = data;
  const firstName = (customerName || "Cliente").split(" ")[0];
  const label = STATUS_LABEL[status] || status;
  const color = STATUS_COLOR[status] || "#6b7280";

  const statusMessages: Record<string, string> = {
    separating: "Nossa equipe já começou a separar os itens do seu pedido. Em breve ele será enviado!",
    shipped: "Seu pedido saiu para entrega! Fique atento ao rastreamento.",
    delivered: "Seu pedido foi entregue. Esperamos que você esteja satisfeito com os produtos!",
    cancelled: "Seu pedido foi cancelado. Se você tiver dúvidas, entre em contato conosco.",
    paid: "Seu pagamento foi confirmado e o pedido está em processamento.",
  };

  const message = statusMessages[status] || "O status do seu pedido foi atualizado.";

  const content = `
    <h1 style="font-size:22px;font-weight:bold;color:#111827;margin:0 0 4px;">Atualização do pedido</h1>
    <p style="font-size:14px;color:#6b7280;margin:0 0 24px;">Olá, ${firstName}! Seu pedido teve uma atualização.</p>

    <div style="border-radius:12px;padding:20px 24px;margin-bottom:24px;background:${color}18;border:1px solid ${color}40;text-align:center;">
      <p style="margin:0;font-size:13px;color:#6b7280;">Pedido #${orderId}</p>
      <p style="margin:8px 0 4px;font-size:22px;font-weight:bold;color:${color};">${label}</p>
      <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">${message}</p>
    </div>

    ${items.length > 0 ? `
    <h2 style="font-size:15px;font-weight:bold;color:#374151;margin:0 0 4px;">Resumo do pedido</h2>
    ${itemsTable(items)}
    <p style="text-align:right;font-size:14px;font-weight:bold;color:#2e3091;">Total: ${fmt(total || 0)}</p>` : ""}

    ${ctaButton("Acompanhar meu pedido", "https://goiasminas.com/meus-pedidos")}

    <p style="font-size:12px;color:#9ca3af;text-align:center;margin:16px 0 0;">
      Precisa de ajuda? <a href="mailto:suporte@goiasminas.com" style="color:#2e3091;">suporte@goiasminas.com</a>
    </p>`;

  return baseLayout(`Pedido #${orderId} — ${label}`, content);
}

function deliveryHtml(data: any): string {
  const { orderId, customerName, items = [] } = data;
  const firstName = (customerName || "Cliente").split(" ")[0];

  const content = `
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:48px;margin-bottom:8px;">🎉</div>
      <h1 style="font-size:24px;font-weight:bold;color:#111827;margin:0 0 8px;">Seu pedido chegou!</h1>
      <p style="font-size:14px;color:#6b7280;margin:0;">Olá, ${firstName}! Seu pedido #${orderId} foi entregue com sucesso.</p>
    </div>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0;font-size:15px;color:#166534;font-weight:bold;">✅ Entrega confirmada</p>
      <p style="margin:6px 0 0;font-size:13px;color:#166534;">Esperamos que você esteja satisfeito com os produtos!</p>
    </div>

    ${items.length > 0 ? `
    <h2 style="font-size:15px;font-weight:bold;color:#374151;margin:0 0 4px;">Itens recebidos</h2>
    ${itemsTable(items)}` : ""}

    <div style="background:#f8faff;border-radius:12px;padding:20px 24px;margin:24px 0;text-align:center;">
      <p style="margin:0 0 8px;font-size:15px;font-weight:bold;color:#374151;">Gostou dos produtos?</p>
      <p style="margin:0 0 16px;font-size:13px;color:#6b7280;">Sua avaliação ajuda outros clientes a escolherem melhor!</p>
      ${ctaButton("Deixar avaliação", "https://goiasminas.com/meus-pedidos")}
    </div>

    <p style="font-size:12px;color:#9ca3af;text-align:center;margin:16px 0 0;">
      Algo errado? <a href="mailto:suporte@goiasminas.com" style="color:#2e3091;">Entre em contato conosco</a>
    </p>`;

  return baseLayout("Pedido entregue! - Goiás Minas Uniformes", content);
}

function abandonedCartHtml(data: any): string {
  const { customerName, items = [] } = data;
  const firstName = (customerName || "").split(" ")[0] || "Olá";

  const content = `
    <h1 style="font-size:22px;font-weight:bold;color:#111827;margin:0 0 4px;">Você esqueceu algo! 🛒</h1>
    <p style="font-size:14px;color:#6b7280;margin:0 0 24px;">
      ${firstName}, você deixou alguns itens no carrinho. Eles ainda estão esperando por você!
    </p>

    ${items.length > 0 ? `
    <h2 style="font-size:15px;font-weight:bold;color:#374151;margin:0 0 4px;">Itens no seu carrinho</h2>
    ${itemsTable(items)}` : ""}

    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:16px 20px;margin:24px 0;text-align:center;">
      <p style="margin:0;font-size:14px;color:#9a3412;font-weight:bold;">⏰ Os itens estão disponíveis agora</p>
      <p style="margin:6px 0 0;font-size:13px;color:#9a3412;">Não garantimos o estoque por muito tempo. Complete sua compra!</p>
    </div>

    ${ctaButton("Finalizar minha compra", "https://goiasminas.com/carrinho")}

    <p style="font-size:12px;color:#9ca3af;text-align:center;margin:16px 0 0;">
      Dúvidas? <a href="mailto:suporte@goiasminas.com" style="color:#2e3091;">suporte@goiasminas.com</a>
    </p>`;

  return baseLayout("Você esqueceu algo no carrinho! - Goiás Minas Uniformes", content);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const { template, to, data } = await req.json();
    if (!to || !template) throw new Error("Missing required fields: to, template");

    let subject = "";
    let html = "";

    switch (template) {
      case "order_confirmation":
        subject = `✅ Pedido #${data.orderId} confirmado — Goiás Minas Uniformes`;
        html = orderConfirmationHtml(data);
        break;
      case "status_update":
        subject = `📦 Pedido #${data.orderId}: ${STATUS_LABEL[data.status] || data.status}`;
        html = statusUpdateHtml(data);
        break;
      case "delivery":
        subject = `🎉 Seu pedido #${data.orderId} foi entregue!`;
        html = deliveryHtml(data);
        break;
      case "abandoned_cart":
        subject = "🛒 Você esqueceu algo no carrinho — Goiás Minas";
        html = abandonedCartHtml(data);
        break;
      default:
        throw new Error(`Unknown template: ${template}`);
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });

    const resData = await res.json();
    if (!res.ok) throw new Error(`Resend error: ${JSON.stringify(resData)}`);

    console.log(`[send-email] Sent ${template} to ${to}`, resData.id);
    return new Response(JSON.stringify({ success: true, id: resData.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e: any) {
    console.error("[send-email] Error:", e.message);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
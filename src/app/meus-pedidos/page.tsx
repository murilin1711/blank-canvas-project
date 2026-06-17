import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/sections/footer";
import { StripeCustomPayment } from "@/components/StripeCustomPayment";
import { MercadoPagoPixPayment } from "@/components/MercadoPagoPixPayment";
import { BolsaUniformePayment } from "@/components/BolsaUniformePayment";
import { toast } from "sonner";
import { Package, AlertTriangle, Clock, XCircle, CreditCard, RefreshCw, Truck } from "lucide-react";

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  size: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  payment_method: string | null;
  tracking_code?: string | null;
  items: OrderItem[];
}

interface BolsaItem {
  productId?: number;
  productName?: string;
  productImage?: string;
  price: number;
  size: string;
  quantity: number;
}

interface BolsaPayment {
  id: string;
  created_at: string;
  status: "pending" | "approved" | "rejected";
  total_amount: number;
  shipping_amount: number;
  shipping_payment_status: string | null;
  notes: string | null;
  order_id: string | null;
  items: BolsaItem[];
  order_status?: string | null;
  order_tracking_code?: string | null;
}

// ---- BolsaPaymentCard ----

function BolsaPaymentCard({
  payment,
  user,
  userCpf,
  onRefresh,
}: {
  payment: BolsaPayment;
  user: { id: string; email?: string; user_metadata?: Record<string, string> } | null;
  userCpf: string;
  onRefresh: () => void;
}) {
  const [showFreteModal, setShowFreteModal] = useState(false);
  const [showReenvioModal, setShowReenvioModal] = useState(false);
  const [fretePaymentMethod, setFretePaymentMethod] = useState<"stripe" | "pix">("stripe");
  const [showStripe, setShowStripe] = useState(false);
  const [showPix, setShowPix] = useState(false);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const fretePendente =
    payment.shipping_amount > 0 && payment.shipping_payment_status !== "paid";
  const aguardando =
    !fretePendente && payment.status === "pending";
  const rejeitado = payment.status === "rejected";
  const aprovado = payment.status === "approved";

  const deliveryStatusLabel: Record<string, { label: string; color: string; icon: string }> = {
    paid:       { label: "Pagamento aprovado", color: "bg-green-100 text-green-800",   icon: "✓" },
    separating: { label: "Preparando envio",   color: "bg-blue-100 text-blue-800",     icon: "📦" },
    shipped:    { label: "Enviado",             color: "bg-purple-100 text-purple-800", icon: "🚚" },
    delivered:  { label: "Entregue",            color: "bg-green-100 text-green-800",   icon: "✓" },
    refunded:   { label: "Reembolsado",         color: "bg-red-100 text-red-800",       icon: "↩" },
  };
  const deliveryStatus = payment.order_status ? deliveryStatusLabel[payment.order_status] : null;

  const closeFreteModal = () => {
    setShowFreteModal(false);
    setShowStripe(false);
    setShowPix(false);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 border-[#2e3091]">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#2e3091]">Bolsa Uniforme</p>
              <p className="text-sm text-gray-500">{formatDate(payment.created_at)}</p>
            </div>
            {fretePendente && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Frete pendente
              </span>
            )}
            {aguardando && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Aguardando análise
              </span>
            )}
            {rejeitado && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                Rejeitado
              </span>
            )}
            {aprovado && deliveryStatus && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${deliveryStatus.color}`}>
                {deliveryStatus.icon} {deliveryStatus.label}
              </span>
            )}
            {aprovado && !deliveryStatus && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✓ Aprovado
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Itens */}
          <div className="space-y-3 mb-4">
            {(payment.items || []).map((item, i) => (
              <div key={i} className="flex gap-3 items-center">
                {item.productImage && (
                  <img src={item.productImage} alt={item.productName} className="w-14 h-14 object-cover rounded-lg" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                  <p className="text-xs text-gray-500">Tam: {item.size} · Qtd: {item.quantity}</p>
                  <p className="text-sm font-medium text-[#2e3091]">R$ {item.price.toFixed(2).replace(".", ",")}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Totais */}
          <div className="border-t border-gray-100 pt-3 text-sm space-y-1">
            <div className="flex justify-between text-gray-600">
              <span>Produtos</span>
              <span>R$ {payment.total_amount.toFixed(2).replace(".", ",")}</span>
            </div>
            {payment.shipping_amount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Frete</span>
                <span className={fretePendente ? "text-orange-600 font-medium" : ""}>
                  {fretePendente ? "⚠ " : ""}R$ {payment.shipping_amount.toFixed(2).replace(".", ",")}
                  {!fretePendente && <span className="ml-1 text-green-600 text-xs">✓ pago</span>}
                </span>
              </div>
            )}
          </div>

          {/* Status lines */}
          <div className="mt-3 space-y-1">
            {payment.shipping_payment_status === "paid" && (
              <p className="text-sm text-green-600 font-medium">✓ Frete pago</p>
            )}
            {payment.status === "pending" && (
              <p className="text-sm text-blue-600">⏳ Cartão Bolsa Uniforme: aguardando aprovação</p>
            )}
          </div>

          {/* Código de rastreio */}
          {payment.order_tracking_code && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <p className="text-sm font-medium text-purple-800 mb-2 flex items-center gap-1.5">
                🚚 Código de Rastreio
              </p>
              <p className="font-mono text-base bg-white border border-purple-300 px-3 py-2 rounded-lg tracking-widest text-gray-900 text-center">
                {payment.order_tracking_code}
              </p>
              <a
                href={`https://www.linkcorreios.com.br/?id=${payment.order_tracking_code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-1.5 text-sm text-purple-700 hover:text-purple-900 underline underline-offset-2 transition-colors"
              >
                Rastrear nos Correios
              </a>
            </div>
          )}

          {/* Ações */}
          <div className="mt-4">
            {fretePendente && (
              <button
                onClick={() => setShowFreteModal(true)}
                className="w-full bg-[#2e3091] text-white py-3 rounded-xl font-medium hover:bg-[#252a7a] transition-colors"
              >
                Pagar frete — R$ {payment.shipping_amount.toFixed(2).replace(".", ",")}
              </button>
            )}
            {rejeitado && (
              <div>
                {payment.notes && (
                  <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-sm text-red-700 font-medium">Motivo: {payment.notes}</p>
                  </div>
                )}
                <button
                  onClick={() => setShowReenvioModal(true)}
                  className="w-full flex items-center justify-center gap-2 border-2 border-[#2e3091] text-[#2e3091] py-3 rounded-xl font-medium hover:bg-[#2e3091]/5 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reenviar dados
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de pagamento do frete */}
      {showFreteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Pagar frete — R$ {payment.shipping_amount.toFixed(2).replace(".", ",")}
                </h3>
                <button onClick={closeFreteModal} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {!showStripe && !showPix && (
                <div className="space-y-3">
                  <label className={`block cursor-pointer rounded-2xl border-2 transition-all ${fretePaymentMethod === "stripe" ? "border-[#2e3091] bg-[#2e3091]/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <div className="p-4 flex items-center gap-3">
                      <input type="radio" checked={fretePaymentMethod === "stripe"} onChange={() => setFretePaymentMethod("stripe")} className="w-4 h-4 accent-[#2e3091]" />
                      <CreditCard className="w-5 h-5 text-[#2e3091]" />
                      <span className="font-medium text-gray-900">Cartão de Crédito / Boleto</span>
                    </div>
                  </label>
                  <label className={`block cursor-pointer rounded-2xl border-2 transition-all ${fretePaymentMethod === "pix" ? "border-[#2e3091] bg-[#2e3091]/5" : "border-gray-200 hover:border-gray-300"}`}>
                    <div className="p-4 flex items-center gap-3">
                      <input type="radio" checked={fretePaymentMethod === "pix"} onChange={() => setFretePaymentMethod("pix")} className="w-4 h-4 accent-[#2e3091]" />
                      <span className="text-lg">🏦</span>
                      <span className="font-medium text-gray-900">PIX</span>
                    </div>
                  </label>
                  <button
                    onClick={() => {
                      if (fretePaymentMethod === "stripe") setShowStripe(true);
                      else setShowPix(true);
                    }}
                    className="w-full bg-[#2e3091] text-white py-3 rounded-xl font-medium hover:bg-[#252a7a] transition-colors mt-2"
                  >
                    Continuar
                  </button>
                </div>
              )}

              {showStripe && (
                <StripeCustomPayment
                  items={[]}
                  customerEmail={user?.email || ""}
                  customerName={user?.user_metadata?.name || user?.email?.split("@")[0] || ""}
                  shippingAddress={{ cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "" }}
                  shipping={payment.shipping_amount}
                  userId={user?.id || ""}
                  total={payment.shipping_amount}
                  onSuccess={async () => {
                    await supabase
                      .from("bolsa_uniforme_payments")
                      .update({ shipping_payment_status: "paid" } as never)
                      .eq("id", payment.id);
                    closeFreteModal();
                    onRefresh();
                  }}
                />
              )}

              {showPix && (
                <MercadoPagoPixPayment
                  items={[]}
                  customerEmail={user?.email || ""}
                  customerName={user?.user_metadata?.name || user?.email?.split("@")[0] || ""}
                  cpf={userCpf}
                  total={payment.shipping_amount}
                  userId={user?.id || ""}
                  shippingAddress={{ cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "" }}
                  shipping={0}
                  bolsaPaymentId={payment.id}
                  onBack={() => setShowPix(false)}
                  onSuccess={() => {
                    closeFreteModal();
                    onRefresh();
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de reenvio de dados */}
      {showReenvioModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Reenviar dados do Bolsa Uniforme</h3>
                <button onClick={() => setShowReenvioModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <BolsaUniformePayment
                suggestedAmount={payment.total_amount}
                maxAmount={970}
                cardNumber={1}
                onCancel={() => setShowReenvioModal(false)}
                onComplete={async ({ qrCodeImage, password }) => {
                  const { error } = await supabase
                    .from("bolsa_uniforme_payments")
                    .update({
                      qr_code_image: qrCodeImage,
                      password,
                      status: "pending",
                      notes: null,
                    } as never)
                    .eq("id", payment.id)
                    .eq("user_id", user?.id || "");

                  if (error) {
                    toast.error("Erro ao reenviar dados. Tente novamente.");
                  } else {
                    toast.success("Dados reenviados! Aguardando nova análise.");
                    setShowReenvioModal(false);
                    onRefresh();
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ---- Main Page ----

export default function MeusPedidosPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [bolsaPayments, setBolsaPayments] = useState<BolsaPayment[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [userCpf, setUserCpf] = useState("");

  const fetchBolsaPayments = async (userId: string) => {
    const { data, error } = await supabase
      .from("bolsa_uniforme_payments")
      .select("id, created_at, status, total_amount, shipping_amount, shipping_payment_status, notes, order_id, items")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error || !data) return;

    // Busca status e tracking dos orders vinculados em batch
    const orderIds = data.map(p => p.order_id).filter((id): id is string => !!id);
    let orderMap: Record<string, { status: string; tracking_code: string | null }> = {};
    if (orderIds.length > 0) {
      const { data: orders } = await supabase
        .from("orders")
        .select("id, status, tracking_code")
        .in("id", orderIds);
      (orders || []).forEach(o => { orderMap[o.id] = { status: o.status, tracking_code: o.tracking_code ?? null }; });
    }

    setBolsaPayments(data.map(p => ({
      ...p,
      order_status: p.order_id ? orderMap[p.order_id]?.status ?? null : null,
      order_tracking_code: p.order_id ? orderMap[p.order_id]?.tracking_code ?? null : null,
    })) as unknown as BolsaPayment[]);
  };

  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem("checkout_personal");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed?.cpf) setUserCpf(parsed.cpf);
        } catch {}
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        setLoadingOrders(false);
        return;
      }

      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData } = await supabase
            .from("order_items")
            .select("*")
            .eq("order_id", order.id);
          return { ...order, items: itemsData || [] };
        })
      );

      setOrders(ordersWithItems);
      await fetchBolsaPayments(user.id);
      setLoadingOrders(false);
    };

    if (!loading) fetchOrders();
  }, [user, loading]);

  // Realtime: atualiza orders quando admin muda status/rastreio
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`meus-pedidos-${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const updated = payload.new as any;
          setOrders(prev =>
            prev.map(o => o.id === updated.id ? { ...o, ...updated } : o)
          );
          // Atualiza também order_status/order_tracking_code nos bolsaPayments vinculados
          setBolsaPayments(prev =>
            prev.map(p => p.order_id === updated.id
              ? { ...p, order_status: updated.status, order_tracking_code: updated.tracking_code ?? null }
              : p
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bolsa_uniforme_payments", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const updated = payload.new as any;
          setBolsaPayments(prev =>
            prev.map(p => p.id === updated.id ? { ...p, ...updated } : p)
          );
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  if (loading || (user && loadingOrders)) {
    return (
      <main className="min-h-screen bg-white pt-[120px]">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-32 bg-gray-200 rounded" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-gray-50 pt-[120px]">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Faça login para ver seus pedidos</h2>
            <p className="text-gray-500 mb-6">Se você comprou como convidado, verifique seu e-mail para acompanhar o pedido.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate("/auth")} className="bg-[#2e3091] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#252a7a] transition-colors">
                Fazer Login
              </button>
              <button onClick={() => navigate("/")} className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: "Pagamento pendente", color: "bg-yellow-100 text-yellow-800" },
      paid: { label: "Pagamento aprovado", color: "bg-green-100 text-green-800" },
      separating: { label: "Preparando envio", color: "bg-blue-100 text-blue-800" },
      shipped: { label: "Enviado", color: "bg-purple-100 text-purple-800" },
      delivered: { label: "Pedido entregue", color: "bg-teal-100 text-teal-800" },
      refunded: { label: "Reembolsado", color: "bg-red-100 text-red-800" },
    };
    return statusMap[status] || { label: status, color: "bg-gray-100 text-gray-800" };
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <main className="min-h-screen bg-gray-50 pt-[120px]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Pedidos</h1>

        {bolsaPayments.length === 0 && orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Nenhum pedido encontrado</h2>
            <p className="text-gray-500 mb-6">Você ainda não fez nenhum pedido.</p>
            <button onClick={() => navigate("/escolas/colegio-militar")} className="bg-[#2e3091] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#252a7a] transition-colors">
              Ver Produtos
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cards de Bolsa Uniforme pendentes */}
            {bolsaPayments.map((bp) => (
              <BolsaPaymentCard
                key={bp.id}
                payment={bp}
                user={user}
                userCpf={userCpf}
                onRefresh={() => fetchBolsaPayments(user.id)}
              />
            ))}

            {/* Pedidos normais */}
            {orders.map((order) => {
              const status = getStatusLabel(order.status);

              if (order.status === "delivered") {
                return (
                  <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 border-teal-400">
                    <div className="p-6 sm:p-8 text-center">
                      <div className="text-5xl mb-4">🎉</div>
                      <h3 className="text-lg font-semibold text-teal-700 mb-4">
                        Pedido #{order.id.slice(0, 8).toUpperCase()} — Entregue
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base max-w-xl mx-auto mb-6">
                        Que bom que seu pedido chegou! 😊 Agradecemos de coração por confiar na Goiás Minas Uniformes. Ficamos muito felizes em fazer parte da sua jornada escolar e em poder contribuir para que você receba seus uniformes com praticidade e segurança. Muito obrigado pela preferência! 💙
                      </p>
                      <button
                        onClick={() => navigate("/escolas/colegio-militar")}
                        className="inline-flex items-center gap-2 bg-[#2e3091] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#252a7a] transition-colors"
                      >
                        Fazer Novo Pedido
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Pedido #{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>{status.label}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <img src={item.product_image} alt={item.product_name} className="w-20 h-20 object-cover rounded-lg" />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                            <p className="text-sm text-gray-500">Tamanho: {item.size} | Qtd: {item.quantity}</p>
                            <p className="text-sm font-medium text-[#2e3091]">R$ {item.price.toFixed(2).replace(".", ",")}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>R$ {order.subtotal.toFixed(2).replace(".", ",")}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>Frete</span>
                        <span>R$ {order.shipping.toFixed(2).replace(".", ",")}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-gray-900 mt-2">
                        <span>Total</span>
                        <span>R$ {order.total.toFixed(2).replace(".", ",")}</span>
                      </div>
                    </div>

                    {/* Tracking code */}
                    {order.tracking_code && (
                      <div className="mt-4 bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Truck className="w-4 h-4 text-purple-700" />
                          <span className="text-sm font-semibold text-purple-800">Seu pedido foi enviado!</span>
                        </div>
                        <p className="text-sm text-purple-700 mb-2">Use o código abaixo para rastrear no site dos Correios:</p>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm bg-white border border-purple-300 px-3 py-1.5 rounded-lg tracking-widest text-gray-900 flex-1 text-center">
                            {order.tracking_code}
                          </span>
                          <a
                            href={`https://rastreamento.correios.com.br/app/index.php?objeto=${order.tracking_code}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm px-3 py-1.5 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-colors whitespace-nowrap"
                          >
                            Rastrear
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

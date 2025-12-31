import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Menu, 
  X, 
  Check, 
  XCircle, 
  MessageCircle,
  Plus,
  TrendingUp,
  Clock,
  RefreshCw,
  LogOut,
  CreditCard,
  Star,
  Eye,
  EyeOff,
  Lock,
  ZoomIn,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import goiasMinasLogo from "@/assets/goias-minas-logo.png";

type Tab = "pedidos" | "bolsa-uniforme" | "produtos" | "feedbacks" | "financeiro" | "clientes";

interface BolsaUniformePayment {
  id: string;
  user_id: string;
  qr_code_image: string;
  status: "pending" | "approved" | "rejected";
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  total_amount: number;
  items: any;
  shipping_address: any;
  notes: string | null;
  created_at: string;
}

interface Order {
  id: string;
  user_id: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  payment_method: string | null;
  shipping_address: any;
  created_at: string;
  order_items?: OrderItem[];
}

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  price: number;
  size: string;
  quantity: number;
}

interface AbandonedCart {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  items: any;
  total_amount: number;
  last_interaction: string;
}

interface Feedback {
  id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  is_visible?: boolean;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("pedidos");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data states
  const [bolsaPayments, setBolsaPayments] = useState<BolsaUniformePayment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCart[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  // Modal states
  const [selectedPayment, setSelectedPayment] = useState<BolsaUniformePayment | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [expandedPayments, setExpandedPayments] = useState<Record<string, boolean>>({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = () => {
      const token = sessionStorage.getItem('admin_token');
      const expiresAt = sessionStorage.getItem('admin_expires_at');
      
      if (token && expiresAt) {
        const expiry = parseInt(expiresAt, 10);
        if (Date.now() < expiry) {
          setIsAuthenticated(true);
          loadData();
        } else {
          sessionStorage.removeItem('admin_token');
          sessionStorage.removeItem('admin_expires_at');
        }
      }
    };
    
    checkSession();
  }, []);

  const handleLogin = async () => {
    if (!password.trim()) {
      toast.error("Digite a senha");
      return;
    }

    setIsLoggingIn(true);
    
    try {
      const response = await supabase.functions.invoke('admin-auth', {
        body: { password }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      sessionStorage.setItem('admin_token', data.token);
      sessionStorage.setItem('admin_expires_at', data.expiresAt.toString());
      
      setIsAuthenticated(true);
      toast.success("Acesso autorizado!");
      loadData();
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_expires_at');
    setIsAuthenticated(false);
    setPassword("");
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load bolsa uniforme payments
      const { data: payments } = await supabase
        .from("bolsa_uniforme_payments" as any)
        .select("*")
        .order("created_at", { ascending: false });
      
      if (payments) setBolsaPayments(payments as unknown as BolsaUniformePayment[]);

      // Load orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .order("created_at", { ascending: false });
      
      if (ordersData) setOrders(ordersData as Order[]);

      // Load abandoned carts
      const { data: carts } = await supabase
        .from("abandoned_carts" as any)
        .select("*")
        .order("last_interaction", { ascending: false });
      
      if (carts) setAbandonedCarts(carts as unknown as AbandonedCart[]);

      // Load feedbacks
      const { data: feedbacksData } = await supabase
        .from("feedbacks")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (feedbacksData) setFeedbacks(feedbacksData as Feedback[]);

    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePaymentStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from("bolsa_uniforme_payments" as any)
        .update({ status, processed_at: new Date().toISOString() } as any)
        .eq("id", id);

      if (error) throw error;
      
      toast.success(status === "approved" ? "Pagamento aprovado!" : "Pagamento rejeitado");
      loadData();
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Erro ao atualizar pagamento");
    }
  };

  const formatWhatsAppLink = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const fullPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
    return `https://wa.me/${fullPhone}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateFinancials = () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const paidOrders = orders.filter(o => o.status === "paid");
    
    const dailySales = paidOrders.filter(o => new Date(o.created_at) >= startOfDay);
    const weeklySales = paidOrders.filter(o => new Date(o.created_at) >= startOfWeek);
    const monthlySales = paidOrders.filter(o => new Date(o.created_at) >= startOfMonth);

    return {
      daily: {
        count: dailySales.length,
        total: dailySales.reduce((acc, o) => acc + Number(o.total), 0),
      },
      weekly: {
        count: weeklySales.length,
        total: weeklySales.reduce((acc, o) => acc + Number(o.total), 0),
      },
      monthly: {
        count: monthlySales.length,
        total: monthlySales.reduce((acc, o) => acc + Number(o.total), 0),
      },
    };
  };

  const togglePasswordVisibility = (id: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const togglePaymentExpanded = (id: string) => {
    setExpandedPayments(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const openPaymentDetails = (payment: BolsaUniformePayment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  // Extract password from notes field (stored as "Senha: XXXX")
  const getPasswordFromNotes = (notes: string | null): string => {
    if (!notes) return "****";
    const match = notes.match(/Senha:\s*(\d+)/);
    return match ? match[1] : "****";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2e3091] to-[#1a1c5a] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src={goiasMinasLogo} alt="Goiás Minas" className="h-12 w-auto" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Área Administrativa</h1>
            <p className="text-gray-500 mt-2">Goiás Minas Uniformes</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="Digite a senha"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2e3091] focus:ring-2 focus:ring-[#2e3091]/20"
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full bg-[#2e3091] text-white py-4 rounded-xl font-medium hover:bg-[#252a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { key: "pedidos" as Tab, label: "Pedidos", icon: ShoppingCart },
    { key: "bolsa-uniforme" as Tab, label: "Bolsa Uniforme", icon: CreditCard },
    { key: "produtos" as Tab, label: "Produtos", icon: Package },
    { key: "feedbacks" as Tab, label: "Feedbacks", icon: Star },
    { key: "financeiro" as Tab, label: "Financeiro", icon: DollarSign },
    { key: "clientes" as Tab, label: "Clientes", icon: Users },
  ];

  const financials = calculateFinancials();
  const pendingPayments = bolsaPayments.filter(p => p.status === "pending");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <img src={goiasMinasLogo} alt="Goiás Minas" className="h-10 w-auto" />
                <div>
                  <h2 className="font-semibold text-gray-900">Admin</h2>
                  <p className="text-xs text-gray-500">Goiás Minas</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeTab === tab.key
                      ? "bg-[#2e3091] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                  {tab.key === "bolsa-uniforme" && pendingPayments.length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {pendingPayments.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              {tabs.find(t => t.key === activeTab)?.label}
            </h1>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Pedidos Tab - Only Stripe orders */}
          {activeTab === "pedidos" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Pedidos Stripe
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Pagamentos via cartão/Pix/boleto
                  </p>
                </div>

                {orders.length === 0 ? (
                  <div className="p-12 text-center">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum pedido encontrado</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produtos</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagamento</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">{order.id.slice(0, 8)}...</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.created_at)}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{order.order_items?.length || 0} itens</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(Number(order.total))}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                order.status === "paid" ? "bg-green-100 text-green-700" :
                                order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                "bg-gray-100 text-gray-700"
                              }`}>
                                {order.status === "paid" ? "Pago" : order.status === "pending" ? "Pendente" : order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">{order.payment_method || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bolsa Uniforme Tab */}
          {activeTab === "bolsa-uniforme" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Pagamentos Bolsa Uniforme</h2>
                  <p className="text-sm text-gray-500 mt-1">Gerencie todos os pagamentos via Bolsa Uniforme</p>
                </div>

                {bolsaPayments.length === 0 ? (
                  <div className="p-12 text-center">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum pagamento Bolsa Uniforme</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {bolsaPayments.map((payment, index) => {
                      const isExpanded = expandedPayments[payment.id];
                      
                      return (
                        <div key={payment.id} className="transition-all">
                          {/* Header compacto - sempre visível */}
                          <div 
                            className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-gray-50"
                            onClick={() => togglePaymentExpanded(payment.id)}
                          >
                            <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                            
                            <div className="flex-1 flex items-center gap-4 min-w-0">
                              <span className="text-sm font-medium text-gray-900 truncate">
                                #{index + 1} - {payment.customer_name}
                              </span>
                              <span className="text-sm text-gray-500 hidden sm:inline">
                                {formatCurrency(Number(payment.total_amount))}
                              </span>
                            </div>
                            
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              payment.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                              payment.status === "approved" ? "bg-green-100 text-green-700" :
                              "bg-red-100 text-red-700"
                            }`}>
                              {payment.status === "pending" ? "Pendente" : payment.status === "approved" ? "Aprovado" : "Rejeitado"}
                            </span>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openPaymentDetails(payment);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#2e3091] text-white rounded-lg hover:bg-[#252a7a] transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Ver detalhes
                            </button>
                          </div>

                          {/* Conteúdo expandido */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 pt-1 bg-gray-50/50 border-t border-gray-100">
                                  <div className="flex items-start gap-4">
                                    {/* Info básica */}
                                    <div className="flex-1 space-y-2">
                                      <div className="flex items-center gap-2 text-sm">
                                        <span className="text-gray-500">Telefone:</span>
                                        <span className="text-gray-900">{payment.customer_phone}</span>
                                      </div>
                                      {payment.customer_email && (
                                        <div className="flex items-center gap-2 text-sm">
                                          <span className="text-gray-500">Email:</span>
                                          <span className="text-gray-900">{payment.customer_email}</span>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-2 text-sm">
                                        <span className="text-gray-500">Data:</span>
                                        <span className="text-gray-900">{formatDate(payment.created_at)}</span>
                                      </div>
                                      
                                      {/* Items */}
                                      <div className="flex flex-wrap gap-1.5 mt-2">
                                        {Array.isArray(payment.items) && payment.items.map((item: any, idx: number) => (
                                          <span key={idx} className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                                            {item.productName} - {item.size} (x{item.quantity})
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="mt-3 flex gap-2">
                                    <a
                                      href={formatWhatsAppLink(payment.customer_phone)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                      WhatsApp
                                    </a>
                                    {payment.status === "pending" && (
                                      <>
                                        <button
                                          onClick={() => updatePaymentStatus(payment.id, "approved")}
                                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#2e3091] text-white rounded-lg hover:bg-[#252a7a] transition-colors"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                          Aprovar
                                        </button>
                                        <button
                                          onClick={() => updatePaymentStatus(payment.id, "rejected")}
                                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                          <XCircle className="w-3.5 h-3.5" />
                                          Reprovar
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Produtos Tab */}
          {activeTab === "produtos" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Gerenciar Produtos</h2>
                  <p className="text-sm text-gray-500 mt-1">Edite preços, descrições e fotos</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#2e3091] text-white rounded-lg hover:bg-[#252a7a] transition-colors">
                  <Plus className="w-4 h-4" />
                  Adicionar Produto
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Em breve!</h3>
                <p className="text-gray-500">
                  A gestão de produtos será ativada em breve. Por enquanto, os produtos são gerenciados diretamente no código.
                </p>
              </div>
            </div>
          )}

          {/* Feedbacks Tab */}
          {activeTab === "feedbacks" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Feedbacks dos Clientes</h2>
                  <p className="text-sm text-gray-500 mt-1">Gerencie os feedbacks deixados pelos clientes</p>
                </div>

                {feedbacks.length === 0 ? (
                  <div className="p-12 text-center">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum feedback recebido</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {feedbacks.map((feedback) => (
                      <div key={feedback.id} className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h3 className="font-medium text-gray-900">{feedback.user_name}</h3>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < feedback.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-600 mt-2">{feedback.comment}</p>
                            <p className="text-xs text-gray-400 mt-2">{formatDate(feedback.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              Visível
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Financeiro Tab */}
          {activeTab === "financeiro" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-500">Hoje</span>
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(financials.daily.total)}</p>
                  <p className="text-sm text-gray-500 mt-1">{financials.daily.count} vendas</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-500">Esta Semana</span>
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(financials.weekly.total)}</p>
                  <p className="text-sm text-gray-500 mt-1">{financials.weekly.count} vendas</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-500">Este Mês</span>
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(financials.monthly.total)}</p>
                  <p className="text-sm text-gray-500 mt-1">{financials.monthly.count} vendas</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Histórico de Vendas</h2>
                </div>

                {orders.filter(o => o.status === "paid").length === 0 ? (
                  <div className="p-12 text-center">
                    <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma venda registrada</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frete</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {orders.filter(o => o.status === "paid").map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.created_at)}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">#{order.id.slice(0, 8)}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{formatCurrency(Number(order.subtotal))}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{formatCurrency(Number(order.shipping))}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(Number(order.total))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Clientes Tab */}
          {activeTab === "clientes" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Carrinhos Abandonados</h2>
                  <p className="text-sm text-gray-500 mt-1">Clientes que não finalizaram a compra</p>
                </div>

                {abandonedCarts.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum carrinho abandonado</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {abandonedCarts.map((cart) => (
                      <div key={cart.id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{cart.customer_name || "Cliente Anônimo"}</h3>
                            {cart.customer_email && <p className="text-sm text-gray-500">{cart.customer_email}</p>}
                            {cart.customer_phone && <p className="text-sm text-gray-500">{cart.customer_phone}</p>}
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{formatCurrency(Number(cart.total_amount))}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDate(cart.last_interaction)}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {Array.isArray(cart.items) && cart.items.map((item: any, idx: number) => (
                            <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {item.productName}
                            </span>
                          ))}
                        </div>

                        {cart.customer_phone && (
                          <div className="mt-4">
                            <a
                              href={formatWhatsAppLink(cart.customer_phone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                            >
                              <MessageCircle className="w-4 h-4" />
                              Contatar via WhatsApp
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {showImageModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute -top-12 right-0 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={selectedPayment.qr_code_image}
                alt="QR Code ampliado"
                className="w-full h-auto rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal - Como na imagem de referência */}
      <AnimatePresence>
        {showDetailsModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-[#2e3091] text-white">
                <h3 className="font-semibold">
                  Detalhes do Pedido #{bolsaPayments.findIndex(p => p.id === selectedPayment.id) + 1} - {selectedPayment.customer_name}
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-sm font-medium text-gray-700 mb-3">QR Code do Cliente</p>
                
                <div className="flex gap-6">
                  {/* QR Code grande */}
                  <div className="border border-gray-200 rounded-lg p-2 bg-white">
                    <img
                      src={selectedPayment.qr_code_image}
                      alt="QR Code"
                      className="w-48 h-48 object-contain"
                    />
                  </div>

                  {/* Informações ao lado */}
                  <div className="flex-1 space-y-4">
                    {/* Senha do Cartão */}
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Senha do Cartão:</p>
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-gray-400" />
                        <span className="font-mono font-medium text-lg">
                          {revealedPasswords[selectedPayment.id] ? getPasswordFromNotes(selectedPayment.notes) : "••••"}
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(selectedPayment.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {revealedPasswords[selectedPayment.id] ? 
                            <EyeOff className="w-4 h-4 text-gray-500" /> : 
                            <Eye className="w-4 h-4 text-gray-500" />
                          }
                        </button>
                      </div>
                    </div>

                    {/* Valor da Compra */}
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Valor da Compra:</p>
                      <p className="font-semibold text-lg text-gray-900">
                        {formatCurrency(Number(selectedPayment.total_amount))}
                      </p>
                    </div>

                    {/* Valor a Receber */}
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Valor a Receber:</p>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                        <p className="font-semibold text-lg text-gray-900">
                          {formatCurrency(Number(selectedPayment.total_amount))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

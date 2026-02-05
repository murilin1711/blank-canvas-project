import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  Package, 
  Users, 
  Menu, 
  X, 
  Check, 
  XCircle, 
  MessageCircle,
  RefreshCw,
  LogOut,
  CreditCard,
  Star,
  Eye,
  EyeOff,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import goiasMinasLogo from "@/assets/goias-minas-logo.png";

type Tab = "pedidos" | "bolsa-uniforme" | "feedbacks" | "clientes";

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
  password: string | null;
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

interface Feedback {
  id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  is_visible: boolean;
}

interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  created_at: string;
}

interface CustomerData {
  profile: Profile;
  ordersCount: number;
  totalSpent: number;
  cartItems: any[];
  lastActivity: string | null;
}

export default function CaixaPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("pedidos");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Loading states
  const [loadingBolsa, setLoadingBolsa] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Track loaded sections
  const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set());

  // Data states
  const [bolsaPayments, setBolsaPayments] = useState<BolsaUniformePayment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [customers, setCustomers] = useState<CustomerData[]>([]);

  // Modal states
  const [selectedPayment, setSelectedPayment] = useState<BolsaUniformePayment | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [expandedPayments, setExpandedPayments] = useState<Record<string, boolean>>({});
  const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({});

  // Check for existing session on mount
  useEffect(() => {
    const token = sessionStorage.getItem('caixa_token');
    const expiresAt = sessionStorage.getItem('caixa_expires_at');
    
    if (token && expiresAt) {
      const expiry = parseInt(expiresAt, 10);
      if (Date.now() < expiry) {
        setIsAuthenticated(true);
        loadData();
      } else {
        sessionStorage.removeItem('caixa_token');
        sessionStorage.removeItem('caixa_expires_at');
      }
    }
  }, []);

  const handleLogin = async () => {
    if (!password.trim()) {
      toast.error("Digite a senha");
      return;
    }

    setIsLoggingIn(true);
    
    try {
      const response = await supabase.functions.invoke('admin-auth', {
        body: { password, type: 'caixa' }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      sessionStorage.setItem('caixa_token', data.token);
      sessionStorage.setItem('caixa_expires_at', data.expiresAt.toString());
      
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
    sessionStorage.removeItem('caixa_token');
    sessionStorage.removeItem('caixa_expires_at');
    setIsAuthenticated(false);
    setPassword("");
  };

  const getToken = () => {
    return sessionStorage.getItem('caixa_token');
  };

  const loadSection = async (section: string) => {
    const token = getToken();
    if (!token) {
      handleLogout();
      return;
    }

    try {
      const response = await supabase.functions.invoke('admin-data', {
        body: { action: section, token }
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) {
        if (response.data.error.includes('Token')) {
          toast.error('Sessão expirada. Faça login novamente.');
          handleLogout();
        }
        throw new Error(response.data.error);
      }

      return response.data;
    } catch (error) {
      console.error(`Error loading ${section}:`, error);
      toast.error(`Erro ao carregar dados`);
      return null;
    }
  };

  const reloadSection = async (section: 'bolsa' | 'orders' | 'feedbacks' | 'customers', silent = false) => {
    const sectionMap = {
      bolsa: { action: 'get_bolsa_payments', setter: setBolsaPayments, key: 'bolsaPayments', loader: setLoadingBolsa },
      orders: { action: 'get_orders', setter: setOrders, key: 'orders', loader: setLoadingOrders },
      feedbacks: { action: 'get_feedbacks', setter: setFeedbacks, key: 'feedbacks', loader: setLoadingFeedbacks },
      customers: { action: 'get_customers', setter: setCustomers, key: 'customers', loader: setLoadingCustomers },
    };

    const config = sectionMap[section];
    config.loader(true);
    
    const token = getToken();
    if (!token) {
      config.loader(false);
      handleLogout();
      return;
    }

    try {
      const response = await supabase.functions.invoke('admin-data', {
        body: { action: config.action, token }
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) {
        if (response.data.error.includes('Token')) {
          toast.error('Sessão expirada. Faça login novamente.');
          handleLogout();
        }
        throw new Error(response.data.error);
      }

      config.setter(response.data[config.key] || []);
    } catch (error) {
      console.error(`Error loading ${config.action}:`, error);
      if (!silent) {
        toast.error(`Erro ao carregar dados`);
      }
    } finally {
      config.loader(false);
    }
  };

  const tabToSection: Record<Tab, 'bolsa' | 'orders' | 'feedbacks' | 'customers'> = {
    'pedidos': 'orders',
    'bolsa-uniforme': 'bolsa',
    'feedbacks': 'feedbacks',
    'clientes': 'customers',
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    
    const section = tabToSection[activeTab];
    
    if (!loadedSections.has(section)) {
      reloadSection(section);
      setLoadedSections(prev => new Set(prev).add(section));
    }
  }, [activeTab, isAuthenticated]);

  const loadData = async () => {
    setLoadedSections(new Set());
    const section = tabToSection[activeTab];
    await reloadSection(section);
    setLoadedSections(new Set([section]));
  };

  const isLoading = loadingBolsa || loadingOrders || loadingFeedbacks || loadingCustomers;

  const updatePaymentStatus = async (id: string, status: "approved" | "rejected") => {
    setBolsaPayments(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    
    try {
      const token = getToken();
      if (!token) {
        handleLogout();
        return;
      }

      const response = await supabase.functions.invoke('admin-data', {
        body: { 
          action: 'update_payment_status',
          token,
          data: { id, status }
        }
      });

      if (response.error || response.data?.error) {
        throw new Error(response.error?.message || response.data?.error);
      }
      
      toast.success(status === "approved" ? "Pagamento aprovado!" : "Pagamento rejeitado");
    } catch (error) {
      console.error("Error updating payment:", error);
      toast.error("Erro ao atualizar pagamento");
      reloadSection('bolsa');
    }
  };

  const toggleFeedbackVisibility = async (id: string, currentVisibility: boolean) => {
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, is_visible: !currentVisibility } : f));
    
    try {
      const token = getToken();
      if (!token) {
        handleLogout();
        return;
      }

      const response = await supabase.functions.invoke('admin-data', {
        body: { 
          action: 'toggle_feedback_visibility',
          token,
          data: { id, is_visible: !currentVisibility }
        }
      });

      if (response.error || response.data?.error) {
        throw new Error(response.error?.message || response.data?.error);
      }
      
      toast.success(currentVisibility ? "Feedback ocultado" : "Feedback visível");
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast.error("Erro ao alterar visibilidade");
      reloadSection('feedbacks');
    }
  };

  const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;
  
  const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const getWhatsAppLink = (phone: string, message: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <img src={goiasMinasLogo} alt="Logo" className="h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Painel do Caixa</h1>
            <p className="text-gray-500 mt-2">Digite a senha para acessar</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Senha do caixa"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#2e3091] focus:ring-2 focus:ring-[#2e3091]/20"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full bg-[#2e3091] text-white py-3 rounded-xl font-semibold hover:bg-[#252a7a] transition-colors disabled:opacity-50"
            >
              {isLoggingIn ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main Dashboard
  const tabs = [
    { id: "pedidos" as Tab, label: "Pedidos", icon: Package },
    { id: "bolsa-uniforme" as Tab, label: "Bolsa Uniforme", icon: CreditCard },
    { id: "feedbacks" as Tab, label: "Feedbacks", icon: Star },
    { id: "clientes" as Tab, label: "Clientes", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 bg-white shadow-xl transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 md:w-20'} overflow-hidden`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <img 
              src={goiasMinasLogo} 
              alt="Logo" 
              className={`h-10 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 md:opacity-100 md:h-8'}`} 
            />
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#2e3091] text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5 flex-shrink-0" />
                <span className={`font-medium ${sidebarOpen ? 'block' : 'hidden md:hidden'}`}>
                  {tab.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className={`font-medium ${sidebarOpen ? 'block' : 'hidden md:hidden'}`}>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0 md:ml-20'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900 capitalize">
                {tabs.find(t => t.id === activeTab)?.label}
              </h1>
            </div>

            <button
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-[#2e3091] hover:bg-[#2e3091]/10 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Pedidos Tab */}
          {activeTab === "pedidos" && (
            <div className="space-y-4">
              {loadingOrders ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#2e3091]" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Nenhum pedido encontrado
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">#{order.id.slice(0, 8)}</p>
                        <p className="font-semibold text-lg">{formatCurrency(order.total)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                    
                    {order.order_items && order.order_items.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                        {order.order_items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 text-sm">
                            <img src={item.product_image} alt={item.product_name} className="w-10 h-10 object-cover rounded" />
                            <div className="flex-1">
                              <p className="font-medium">{item.product_name}</p>
                              <p className="text-gray-500">Tam: {item.size} • Qtd: {item.quantity}</p>
                            </div>
                            <p className="font-medium">{formatCurrency(item.price)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Bolsa Uniforme Tab */}
          {activeTab === "bolsa-uniforme" && (
            <div className="space-y-4">
              {loadingBolsa ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#2e3091]" />
                </div>
              ) : bolsaPayments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Nenhum pagamento Bolsa Uniforme
                </div>
              ) : (
                bolsaPayments.map((payment) => (
                  <div key={payment.id} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{payment.customer_name}</h3>
                        <p className="text-sm text-gray-500">{payment.customer_phone}</p>
                        <p className="font-bold text-[#2e3091] mt-2">{formatCurrency(payment.total_amount)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'approved' ? 'bg-green-100 text-green-700' :
                        payment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {payment.status === 'approved' ? 'Aprovado' : 
                         payment.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                      </span>
                    </div>

                    {/* QR Code */}
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowImageModal(true);
                        }}
                        className="text-[#2e3091] underline text-sm"
                      >
                        Ver QR Code
                      </button>
                    </div>

                    {/* Password */}
                    {payment.password && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-sm text-gray-500">Senha:</span>
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {revealedPasswords[payment.id] ? payment.password : '••••••'}
                        </span>
                        <button
                          onClick={() => setRevealedPasswords(prev => ({
                            ...prev,
                            [payment.id]: !prev[payment.id]
                          }))}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {revealedPasswords[payment.id] ? 
                            <EyeOff className="w-4 h-4" /> : 
                            <Eye className="w-4 h-4" />
                          }
                        </button>
                      </div>
                    )}

                    {/* Actions */}
                    {payment.status === 'pending' && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => updatePaymentStatus(payment.id, 'approved')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          Aprovar
                        </button>
                        <button
                          onClick={() => updatePaymentStatus(payment.id, 'rejected')}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Rejeitar
                        </button>
                      </div>
                    )}

                    <p className="text-xs text-gray-400 mt-4">{formatDate(payment.created_at)}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Feedbacks Tab */}
          {activeTab === "feedbacks" && (
            <div className="space-y-4">
              {loadingFeedbacks ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#2e3091]" />
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Nenhum feedback encontrado
                </div>
              ) : (
                feedbacks.map((feedback) => (
                  <div key={feedback.id} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{feedback.user_name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleFeedbackVisibility(feedback.id, feedback.is_visible)}
                        className={`p-2 rounded-lg transition-colors ${
                          feedback.is_visible ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {feedback.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-gray-600 mt-3">{feedback.comment}</p>
                    <p className="text-xs text-gray-400 mt-4">{formatDate(feedback.created_at)}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Clientes Tab */}
          {activeTab === "clientes" && (
            <div className="space-y-4">
              {loadingCustomers ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#2e3091]" />
                </div>
              ) : customers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Nenhum cliente encontrado
                </div>
              ) : (
                customers.map((customer) => (
                  <div key={customer.profile.id} className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{customer.profile.name}</h3>
                        <p className="text-sm text-gray-500">{customer.profile.email}</p>
                        {customer.profile.phone && (
                          <a
                            href={getWhatsAppLink(customer.profile.phone, `Olá ${customer.profile.name}!`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-green-600 text-sm mt-1 hover:underline"
                          >
                            <MessageCircle className="w-3 h-3" />
                            {customer.profile.phone}
                          </a>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#2e3091]">{formatCurrency(customer.totalSpent)}</p>
                        <p className="text-xs text-gray-500">{customer.ordersCount} pedidos</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showImageModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-4 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPayment.qr_code_image}
                alt="QR Code"
                className="w-full rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

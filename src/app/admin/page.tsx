import React, { useState, useEffect } from "react";
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
  RefreshCw,
  LogOut,
  CreditCard,
  Star,
  Eye,
  EyeOff,
  Lock,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Save
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
  is_visible: boolean;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  school_slug: string;
  category: string | null;
  sizes: string[] | null;
  is_active: boolean;
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
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<CustomerData[]>([]);

  // Modal states
  const [selectedPayment, setSelectedPayment] = useState<BolsaUniformePayment | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [expandedPayments, setExpandedPayments] = useState<Record<string, boolean>>({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Product edit states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    description: "",
    image_url: "",
    category: "",
    sizes: [] as string[],
    is_active: true
  });

  // Produtos - aba por escola
  const schoolSlugs = [...new Set(products.map(p => p.school_slug))];
  const [activeSchool, setActiveSchool] = useState("colegio-militar");

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

      // Load products
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });
      
      if (productsData) setProducts(productsData as Product[]);

      // Load customers (profiles)
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesData) {
        // For each profile, get their order count and cart items
        const customersWithData: CustomerData[] = await Promise.all(
          profilesData.map(async (profile: Profile) => {
            // Get orders count and total
            const { data: userOrders } = await supabase
              .from("orders")
              .select("total, created_at")
              .eq("user_id", profile.user_id);
            
            const ordersCount = userOrders?.length || 0;
            const totalSpent = userOrders?.reduce((sum, o) => sum + Number(o.total), 0) || 0;
            const lastOrder = userOrders?.sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];

            // Get cart items
            const { data: cartData } = await supabase
              .from("cart_items")
              .select("*")
              .eq("user_id", profile.user_id);

            return {
              profile,
              ordersCount,
              totalSpent,
              cartItems: cartData || [],
              lastActivity: lastOrder?.created_at || profile.created_at
            };
          })
        );
        setCustomers(customersWithData);
      }

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

  const toggleFeedbackVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from("feedbacks")
        .update({ is_visible: !currentVisibility })
        .eq("id", id);

      if (error) throw error;
      
      toast.success(!currentVisibility ? "Feedback visível no site!" : "Feedback ocultado");
      loadData();
    } catch (error) {
      console.error("Error updating feedback:", error);
      toast.error("Erro ao atualizar feedback");
    }
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      description: product.description || "",
      image_url: product.image_url || "",
      category: product.category || "",
      sizes: product.sizes || [],
      is_active: product.is_active
    });
    setShowProductModal(true);
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      price: "",
      description: "",
      image_url: "",
      category: "",
      sizes: ["P", "M", "G", "GG"],
      is_active: true
    });
    setShowProductModal(true);
  };

  const saveProduct = async () => {
    if (!productForm.name || !productForm.price) {
      toast.error("Preencha nome e preço");
      return;
    }

    try {
      const productData = {
        name: productForm.name,
        price: parseFloat(productForm.price),
        description: productForm.description || null,
        image_url: productForm.image_url || null,
        category: productForm.category || null,
        sizes: productForm.sizes,
        is_active: productForm.is_active,
        school_slug: "colegio-militar"
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);
        
        if (error) throw error;
        toast.success("Produto atualizado!");
      } else {
        const { error } = await supabase
          .from("products")
          .insert(productData);
        
        if (error) throw error;
        toast.success("Produto criado!");
      }

      setShowProductModal(false);
      loadData();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Erro ao salvar produto");
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Produto excluído!");
      loadData();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Erro ao excluir produto");
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
          {/* Pedidos Tab */}
          {activeTab === "pedidos" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Pedidos Stripe</h2>
                  <p className="text-sm text-gray-500 mt-1">Pagamentos via cartão/Pix/boleto</p>
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
                                      
                                      <div className="flex flex-wrap gap-1.5 mt-2">
                                        {Array.isArray(payment.items) && payment.items.map((item: any, idx: number) => (
                                          <span key={idx} className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                                            {item.productName} - {item.size} (x{item.quantity})
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

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
                  <p className="text-sm text-gray-500 mt-1">Edite preços, descrições e fotos por escola</p>
                </div>
                <button 
                  onClick={openNewProduct}
                  className="flex items-center gap-2 px-4 py-2 bg-[#2e3091] text-white rounded-lg hover:bg-[#252a7a] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Produto
                </button>
              </div>

              {/* Abas por escola */}
              {(() => {
                const filteredProducts = products.filter(p => p.school_slug === activeSchool);
                
                const schoolNames: Record<string, string> = {
                  "colegio-militar": "Colégio Militar"
                };
                
                return (
                  <>
                    {/* Abas de escolas */}
                    {schoolSlugs.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {schoolSlugs.map((slug) => (
                          <button
                            key={slug}
                            onClick={() => setActiveSchool(slug)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                              activeSchool === slug 
                                ? "bg-[#2e3091] text-white" 
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {schoolNames[slug] || slug}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                      {filteredProducts.length === 0 ? (
                        <div className="p-12 text-center">
                          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">Nenhum produto cadastrado nesta escola</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      {product.image_url && (
                                        <img 
                                          src={product.image_url} 
                                          alt={product.name}
                                          className="w-10 h-10 object-cover rounded"
                                        />
                                      )}
                                      <span className="text-sm font-medium text-gray-900">{product.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(product.price)}</td>
                                  <td className="px-6 py-4 text-sm text-gray-500">{product.category || "-"}</td>
                                  <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      product.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                                    }`}>
                                      {product.is_active ? "Ativo" : "Inativo"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => openEditProduct(product)}
                                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => deleteProduct(product.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Feedbacks Tab */}
          {activeTab === "feedbacks" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Feedbacks dos Clientes</h2>
                  <p className="text-sm text-gray-500 mt-1">Selecione quais feedbacks aparecem no site</p>
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
                          <button
                            onClick={() => toggleFeedbackVisibility(feedback.id, feedback.is_visible)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                              feedback.is_visible 
                                ? "bg-green-100 text-green-700 hover:bg-green-200" 
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {feedback.is_visible ? (
                              <>
                                <Eye className="w-4 h-4" />
                                Visível
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-4 h-4" />
                                Oculto
                              </>
                            )}
                          </button>
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
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {orders.filter(o => o.status === "paid").map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.created_at)}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">#{order.id.slice(0, 8)}</td>
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
                  <h2 className="text-lg font-semibold text-gray-900">Clientes Cadastrados</h2>
                  <p className="text-sm text-gray-500 mt-1">Todas as pessoas que criaram conta no site</p>
                </div>

                {customers.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum cliente cadastrado</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {customers.map((customer) => (
                      <div key={customer.profile.id} className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{customer.profile.name}</h3>
                            <p className="text-sm text-gray-500">{customer.profile.email}</p>
                            {customer.profile.phone && (
                              <p className="text-sm text-gray-500">{customer.profile.phone}</p>
                            )}
                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-1.5 text-sm">
                                <ShoppingCart className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">{customer.ordersCount} compras</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-sm">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">{formatCurrency(customer.totalSpent)} gastos</span>
                              </div>
                            </div>
                            
                            {/* Cart items */}
                            {customer.cartItems.length > 0 && (
                              <div className="mt-3">
                                <p className="text-xs text-gray-500 mb-1">Itens no carrinho:</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {customer.cartItems.map((item: any) => (
                                    <span key={item.id} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                      {item.product_name} ({item.size})
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <p className="text-xs text-gray-400 mt-3">
                              Cadastro: {formatDate(customer.profile.created_at)}
                            </p>
                          </div>

                          {customer.profile.phone && (
                            <a
                              href={formatWhatsAppLink(customer.profile.phone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                            >
                              <MessageCircle className="w-4 h-4" />
                              WhatsApp
                            </a>
                          )}
                        </div>
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

      {/* Product Edit Modal */}
      <AnimatePresence>
        {showProductModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setShowProductModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 bg-[#2e3091] text-white">
                <h3 className="font-semibold">
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome*</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2e3091]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço*</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2e3091]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2e3091]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                  <input
                    type="text"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({...productForm, image_url: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2e3091]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2e3091]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={productForm.is_active}
                    onChange={(e) => setProductForm({...productForm, is_active: e.target.checked})}
                    className="w-4 h-4 text-[#2e3091] rounded"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">Produto ativo</label>
                </div>

                <button
                  onClick={saveProduct}
                  className="w-full flex items-center justify-center gap-2 bg-[#2e3091] text-white py-3 rounded-lg hover:bg-[#252a7a] transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Salvar Produto
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Details Modal */}
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

              <div className="p-6">
                <p className="text-sm font-medium text-gray-700 mb-3">QR Code do Cliente</p>
                
                <div className="flex gap-6">
                  <div className="border border-gray-200 rounded-lg p-2 bg-white">
                    <img
                      src={selectedPayment.qr_code_image}
                      alt="QR Code"
                      className="w-48 h-48 object-contain"
                    />
                  </div>

                  <div className="flex-1 space-y-4">
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

                    <div>
                      <p className="text-sm text-gray-500 mb-1">Valor da Compra:</p>
                      <p className="font-semibold text-lg text-gray-900">
                        {formatCurrency(Number(selectedPayment.total_amount))}
                      </p>
                    </div>

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

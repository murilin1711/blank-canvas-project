import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  ChevronLeft,
  ChevronUp,
  Edit,
  Trash2,
  Save,
  Activity,
  Clock,
  Image,
  GripVertical
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import goiasMinasLogo from "@/assets/goias-minas-logo.png";
import ProductFormModal from "@/components/admin/ProductFormModal";
import CategoryFilter from "@/components/admin/CategoryFilter";
import CategoryManager from "@/components/admin/CategoryManager";

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
  images: string[] | null;
  school_slug: string;
  category: string | null;
  sizes: string[] | null;
  variations: any[] | null;
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

interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  metadata: any;
  created_at: string;
}

interface CustomerData {
  profile: Profile;
  ordersCount: number;
  totalSpent: number;
  cartItems: any[];
  lastActivity: string | null;
  recentActivities: UserActivity[];
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("pedidos");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Section loading states
  const [loadingBolsa, setLoadingBolsa] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Track which sections have been loaded (for on-demand loading)
  const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set());

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
  const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({});

  // Product edit states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Feedback edit states
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    user_name: "",
    rating: 5,
    comment: ""
  });

  // Produtos - aba por escola
  const schoolSlugs = [...new Set(products.map(p => p.school_slug))];
  const [activeSchool, setActiveSchool] = useState("colegio-militar");

  // Drag-and-drop states for product reordering
  const [draggedProductId, setDraggedProductId] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  // Category filters for orders and bolsa
  const [ordersSelectedCategories, setOrdersSelectedCategories] = useState<string[]>([]);
  const [bolsaSelectedCategories, setBolsaSelectedCategories] = useState<string[]>([]);

  // Get unique categories from products
  const availableCategories = [...new Set(products.filter(p => p.category).map(p => p.category!))].sort();

  // Check if user is admin on mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (authLoading) return;
      
      if (!user) {
        setCheckingAdmin(false);
        // Check for session-based auth (password login)
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
        return;
      }

      try {
        // Check if user has admin role
        const { data: roleData, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (roleData) {
          setIsAdmin(true);
          setIsAuthenticated(true);
          loadData();
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user, authLoading]);

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
    setIsAdmin(false);
    setPassword("");
  };

  const getAdminToken = () => {
    return sessionStorage.getItem('admin_token');
  };

  // Load section data separately
  const loadSection = async (section: string) => {
    const token = getAdminToken();
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
        if (response.data.error.includes('Token')) handleLogout();
        throw new Error(response.data.error);
      }

      return response.data;
    } catch (error) {
      console.error(`Error loading ${section}:`, error);
      toast.error(`Erro ao carregar ${section}`);
      return null;
    }
  };

  // Reload specific section only (for optimistic updates)
  const reloadSection = async (section: 'bolsa' | 'orders' | 'products' | 'feedbacks' | 'customers') => {
    const sectionMap = {
      bolsa: { action: 'get_bolsa_payments', setter: setBolsaPayments, key: 'bolsaPayments', loader: setLoadingBolsa },
      orders: { action: 'get_orders', setter: setOrders, key: 'orders', loader: setLoadingOrders },
      products: { action: 'get_products', setter: setProducts, key: 'products', loader: setLoadingProducts },
      feedbacks: { action: 'get_feedbacks', setter: setFeedbacks, key: 'feedbacks', loader: setLoadingFeedbacks },
      customers: { action: 'get_customers', setter: setCustomers, key: 'customers', loader: setLoadingCustomers },
    };

    const config = sectionMap[section];
    config.loader(true);
    const data = await loadSection(config.action);
    config.loader(false);
    if (data) config.setter(data[config.key] || []);
  };

  // Map tab to section key
  const tabToSection: Record<Tab, 'bolsa' | 'orders' | 'products' | 'feedbacks' | 'customers' | null> = {
    'pedidos': 'orders',
    'bolsa-uniforme': 'bolsa',
    'produtos': 'products',
    'feedbacks': 'feedbacks',
    'financeiro': 'orders', // Financeiro uses orders data
    'clientes': 'customers',
  };

  // Load section on demand when tab changes
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const section = tabToSection[activeTab];
    if (!section) return;
    
    // Don't reload if already loaded
    if (!loadedSections.has(section)) {
      reloadSection(section);
      setLoadedSections(prev => new Set(prev).add(section));
    }

    // Also load products when on orders/bolsa tabs for category filtering
    if ((activeTab === 'pedidos' || activeTab === 'bolsa-uniforme') && !loadedSections.has('products')) {
      reloadSection('products');
      setLoadedSections(prev => new Set(prev).add('products'));
    }
  }, [activeTab, isAuthenticated]);

  // Initial load - only load the default tab (pedidos)
  const loadData = async () => {
    // Reset loaded sections
    setLoadedSections(new Set());
    
    // Only load the current active section
    const section = tabToSection[activeTab];
    if (section) {
      await reloadSection(section);
      setLoadedSections(new Set([section]));
    }
  };

  const isLoading = loadingBolsa || loadingOrders || loadingProducts || loadingFeedbacks || loadingCustomers;

  const updatePaymentStatus = async (id: string, status: "approved" | "rejected") => {
    // Optimistic update
    setBolsaPayments(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    
    try {
      const token = getAdminToken();
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
      reloadSection('bolsa'); // Restore on error
    }
  };

  const toggleFeedbackVisibility = async (id: string, currentVisibility: boolean) => {
    // Optimistic update
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, is_visible: !currentVisibility } : f));
    
    try {
      const token = getAdminToken();
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
      
      toast.success(!currentVisibility ? "Feedback visível no site!" : "Feedback ocultado");
    } catch (error) {
      console.error("Error updating feedback:", error);
      toast.error("Erro ao atualizar feedback");
      reloadSection('feedbacks'); // Restore on error
    }
  };

  const openEditFeedback = (feedback: Feedback) => {
    setEditingFeedback(feedback);
    setFeedbackForm({
      user_name: feedback.user_name,
      rating: feedback.rating,
      comment: feedback.comment
    });
    setShowFeedbackModal(true);
  };

  const openNewFeedback = () => {
    setEditingFeedback(null);
    setFeedbackForm({
      user_name: "",
      rating: 5,
      comment: ""
    });
    setShowFeedbackModal(true);
  };

  const saveFeedback = async () => {
    if (!feedbackForm.user_name || !feedbackForm.comment) {
      toast.error("Preencha nome e comentário");
      return;
    }

    const tempId = editingFeedback?.id || `temp-${Date.now()}`;
    const newFeedback: Feedback = {
      id: tempId,
      user_id: editingFeedback?.user_id || '00000000-0000-0000-0000-000000000000',
      user_name: feedbackForm.user_name,
      rating: feedbackForm.rating,
      comment: feedbackForm.comment,
      created_at: editingFeedback?.created_at || new Date().toISOString(),
      is_visible: editingFeedback?.is_visible ?? true
    };

    // Optimistic update
    if (editingFeedback) {
      setFeedbacks(prev => prev.map(f => f.id === editingFeedback.id ? newFeedback : f));
    } else {
      setFeedbacks(prev => [newFeedback, ...prev]);
    }
    setShowFeedbackModal(false);

    try {
      const token = getAdminToken();
      if (!token) {
        handleLogout();
        return;
      }

      const action = editingFeedback ? 'update_feedback' : 'create_feedback';
      const feedbackData = editingFeedback 
        ? { id: editingFeedback.id, ...feedbackForm }
        : feedbackForm;

      const response = await supabase.functions.invoke('admin-data', {
        body: { 
          action,
          token,
          data: feedbackData
        }
      });

      if (response.error || response.data?.error) {
        throw new Error(response.error?.message || response.data?.error);
      }

      toast.success(editingFeedback ? "Feedback atualizado!" : "Feedback criado!");
      // Reload to get the real ID for new feedbacks
      if (!editingFeedback) reloadSection('feedbacks');
    } catch (error) {
      console.error("Error saving feedback:", error);
      toast.error("Erro ao salvar feedback");
      reloadSection('feedbacks'); // Restore on error
    }
  };

  const deleteFeedback = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este feedback?")) return;

    // Optimistic update
    const previousFeedbacks = feedbacks;
    setFeedbacks(prev => prev.filter(f => f.id !== id));

    try {
      const token = getAdminToken();
      if (!token) {
        handleLogout();
        return;
      }

      const response = await supabase.functions.invoke('admin-data', {
        body: { 
          action: 'delete_feedback',
          token,
          data: { id }
        }
      });

      if (response.error || response.data?.error) {
        throw new Error(response.error?.message || response.data?.error);
      }

      toast.success("Feedback excluído!");
    } catch (error) {
      console.error("Error deleting feedback:", error);
      toast.error("Erro ao excluir feedback");
      setFeedbacks(previousFeedbacks); // Restore on error
    }
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (productData: any, isNew: boolean) => {
    // Close modal immediately for better UX
    setShowProductModal(false);
    
    // Optimistic update
    if (isNew) {
      const tempProduct = { ...productData, id: Date.now() };
      setProducts(prev => [...prev, tempProduct]);
    } else {
      setProducts(prev => prev.map(p => p.id === productData.id ? { ...p, ...productData } : p));
    }

    try {
      const token = getAdminToken();
      if (!token) {
        handleLogout();
        return;
      }

      const response = await supabase.functions.invoke('admin-data', {
        body: { 
          action: 'save_product',
          token,
          data: { 
            product: productData,
            isNew
          }
        }
      });

      if (response.error || response.data?.error) {
        throw new Error(response.error?.message || response.data?.error);
      }

      toast.success(isNew ? "Produto criado!" : "Produto atualizado!");
      // Reload to get the real ID for new products
      if (isNew) reloadSection('products');
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Erro ao salvar produto");
      reloadSection('products'); // Restore on error
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    // Optimistic update
    const previousProducts = products;
    setProducts(prev => prev.filter(p => p.id !== id));

    try {
      const token = getAdminToken();
      if (!token) {
        handleLogout();
        return;
      }

      const response = await supabase.functions.invoke('admin-data', {
        body: { 
          action: 'delete_product',
          token,
          data: { id }
        }
      });

      if (response.error || response.data?.error) {
        throw new Error(response.error?.message || response.data?.error);
      }

      toast.success("Produto excluído!");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Erro ao excluir produto");
      setProducts(previousProducts); // Restore on error
    }
  };

  // Drag-and-drop handlers for product reordering
  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, productId: number) => {
    setDraggedProductId(productId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', productId.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = () => {
    setDraggedProductId(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, targetProductId: number) => {
    e.preventDefault();
    if (draggedProductId === null || draggedProductId === targetProductId) {
      setDraggedProductId(null);
      return;
    }

    const schoolProducts = products.filter(p => p.school_slug === activeSchool);
    const currentOrder = schoolProducts.map(p => p.id);
    
    const draggedIndex = currentOrder.indexOf(draggedProductId);
    const targetIndex = currentOrder.indexOf(targetProductId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedProductId(null);
      return;
    }

    // Reorder locally for INSTANT UI feedback
    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedProductId);

    // Update local products state IMMEDIATELY (no waiting)
    const reorderedProducts = products.map(p => {
      if (p.school_slug !== activeSchool) return p;
      const newIndex = newOrder.indexOf(p.id);
      return { ...p, display_order: newIndex + 1 };
    });
    setProducts(reorderedProducts);
    setDraggedProductId(null);

    // Save to database in background (fire-and-forget with error handling)
    const saveToDatabase = async () => {
      try {
        const token = getAdminToken();
        if (!token) return;

        const response = await supabase.functions.invoke('admin-data', {
          body: { 
            action: 'reorder_products',
            token,
            data: { productIds: newOrder, schoolSlug: activeSchool }
          }
        });

        if (response.error || response.data?.error) {
          throw new Error(response.error?.message || response.data?.error);
        }
      } catch (error) {
        console.error("Error reordering products:", error);
        toast.error("Erro ao salvar ordem. Recarregando...");
        reloadSection('products');
      }
    };
    
    saveToDatabase();
  };

  // Category management functions
  const handleAddCategory = async (category: string) => {
    // Categories are stored in products, so we just need to use them
    // For now, we'll allow any new category typed in the product form
    toast.success(`Categoria "${category}" adicionada!`);
  };

  const handleEditCategory = async (oldCategory: string, newCategory: string) => {
    // Update all products with the old category to the new one
    const productsToUpdate = products.filter(p => p.category === oldCategory);
    if (productsToUpdate.length === 0) return;

    // Optimistic update
    setProducts(prev => prev.map(p => 
      p.category === oldCategory ? { ...p, category: newCategory } : p
    ));

    try {
      const token = getAdminToken();
      if (!token) {
        handleLogout();
        return;
      }

      const response = await supabase.functions.invoke('admin-data', {
        body: { 
          action: 'update_category',
          token,
          data: { oldCategory, newCategory }
        }
      });

      if (response.error || response.data?.error) {
        throw new Error(response.error?.message || response.data?.error);
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Erro ao atualizar categoria");
      reloadSection('products');
    }
  };

  const handleDeleteCategory = async (category: string) => {
    // Set category to null for all products with this category
    setProducts(prev => prev.map(p => 
      p.category === category ? { ...p, category: null } : p
    ));

    try {
      const token = getAdminToken();
      if (!token) {
        handleLogout();
        return;
      }

      const response = await supabase.functions.invoke('admin-data', {
        body: { 
          action: 'delete_category',
          token,
          data: { category }
        }
      });

      if (response.error || response.data?.error) {
        throw new Error(response.error?.message || response.data?.error);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Erro ao excluir categoria");
      reloadSection('products');
    }
  };

  // Filter orders by category
  const filterOrdersByCategory = (ordersList: Order[], selectedCategories: string[]) => {
    if (selectedCategories.length === 0) return ordersList;
    
    return ordersList.filter(order => {
      const orderItems = order.order_items || [];
      // Check if any item in the order matches the selected categories
      return orderItems.some(item => {
        // Find the product to get its category
        const product = products.find(p => p.name === item.product_name);
        return product && product.category && selectedCategories.includes(product.category);
      });
    });
  };

  // Filter bolsa payments by category
  const filterBolsaByCategory = (paymentsList: BolsaUniformePayment[], selectedCategories: string[]) => {
    if (selectedCategories.length === 0) return paymentsList;
    
    return paymentsList.filter(payment => {
      const items = Array.isArray(payment.items) ? payment.items : [];
      // Check if any item in the payment matches the selected categories
      return items.some((item: any) => {
        const product = products.find(p => p.name === item.productName);
        return product && product.category && selectedCategories.includes(product.category);
      });
    });
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

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora mesmo";
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays < 7) return `Há ${diffDays} dias`;
    return formatDate(dateString);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'add_to_cart': return ShoppingCart;
      case 'checkout_started': return CreditCard;
      case 'checkout_completed': return Check;
      case 'added_favorite': return Star;
      default: return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'add_to_cart': return "bg-blue-100 text-blue-600";
      case 'checkout_started': return "bg-yellow-100 text-yellow-600";
      case 'checkout_completed': return "bg-green-100 text-green-600";
      case 'added_favorite': return "bg-pink-100 text-pink-600";
      default: return "bg-gray-100 text-gray-600";
    }
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

  const toggleCustomerExpanded = (id: string) => {
    setExpandedCustomers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const openPaymentDetails = (payment: BolsaUniformePayment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const getPassword = (payment: BolsaUniformePayment): string => {
    // First check the password field
    if (payment.password) return payment.password;
    // Fallback to notes for old records
    if (payment.notes) {
      const match = payment.notes.match(/Senha:\s*(\d+)/);
      return match ? match[1] : "****";
    }
    return "****";
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2e3091] to-[#1a1c5a] flex items-center justify-center p-4">
        <div className="text-white text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Verificando acesso...</p>
        </div>
      </div>
    );
  }

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

  const schoolNames: Record<string, string> = {
    "colegio-militar": "Colégio Militar"
  };

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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={goiasMinasLogo} alt="Goiás Minas" className="h-10 w-auto" />
                  <div>
                    <h2 className="font-semibold text-gray-900">Admin</h2>
                    <p className="text-xs text-gray-500">Goiás Minas</p>
                  </div>
                </div>
                {/* Close button for mobile */}
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Fechar menu"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-500" />
                </button>
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
            onClick={() => {
              const section = tabToSection[activeTab];
              if (section) reloadSection(section);
            }}
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
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Pedidos Stripe</h2>
                      <p className="text-sm text-gray-500 mt-1">Pagamentos via cartão/Pix/boleto</p>
                    </div>
                    <CategoryFilter
                      categories={availableCategories}
                      selectedCategories={ordersSelectedCategories}
                      onChange={setOrdersSelectedCategories}
                      label="Filtrar por categoria"
                    />
                  </div>
                </div>

                {filterOrdersByCategory(orders, ordersSelectedCategories).length === 0 ? (
                  <div className="p-12 text-center">
                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {ordersSelectedCategories.length > 0 
                        ? "Nenhum pedido encontrado para as categorias selecionadas" 
                        : "Nenhum pedido encontrado"}
                    </p>
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
                        {filterOrdersByCategory(orders, ordersSelectedCategories).map((order) => (
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
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Pagamentos Bolsa Uniforme</h2>
                      <p className="text-sm text-gray-500 mt-1">Gerencie todos os pagamentos via Bolsa Uniforme</p>
                    </div>
                    <CategoryFilter
                      categories={availableCategories}
                      selectedCategories={bolsaSelectedCategories}
                      onChange={setBolsaSelectedCategories}
                      label="Filtrar por categoria"
                    />
                  </div>
                </div>

                {filterBolsaByCategory(bolsaPayments, bolsaSelectedCategories).length === 0 ? (
                  <div className="p-12 text-center">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {bolsaSelectedCategories.length > 0 
                        ? "Nenhum pagamento encontrado para as categorias selecionadas" 
                        : "Nenhum pagamento Bolsa Uniforme"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filterBolsaByCategory(bolsaPayments, bolsaSelectedCategories)
                      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                      .map((payment, index) => {
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
                            
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3.5 h-3.5" />
                              {formatTime(payment.created_at)}
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
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Gerenciar Produtos</h2>
                  <p className="text-sm text-gray-500 mt-1">Edite preços, descrições e fotos por escola</p>
                </div>
                <div className="flex items-center gap-2">
                  <CategoryManager
                    categories={availableCategories}
                    onAddCategory={handleAddCategory}
                    onEditCategory={handleEditCategory}
                    onDeleteCategory={handleDeleteCategory}
                  />
                  <button 
                    onClick={openNewProduct}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2e3091] text-white rounded-lg hover:bg-[#252a7a] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Produto
                  </button>
                </div>
              </div>

              {/* Abas por escola */}
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
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs text-gray-500">
                    <GripVertical className="w-3 h-3 inline mr-1" />
                    Arraste para reordenar • Salva automaticamente
                  </p>
                </div>
                {products.filter(p => p.school_slug === activeSchool).length === 0 ? (
                  <div className="p-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum produto cadastrado nesta escola</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="w-16 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">#</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {products
                          .filter(p => p.school_slug === activeSchool)
                          .sort((a, b) => ((a as any).display_order || 0) - ((b as any).display_order || 0))
                          .map((product, index) => (
                          <motion.tr 
                            key={product.id}
                            layout
                            initial={false}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className={`hover:bg-gray-50 ${
                              draggedProductId === product.id ? 'opacity-50 bg-blue-50' : ''
                            }`}
                            draggable
                            onDragStart={(e) => handleDragStart(e as any, product.id)}
                            onDragOver={handleDragOver as any}
                            onDragEnd={handleDragEnd}
                            onDrop={(e) => handleDrop(e as any, product.id)}
                          >
                            <td className="w-16 px-2 py-4">
                              <div 
                                className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing p-1.5 rounded hover:bg-gray-200 transition-colors"
                                title="Arraste para reordenar"
                              >
                                <GripVertical className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-bold text-[#2e3091] min-w-[20px] text-center">{index + 1}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {(product.images && product.images.length > 0) ? (
                                  <div className="relative">
                                    <img 
                                      src={product.images[0]} 
                                      alt={product.name}
                                      className="w-10 h-10 object-cover rounded"
                                    />
                                    {product.images.length > 1 && (
                                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#2e3091] text-white text-[10px] rounded-full flex items-center justify-center">
                                        {product.images.length}
                                      </span>
                                    )}
                                  </div>
                                ) : product.image_url ? (
                                  <img 
                                    src={product.image_url} 
                                    alt={product.name}
                                    className="w-10 h-10 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                    <Image className="w-5 h-5 text-gray-400" />
                                  </div>
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
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Feedbacks Tab */}
          {activeTab === "feedbacks" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Feedbacks dos Clientes</h2>
                    <p className="text-sm text-gray-500 mt-1">Gerencie os feedbacks que aparecem no site</p>
                  </div>
                  <button
                    onClick={openNewFeedback}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2e3091] text-white rounded-lg text-sm font-medium hover:bg-[#252a7a] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Feedback
                  </button>
                </div>

                {feedbacks.length === 0 ? (
                  <div className="p-12 text-center">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum feedback recebido</p>
                    <button
                      onClick={openNewFeedback}
                      className="mt-4 px-4 py-2 bg-[#2e3091] text-white rounded-lg text-sm font-medium hover:bg-[#252a7a] transition-colors"
                    >
                      Criar primeiro feedback
                    </button>
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
                              onClick={() => openEditFeedback(feedback)}
                              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteFeedback(feedback.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
                  <p className="text-sm text-gray-500 mt-1">Veja perfis, compras e atividades recentes</p>
                </div>

                {customers.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum cliente cadastrado</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {customers.map((customer) => {
                      const isExpanded = expandedCustomers[customer.profile.id];
                      
                      return (
                        <div key={customer.profile.id} className="transition-all">
                          <div 
                            className="p-6 cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleCustomerExpanded(customer.profile.id)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium text-gray-900">{customer.profile.name}</h3>
                                  <button className="p-1">
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-gray-400" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-gray-400" />
                                    )}
                                  </button>
                                </div>
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
                                  {customer.cartItems.length > 0 && (
                                    <div className="flex items-center gap-1.5 text-sm">
                                      <Package className="w-4 h-4 text-yellow-500" />
                                      <span className="text-yellow-600">{customer.cartItems.length} no carrinho</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {customer.profile.phone && (
                                <a
                                  href={formatWhatsAppLink(customer.profile.phone)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  WhatsApp
                                </a>
                              )}
                            </div>
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
                                <div className="px-6 pb-6 pt-0 bg-gray-50/50 border-t border-gray-100">
                                  {/* Cart items */}
                                  {customer.cartItems.length > 0 && (
                                    <div className="mt-4">
                                      <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1.5">
                                        <ShoppingCart className="w-3.5 h-3.5" />
                                        Itens no carrinho:
                                      </p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {customer.cartItems.map((item: any) => (
                                          <span key={item.id} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                            {item.product_name} ({item.size}) - {formatCurrency(item.price)}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Recent activities */}
                                  {customer.recentActivities.length > 0 && (
                                    <div className="mt-4">
                                      <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1.5">
                                        <Activity className="w-3.5 h-3.5" />
                                        Atividades recentes:
                                      </p>
                                      <div className="space-y-2">
                                        {customer.recentActivities.map((activity) => {
                                          const IconComponent = getActivityIcon(activity.activity_type);
                                          return (
                                            <div key={activity.id} className="flex items-center gap-2 text-sm">
                                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getActivityColor(activity.activity_type)}`}>
                                                <IconComponent className="w-3 h-3" />
                                              </div>
                                              <span className="text-gray-700">{activity.description}</span>
                                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatRelativeTime(activity.created_at)}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {customer.recentActivities.length === 0 && customer.cartItems.length === 0 && (
                                    <p className="text-sm text-gray-400 italic mt-4">
                                      Nenhuma atividade recente registrada
                                    </p>
                                  )}

                                  <p className="text-xs text-gray-400 mt-4">
                                    Cadastro: {formatDate(customer.profile.created_at)}
                                  </p>
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
        </main>
      </div>

      {/* Product Modal */}
      <ProductFormModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
        availableCategories={availableCategories}
        allProducts={products}
      />

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowFeedbackModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {editingFeedback ? "Editar Feedback" : "Novo Feedback"}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cliente</label>
                  <input
                    type="text"
                    value={feedbackForm.user_name}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, user_name: e.target.value })}
                    placeholder="Ex: Maria Silva"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2e3091]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avaliação</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${star <= feedbackForm.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comentário</label>
                  <textarea
                    value={feedbackForm.comment}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                    rows={4}
                    placeholder="Escreva o comentário do cliente..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#2e3091] resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveFeedback}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#2e3091] text-white rounded-lg font-medium hover:bg-[#252a7a] transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Salvar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Detalhes do Pagamento</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Cliente</p>
                    <p className="font-medium text-gray-900">{selectedPayment.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Telefone</p>
                    <p className="font-medium text-gray-900">{selectedPayment.customer_phone}</p>
                  </div>
                  {selectedPayment.customer_email && (
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{selectedPayment.customer_email}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Valor Total</p>
                    <p className="text-2xl font-bold text-[#2e3091]">{formatCurrency(Number(selectedPayment.total_amount))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Data</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedPayment.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Senha do Cartão</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-lg font-bold text-[#2e3091] bg-gray-100 px-3 py-1 rounded">
                        {revealedPasswords[selectedPayment.id] ? getPassword(selectedPayment) : "••••"}
                      </p>
                      <button
                        onClick={() => togglePasswordVisibility(selectedPayment.id)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                      >
                        {revealedPasswords[selectedPayment.id] ? (
                          <EyeOff className="w-4 h-4 text-gray-500" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedPayment.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      selectedPayment.status === "approved" ? "bg-green-100 text-green-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {selectedPayment.status === "pending" ? "Pendente" : 
                       selectedPayment.status === "approved" ? "Aprovado" : "Rejeitado"}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">QR Code</p>
                  <img 
                    src={selectedPayment.qr_code_image} 
                    alt="QR Code" 
                    className="w-full max-w-[200px] rounded-lg border border-gray-200"
                  />
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm text-gray-500 mb-2">Itens do Pedido</p>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {Array.isArray(selectedPayment.items) && selectedPayment.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">
                        {item.productName} - {item.size} (x{item.quantity})
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPayment.shipping_address && (
                <div className="mt-6">
                  <p className="text-sm text-gray-500 mb-2">Endereço de Entrega</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      {selectedPayment.shipping_address.street}, {selectedPayment.shipping_address.number}
                      {selectedPayment.shipping_address.complement && ` - ${selectedPayment.shipping_address.complement}`}
                    </p>
                    <p className="text-sm text-gray-700">
                      {selectedPayment.shipping_address.neighborhood}, {selectedPayment.shipping_address.city} - {selectedPayment.shipping_address.state}
                    </p>
                    <p className="text-sm text-gray-700">CEP: {selectedPayment.shipping_address.cep}</p>
                  </div>
                </div>
              )}

              {selectedPayment.status === "pending" && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      updatePaymentStatus(selectedPayment.id, "approved");
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#2e3091] text-white rounded-lg font-medium hover:bg-[#252a7a] transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Aprovar
                  </button>
                  <button
                    onClick={() => {
                      updatePaymentStatus(selectedPayment.id, "rejected");
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Rejeitar
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

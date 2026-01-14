import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/sections/footer";
import { Package, ChevronRight } from "lucide-react";

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
  items: OrderItem[];
}

export default function MeusPedidosPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Show login prompt instead of redirecting for guest users
  if (!loading && !user) {
    return (
      <main className="min-h-screen bg-gray-50 pt-[120px]">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Faça login para ver seus pedidos
            </h2>
            <p className="text-gray-500 mb-6">
              Se você comprou como convidado, verifique seu e-mail para acompanhar o pedido.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate("/auth")}
                className="bg-[#2e3091] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#252a7a] transition-colors"
              >
                Fazer Login
              </button>
              <button
                onClick={() => navigate("/")}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

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

      // Fetch order items for each order
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData } = await supabase
            .from("order_items")
            .select("*")
            .eq("order_id", order.id);

          return {
            ...order,
            items: itemsData || [],
          };
        })
      );

      setOrders(ordersWithItems);
      setLoadingOrders(false);
    };

    fetchOrders();
  }, [user]);

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
      processing: { label: "Processando", color: "bg-blue-100 text-blue-800" },
      shipped: { label: "Enviado", color: "bg-purple-100 text-purple-800" },
      delivered: { label: "Entregue", color: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800" },
    };
    return statusMap[status] || { label: status, color: "bg-gray-100 text-gray-800" };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading || loadingOrders) {
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

  return (
    <main className="min-h-screen bg-gray-50 pt-[120px]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Meus Pedidos</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhum pedido encontrado
            </h2>
            <p className="text-gray-500 mb-6">
              Você ainda não fez nenhum pedido.
            </p>
            <button
              onClick={() => navigate("/escolas/colegio-militar")}
              className="bg-[#2e3091] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#252a7a] transition-colors"
            >
              Ver Produtos
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const status = getStatusLabel(order.status);
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Pedido #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">
                              {item.product_name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Tamanho: {item.size} | Qtd: {item.quantity}
                            </p>
                            <p className="text-sm font-medium text-[#2e3091]">
                              R$ {item.price.toFixed(2).replace(".", ",")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Total */}
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

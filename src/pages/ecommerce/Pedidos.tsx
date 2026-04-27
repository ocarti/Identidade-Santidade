import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { OrderStatusBadge } from "@/components/ecommerce/OrderStatusBadge";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";

type OrderItem = {
  id: string;
  quantidade: number;
  preco_unitario: number;
  products: { nome: string } | null;
};

type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
};

export default function Pedidos() {
  const { user } = useCustomerAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select("id, total, status, created_at, order_items(id, quantidade, preco_unitario, products(nome))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data as Order[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  const totalItems = (order: Order) =>
    order.order_items.reduce((sum, i) => sum + i.quantidade, 0);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <EcommerceLayout>
      <div className="container max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex gap-2 mb-8">
            <Link
              to="/ecommerce/conta"
              className="font-body text-sm font-semibold uppercase tracking-widest px-5 py-2 text-muted-foreground hover:bg-foreground/5 transition-colors"
            >
              Perfil
            </Link>
            <span className="bg-primary text-primary-foreground font-body text-sm font-semibold uppercase tracking-widest px-5 py-2">
              Pedidos
            </span>
            <Link
              to="/ecommerce"
              className="font-body text-sm font-semibold uppercase tracking-widest px-5 py-2 text-muted-foreground hover:bg-foreground/5 transition-colors"
            >
              Comprar Ingresso ou Camisetas
            </Link>
          </div>

          <h1 className="font-display text-4xl md:text-5xl mb-8">Meus Pedidos</h1>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-foreground/5 animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-body text-muted-foreground mb-6">Você ainda não fez nenhum pedido.</p>
              <Link
                to="/ecommerce"
                className="inline-block bg-primary text-primary-foreground px-6 py-3 font-body text-sm font-semibold uppercase tracking-widest hover:opacity-80 transition-opacity"
              >
                Ver Produtos
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-foreground/10">
              {orders.map((order) => {
                const open = expanded.has(order.id);
                return (
                  <div key={order.id}>
                    <button
                      type="button"
                      onClick={() => toggle(order.id)}
                      className="w-full py-4 flex items-center justify-between text-left hover:bg-foreground/[0.02] transition-colors"
                    >
                      <div>
                        <p className="font-body text-sm font-semibold mb-1">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="font-body text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("pt-BR")} ·{" "}
                          {totalItems(order)} {totalItems(order) === 1 ? "item" : "itens"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-body text-sm">
                          {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>
                        <OrderStatusBadge status={order.status} />
                        <ChevronDown
                          size={16}
                          className={`text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                        />
                      </div>
                    </button>

                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          key="items"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pb-4 pl-4 border-l-2 border-foreground/10 ml-2 mb-2">
                            {order.order_items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-body text-xs text-muted-foreground w-5 text-right">
                                    {item.quantidade}×
                                  </span>
                                  <span className="font-body text-sm">
                                    {item.products?.nome ?? "Produto"}
                                  </span>
                                </div>
                                <span className="font-body text-xs text-muted-foreground">
                                  {(item.preco_unitario * item.quantidade).toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                  })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </EcommerceLayout>
  );
}

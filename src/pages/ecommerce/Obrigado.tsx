import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;
  order_items: {
    quantidade: number;
    preco_unitario: number;
    products: { nome: string } | null;
  }[];
};

export default function Obrigado() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState<Order | null>(null);

  const fetchOrder = async (id: string) => {
    const { data } = await supabase
      .from("orders")
      .select("id, total, status, created_at, order_items(quantidade, preco_unitario, products(nome))")
      .eq("id", id)
      .maybeSingle();
    setOrder(data as Order);
  };

  useEffect(() => {
    if (!orderId) return;

    if (sessionId) {
      supabase.functions.invoke("verify-payment", {
        body: { session_id: sessionId },
      }).finally(() => fetchOrder(orderId));
    } else {
      fetchOrder(orderId);
    }
  }, [orderId, sessionId]);

  return (
    <EcommerceLayout>
      <div className="container max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="font-display text-4xl md:text-5xl mb-4">Obrigado!</h1>
          <p className="font-body text-muted-foreground mb-2">
            Obrigado por acreditar no projeto. Deus é maravilhoso.
          </p>
          <p className="font-body text-muted-foreground mb-2">
            Esperamos você no congresso. Mais informações enviaremos por e-mail.
          </p>
          <p className="font-body text-muted-foreground mb-6">
            Qualquer dúvida chame pelo WhatsApp{" "}
            <a
              href="https://wa.me/5511999528488"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline hover:opacity-60 transition-opacity"
            >
              (11) 99952-8488
            </a>{" "}
            com Eduardo.
          </p>

          {order && (
            <div className="border border-foreground/10 p-4 mb-6 text-left">
              <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-3">
                Pedido #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <div className="divide-y divide-foreground/10">
                {order.order_items.map((item, i) => (
                  <div key={i} className="flex justify-between py-2">
                    <span className="font-body text-sm">{item.products?.nome ?? "Produto"} ×{item.quantidade}</span>
                    <span className="font-body text-sm">
                      {(item.preco_unitario * item.quantidade).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-3 border-t border-foreground/10 mt-2">
                <span className="font-body text-sm font-semibold">Total</span>
                <span className="font-body text-sm font-semibold">
                  {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/ecommerce/conta/pedidos"
              className="inline-block border border-foreground/20 px-6 py-3 font-body text-sm font-semibold uppercase tracking-widest hover:bg-foreground/5 transition-colors"
            >
              Meus Pedidos
            </Link>
            <Link
              to="/ecommerce"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 font-body text-sm font-semibold uppercase tracking-widest hover:opacity-80 transition-opacity"
            >
              Continuar Comprando
            </Link>
          </div>
        </motion.div>
      </div>
    </EcommerceLayout>
  );
}

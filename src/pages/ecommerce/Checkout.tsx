import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { profile } = useCustomerAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) {
    navigate("/ecommerce/carrinho");
    return null;
  }

  const handlePay = async () => {
    setError("");
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/ecommerce/login");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-ecommerce-checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            items: items.map((i) => ({ product_id: i.product.id, qty: i.quantidade, tamanho: i.tamanho })),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao iniciar pagamento.");
        setLoading(false);
        return;
      }

      clearCart();
      window.location.href = data.url;
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <EcommerceLayout>
      <div className="container max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-body text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">
            E-Commerce
          </p>
          <h1 className="font-display text-4xl md:text-5xl mb-8">Resumo do Pedido</h1>

          {profile && (
            <div className="border border-foreground/10 p-4 mb-6">
              <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-1">Comprador</p>
              <p className="font-body font-semibold">{profile.nome}</p>
              <p className="font-body text-sm text-muted-foreground">{profile.email}</p>
            </div>
          )}

          <div className="divide-y divide-foreground/10 mb-6">
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between items-center py-3">
                <div>
                  <p className="font-body text-sm">{item.product.nome}</p>
                  <p className="font-body text-xs text-muted-foreground">Qtd: {item.quantidade}</p>
                </div>
                <p className="font-body text-sm font-semibold">
                  {(item.product.preco * item.quantidade).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-foreground/20 pt-4 mb-8">
            <div className="flex justify-between items-center">
              <span className="font-body text-sm uppercase tracking-widest text-muted-foreground">Total</span>
              <span className="font-display text-2xl">
                {totalPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 p-4 mb-6">
              <p className="font-body text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button
            onClick={handlePay}
            disabled={loading}
            className="w-full font-body text-sm font-semibold uppercase tracking-widest py-6"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Redirecionando...
              </>
            ) : (
              "Pagar com Stripe"
            )}
          </Button>

          <p className="font-body text-xs text-muted-foreground text-center mt-4">
            Você será redirecionado ao checkout seguro do Stripe.
          </p>
        </motion.div>
      </div>
    </EcommerceLayout>
  );
}

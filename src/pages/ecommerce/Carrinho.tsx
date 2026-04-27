import { Link, useNavigate } from "react-router-dom";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { CartItemRow } from "@/components/ecommerce/CartItemRow";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export default function Carrinho() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  return (
    <EcommerceLayout>
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-body text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">
            E-Commerce
          </p>
          <h1 className="font-display text-4xl md:text-5xl mb-8">Carrinho</h1>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <p className="font-body text-muted-foreground mb-6">Seu carrinho está vazio.</p>
              <Link
                to="/ecommerce"
                className="inline-block border border-foreground/20 px-6 py-3 font-body text-sm font-semibold uppercase tracking-widest hover:bg-foreground/5 transition-colors"
              >
                Ver Produtos
              </Link>
            </div>
          ) : (
            <div className="space-y-0">
              <div className="divide-y divide-foreground/10">
                {items.map((item) => (
                  <CartItemRow key={item.product.id} item={item} />
                ))}
              </div>

              <div className="border-t border-foreground/20 pt-6 mt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-body text-sm uppercase tracking-widest text-muted-foreground">Total</span>
                  <span className="font-display text-2xl">
                    {totalPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => navigate("/ecommerce/checkout")}
                    className="flex-1 font-body text-sm font-semibold uppercase tracking-widest py-6"
                  >
                    Finalizar Compra
                  </Button>
                  <button
                    onClick={clearCart}
                    className="font-body text-sm text-muted-foreground hover:text-foreground underline"
                  >
                    Limpar carrinho
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </EcommerceLayout>
  );
}

import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CartSummary() {
  const { totalItems, totalPrice } = useCart();

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-14 right-6 z-40"
        >
          <Link to="/ecommerce/carrinho">
            <Button className="font-body text-sm uppercase tracking-widest px-6 py-6 shadow-lg">
              <ShoppingBag size={18} className="mr-2" />
              Carrinho ({totalItems}) — R$ {totalPrice.toFixed(2).replace(".", ",")}
            </Button>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

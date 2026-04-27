import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { ProductCard } from "@/components/ecommerce/ProductCard";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";

type Product = {
  id: string;
  nome: string;
  preco: number;
  imagem_url: string | null;
  estoque: number | null;
  descricao: string | null;
  tamanhos: string[] | null;
};

export default function Catalogo() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { totalItems } = useCart();

  useEffect(() => {
    supabase
      .from("products")
      .select("id, nome, preco, imagem_url, estoque, descricao, tamanhos")
      .eq("ativo", true)
      .order("nome")
      .then(({ data }) => {
        setProducts(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <EcommerceLayout compact>
      <div className="container max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-display text-5xl md:text-6xl">Loja</h1>
            </div>
            <Link to="/ecommerce/carrinho" className="flex items-center gap-2 font-body text-sm font-semibold uppercase tracking-widest px-5 py-2 border border-foreground/20 hover:border-foreground/60 transition-colors relative">
              <ShoppingCart size={16} />
              Carrinho
              {totalItems > 0 && (
                <span className="bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-body font-semibold">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-foreground/5 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="font-body text-muted-foreground text-center py-16">
              Nenhum produto disponível no momento.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </EcommerceLayout>
  );
}

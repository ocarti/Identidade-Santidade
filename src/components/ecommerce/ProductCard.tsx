import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useCart, type CartProduct } from "@/contexts/CartContext";
import { toast } from "sonner";
import { motion } from "framer-motion";

type Props = {
  product: CartProduct & { descricao?: string | null; tamanhos?: string[] | null };
  index?: number;
};

export function ProductCard({ product, index = 0 }: Props) {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const hasTamanhos = product.tamanhos && product.tamanhos.length > 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasTamanhos) {
      navigate(`/ecommerce/produto/${product.id}`);
      return;
    }
    addItem(product);
    toast.success(`${product.nome} adicionado ao carrinho`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={`/ecommerce/produto/${product.id}`} className="block border border-border bg-card group">
        <div className="aspect-square bg-secondary flex items-center justify-center overflow-hidden">
          {product.imagem_url ? (
            <img
              src={product.imagem_url}
              alt={product.nome}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <ShoppingBag size={48} className="text-muted-foreground/30" />
          )}
        </div>
        <div className="p-6">
          <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-1">Produto</p>
          <h3 className="font-body font-semibold text-sm mb-1">{product.nome}</h3>
          {product.descricao && (
            <p className="font-body text-xs text-muted-foreground mb-3 line-clamp-2">{product.descricao}</p>
          )}
          <p className="font-display text-2xl mb-4">
            R$ {product.preco.toFixed(2).replace(".", ",")}
          </p>
          <button
            onClick={handleAdd}
            className="w-full bg-primary text-primary-foreground px-4 py-3 font-body text-sm font-semibold uppercase tracking-widest hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
          >
            <ShoppingBag size={16} />
            Adicionar ao Carrinho
          </button>
        </div>
      </Link>
    </motion.div>
  );
}

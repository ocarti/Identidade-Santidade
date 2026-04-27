import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart, type CartItem } from "@/contexts/CartContext";

type Props = {
  item: CartItem;
};

export function CartItemRow({ item }: Props) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {item.product.imagem_url ? (
          <img
            src={item.product.imagem_url}
            alt={item.product.nome}
            className="w-16 h-16 object-cover shrink-0"
          />
        ) : (
          <div className="w-16 h-16 bg-secondary shrink-0" />
        )}
        <div className="min-w-0">
          <p className="font-body font-semibold text-sm truncate">{item.product.nome}</p>
          {item.tamanho && (
            <p className="font-body text-xs text-muted-foreground uppercase tracking-widest">
              Tamanho: {item.tamanho}
            </p>
          )}
          <p className="font-body text-xs text-muted-foreground">
            R$ {item.product.preco.toFixed(2).replace(".", ",")} × {item.quantidade}
          </p>
          <p className="font-body text-sm font-semibold mt-1">
            R$ {(item.product.preco * item.quantidade).toFixed(2).replace(".", ",")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => updateQuantity(item.product.id, item.quantidade - 1, item.tamanho)}
          className="p-1 border border-border hover:bg-accent transition-colors"
        >
          <Minus size={14} />
        </button>
        <span className="font-body text-sm w-6 text-center">{item.quantidade}</span>
        <button
          onClick={() => updateQuantity(item.product.id, item.quantidade + 1, item.tamanho)}
          className="p-1 border border-border hover:bg-accent transition-colors"
        >
          <Plus size={14} />
        </button>
        <button
          onClick={() => removeItem(item.product.id, item.tamanho)}
          className="p-1 text-destructive hover:text-destructive/80 transition-colors ml-2"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";

export type CartProduct = {
  id: string;
  nome: string;
  preco: number;
  imagem_url: string | null;
};

export type CartItem = {
  product: CartProduct;
  quantidade: number;
  tamanho?: string;
};

// Unique key for a cart item (product + size variant)
export function cartItemKey(productId: string, tamanho?: string) {
  return tamanho ? `${productId}__${tamanho}` : productId;
}

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: "ADD_ITEM"; product: CartProduct; qty?: number; tamanho?: string }
  | { type: "REMOVE_ITEM"; productId: string; tamanho?: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantidade: number; tamanho?: string }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const key = cartItemKey(action.product.id, action.tamanho);
      const existing = state.items.find((i) => cartItemKey(i.product.id, i.tamanho) === key);
      if (existing) {
        return {
          items: state.items.map((i) =>
            cartItemKey(i.product.id, i.tamanho) === key
              ? { ...i, quantidade: i.quantidade + (action.qty ?? 1) }
              : i
          ),
        };
      }
      return {
        items: [...state.items, { product: action.product, quantidade: action.qty ?? 1, tamanho: action.tamanho }],
      };
    }
    case "REMOVE_ITEM": {
      const key = cartItemKey(action.productId, action.tamanho);
      return { items: state.items.filter((i) => cartItemKey(i.product.id, i.tamanho) !== key) };
    }
    case "UPDATE_QUANTITY": {
      const key = cartItemKey(action.productId, action.tamanho);
      if (action.quantidade <= 0) {
        return { items: state.items.filter((i) => cartItemKey(i.product.id, i.tamanho) !== key) };
      }
      return {
        items: state.items.map((i) =>
          cartItemKey(i.product.id, i.tamanho) === key ? { ...i, quantidade: action.quantidade } : i
        ),
      };
    }
    case "CLEAR":
      return { items: [] };
    case "HYDRATE":
      return { items: action.items };
    default:
      return state;
  }
}

const STORAGE_KEY = "ecommerce_cart";

type CartContextValue = {
  items: CartItem[];
  addItem: (product: CartProduct, qty?: number, tamanho?: string) => void;
  removeItem: (productId: string, tamanho?: string) => void;
  updateQuantity: (productId: string, quantidade: number, tamanho?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          dispatch({ type: "HYDRATE", items: parsed });
        }
      }
    } catch {
      // ignore corrupt data
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const addItem = (product: CartProduct, qty?: number, tamanho?: string) =>
    dispatch({ type: "ADD_ITEM", product, qty, tamanho });
  const removeItem = (productId: string, tamanho?: string) =>
    dispatch({ type: "REMOVE_ITEM", productId, tamanho });
  const updateQuantity = (productId: string, quantidade: number, tamanho?: string) =>
    dispatch({ type: "UPDATE_QUANTITY", productId, quantidade, tamanho });
  const clearCart = () => dispatch({ type: "CLEAR" });

  const totalItems = state.items.reduce((sum, i) => sum + i.quantidade, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.product.preco * i.quantidade, 0);

  return (
    <CartContext.Provider
      value={{ items: state.items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

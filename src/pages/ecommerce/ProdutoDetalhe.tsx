import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ShoppingCart, ArrowLeft, Minus, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

type Product = {
  id: string;
  nome: string;
  preco: number;
  imagem_url: string | null;
  estoque: number | null;
  descricao: string | null;
  tamanhos: string[] | null;
};

export default function ProdutoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [tamanho, setTamanho] = useState<string | undefined>(undefined);
  const [tamanhoError, setTamanhoError] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("products")
      .select("id, nome, preco, imagem_url, estoque, descricao, tamanhos")
      .eq("id", id)
      .eq("ativo", true)
      .maybeSingle()
      .then(({ data }) => {
        setProduct(data as Product);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <EcommerceLayout>
        <div className="container max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="aspect-square bg-foreground/5 animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-foreground/5 animate-pulse w-3/4" />
              <div className="h-6 bg-foreground/5 animate-pulse w-1/4" />
            </div>
          </div>
        </div>
      </EcommerceLayout>
    );
  }

  if (!product) {
    return (
      <EcommerceLayout>
        <div className="container max-w-md text-center py-16">
          <p className="font-body text-muted-foreground mb-4">Produto não encontrado.</p>
          <Link to="/ecommerce" className="font-body text-sm underline">
            Voltar à loja
          </Link>
        </div>
      </EcommerceLayout>
    );
  }

  const hasTamanhos = product.tamanhos && product.tamanhos.length > 0;
  const outOfStock = product.estoque != null && product.estoque <= 0;

  const handleAdd = () => {
    if (hasTamanhos && !tamanho) {
      setTamanhoError(true);
      return;
    }
    addItem(
      { id: product.id, nome: product.nome, preco: product.preco, imagem_url: product.imagem_url },
      qty,
      tamanho
    );
    toast.success(`${product.nome}${tamanho ? ` (${tamanho})` : ""} adicionado ao carrinho!`);
    navigate("/ecommerce/carrinho");
  };

  return (
    <EcommerceLayout>
      <div className="container max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12"
        >
          <div className="aspect-square bg-foreground/5 overflow-hidden">
            {product.imagem_url ? (
              <img src={product.imagem_url} alt={product.nome} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                <ShoppingCart size={64} />
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="font-display text-4xl md:text-5xl mb-4">{product.nome}</h1>
            <p className="font-display text-3xl mb-4">
              {product.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </p>

            {product.descricao && (
              <p className="font-body text-muted-foreground mb-6 leading-relaxed">{product.descricao}</p>
            )}

            {product.estoque != null && (
              <p className="font-body text-xs text-muted-foreground mb-4 uppercase tracking-widest">
                {outOfStock ? "Esgotado" : `${product.estoque} em estoque`}
              </p>
            )}

            {!outOfStock && (
              <>
                {hasTamanhos && (
                  <div className="mb-6">
                    <p className="font-body text-xs uppercase tracking-widest mb-3">
                      Tamanho
                      {tamanhoError && (
                        <span className="text-destructive ml-2 normal-case">— selecione um tamanho</span>
                      )}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {product.tamanhos!.map((t) => (
                        <button
                          key={t}
                          onClick={() => { setTamanho(t); setTamanhoError(false); }}
                          className={`w-12 h-12 border font-body text-sm font-semibold transition-colors ${
                            tamanho === t
                              ? "border-foreground bg-foreground text-background"
                              : "border-foreground/20 hover:border-foreground"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 border border-foreground/20 flex items-center justify-center hover:bg-foreground/5"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-body text-lg w-8 text-center">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-8 h-8 border border-foreground/20 flex items-center justify-center hover:bg-foreground/5"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <Button
                  onClick={handleAdd}
                  className="font-body text-sm font-semibold uppercase tracking-widest py-6"
                >
                  <ShoppingCart size={16} className="mr-2" />
                  Adicionar ao Carrinho
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </EcommerceLayout>
  );
}

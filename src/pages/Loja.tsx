import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MarqueeBanner } from "@/components/MarqueeBanner";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Plus, Minus, X, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { saleCheckoutSchema } from "@/lib/validations";

type Product = {
  id: string;
  nome: string;
  preco: number;
  descricao: string | null;
};

type CartItem = Product & { qty: number };

export default function Loja() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", cpf: "" });
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.from("products").select("id, nome, preco, descricao").then(({ data }) => {
      if (data) setProducts(data);
    });
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...product, qty: 1 }];
    });
    toast.success(`${product.nome} adicionado ao carrinho`);
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.preco * i.qty, 0);

  const [cooldown, setCooldown] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown) {
      toast.error("Aguarde antes de enviar novamente.");
      return;
    }
    if (!accepted) {
      toast.error("Confirme que entendeu a forma de entrega.");
      return;
    }
    if (cart.length === 0) return;

    const result = saleCheckoutSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setFormErrors(fieldErrors);
      return;
    }
    setFormErrors({});

    setSubmitting(true);

    const { data, error } = await supabase.functions.invoke("create-sale", {
      body: {
        nome: result.data.nome,
        email: result.data.email,
        cpf: result.data.cpf,
        items: cart.map((item) => ({ product_id: item.id, qty: item.qty })),
      },
    });

    if (error || (data && data.error)) {
      toast.error(data?.error || "Erro ao processar compra. Tente novamente.");
      setSubmitting(false);
      setCooldown(true);
      setTimeout(() => setCooldown(false), 30_000);
      return;
    }

    // Redirect to Stripe Checkout
    if (data?.url) {
      window.location.href = data.url;
    } else {
      toast.error("Erro ao gerar link de pagamento.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="font-body text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">Infoprodutos</p>
            <h1 className="font-display text-5xl md:text-6xl mb-2">Loja</h1>
            <p className="font-body text-muted-foreground mb-4">
              Materiais exclusivos para aprofundar sua caminhada.
            </p>
            <div className="flex items-start gap-2 bg-accent/50 border border-border p-4 mb-12">
              <AlertTriangle size={18} className="text-muted-foreground mt-0.5 shrink-0" />
              <p className="font-body text-sm text-muted-foreground">
                <strong>Retirada disponível apenas no checkout do evento.</strong> Os produtos adquiridos deverão ser retirados presencialmente durante o evento Identidade Santidade.
              </p>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="border border-border bg-card group"
              >
                <div className="aspect-square bg-secondary flex items-center justify-center">
                  <ShoppingBag size={48} className="text-muted-foreground/30" />
                </div>
                <div className="p-6">
                  <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-1">Infoproduto</p>
                  <h3 className="font-body font-semibold text-sm mb-1">{p.nome}</h3>
                  {p.descricao && (
                    <p className="font-body text-xs text-muted-foreground mb-2">{p.descricao}</p>
                  )}
                  <p className="font-body text-[10px] text-muted-foreground mb-3 italic">
                    Retirada apenas no evento
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl">
                      R$ {p.preco.toFixed(2).replace(".", ",")}
                    </span>
                    <button
                      onClick={() => addToCart(p)}
                      className="bg-primary text-primary-foreground p-2 hover:opacity-80 transition-opacity"
                    >
                      <ShoppingBag size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Cart floating button */}
          {cart.length > 0 && !showCheckout && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-6 right-6 z-40"
            >
              <Button
                onClick={() => setShowCheckout(true)}
                className="font-body text-sm uppercase tracking-widest px-6 py-6 shadow-lg"
              >
                <ShoppingBag size={18} className="mr-2" />
                Carrinho ({cart.reduce((s, i) => s + i.qty, 0)}) — R$ {cartTotal.toFixed(2).replace(".", ",")}
              </Button>
            </motion.div>
          )}

          {/* Checkout panel */}
          <AnimatePresence>
            {showCheckout && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-background border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-3xl">Checkout</h2>
                    <button onClick={() => setShowCheckout(false)}>
                      <X size={24} />
                    </button>
                  </div>

                  {/* Cart items */}
                  <div className="space-y-3 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b border-border pb-3">
                        <div>
                          <p className="font-body font-semibold text-sm">{item.nome}</p>
                          <p className="font-body text-xs text-muted-foreground">
                            R$ {item.preco.toFixed(2).replace(".", ",")} × {item.qty}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQty(item.id, -1)} className="p-1 border border-border">
                            <Minus size={14} />
                          </button>
                          <span className="font-body text-sm w-6 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="p-1 border border-border">
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2">
                      <span className="font-body font-semibold uppercase tracking-widest text-sm">Total</span>
                      <span className="font-display text-2xl">R$ {cartTotal.toFixed(2).replace(".", ",")}</span>
                    </div>
                  </div>

                  {/* Delivery notice */}
                  <div className="flex items-start gap-2 bg-accent/50 border border-border p-4 mb-6">
                    <AlertTriangle size={18} className="text-muted-foreground mt-0.5 shrink-0" />
                    <p className="font-body text-sm text-muted-foreground">
                      <strong>Retirada disponível apenas no checkout do evento.</strong> Os produtos adquiridos deverão ser retirados presencialmente.
                    </p>
                  </div>

                  {/* Guest checkout form */}
                  <form onSubmit={handleCheckout} className="space-y-4">
                    <div>
                      <Label className="font-body text-xs uppercase tracking-widest mb-2 block">Nome Completo</Label>
                      <Input
                        value={form.nome}
                        onChange={(e) => { setForm({ ...form, nome: e.target.value }); setFormErrors({ ...formErrors, nome: "" }); }}
                        className="border-foreground/20 bg-transparent font-body"
                        placeholder="Seu nome completo"
                      />
                      {formErrors.nome && <p className="text-destructive text-xs mt-1 font-body">{formErrors.nome}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-body text-xs uppercase tracking-widest mb-2 block">E-mail</Label>
                        <Input
                          type="email"
                          value={form.email}
                          onChange={(e) => { setForm({ ...form, email: e.target.value }); setFormErrors({ ...formErrors, email: "" }); }}
                          className="border-foreground/20 bg-transparent font-body"
                          placeholder="seu@email.com"
                        />
                        {formErrors.email && <p className="text-destructive text-xs mt-1 font-body">{formErrors.email}</p>}
                      </div>
                      <div>
                        <Label className="font-body text-xs uppercase tracking-widest mb-2 block">CPF</Label>
                        <Input
                          value={form.cpf}
                          onChange={(e) => { setForm({ ...form, cpf: e.target.value }); setFormErrors({ ...formErrors, cpf: "" }); }}
                          className="border-foreground/20 bg-transparent font-body"
                          placeholder="000.000.000-00"
                        />
                        {formErrors.cpf && <p className="text-destructive text-xs mt-1 font-body">{formErrors.cpf}</p>}
                      </div>
                    </div>

                    <div className="flex items-start gap-3 pt-2">
                      <Checkbox
                        id="delivery-confirm"
                        checked={accepted}
                        onCheckedChange={(v) => setAccepted(v === true)}
                        className="mt-0.5"
                      />
                      <label htmlFor="delivery-confirm" className="font-body text-sm text-muted-foreground cursor-pointer">
                        Estou ciente de que a retirada dos produtos será feita <strong>exclusivamente no checkout do evento</strong> Identidade Santidade.
                      </label>
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting || !accepted}
                      className="w-full font-body text-sm font-semibold uppercase tracking-widest py-6"
                    >
                      {submitting ? "Processando..." : "Finalizar Compra"}
                    </Button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
      <MarqueeBanner />
    </div>
  );
}

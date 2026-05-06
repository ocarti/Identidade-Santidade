import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Loader2, CreditCard, QrCode } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { profile, updateProfile } = useCustomerAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cpfRequired, setCpfRequired] = useState(false);
  const [cpfInput, setCpfInput] = useState("");
  const [cpfInputError, setCpfInputError] = useState("");
  const [savingCpf, setSavingCpf] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "pix">("card");
  const [installments, setInstallments] = useState(1);
  const MAX_INSTALLMENTS = 4;
  if (items.length === 0) {
    navigate("/ecommerce/carrinho");
    return null;
  }

  const handleCpfInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    const masked = digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
    setCpfInput(masked);
    setCpfInputError("");
  };

  const handleSaveCpf = async () => {
    if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpfInput)) {
      setCpfInputError("CPF inválido. Use o formato 000.000.000-00.");
      return;
    }
    setSavingCpf(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setCpfInputError("Sessão expirada. Faça login novamente.");
        setSavingCpf(false);
        return;
      }
      // Salva CPF e limpa asaas_customer_id para forçar criação de novo
      // customer no Asaas com CPF (o anterior pode ter sido criado sem CPF)
      const { error: updateError } = await supabase
        .from("customer_profiles")
        .update({ cpf: cpfInput, asaas_customer_id: null })
        .eq("user_id", session.user.id);
      if (updateError) {
        setCpfInputError(`Erro ao salvar CPF: ${updateError.message}`);
        setSavingCpf(false);
        return;
      }
      setCpfRequired(false);
      setCpfInput("");
      handlePay();
    } catch {
      setCpfInputError("Erro de conexão. Tente novamente.");
      setSavingCpf(false);
    }
  };

  const handlePay = async () => {
    setError("");
    setCpfRequired(false);

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
            paymentMethod,
            installments: paymentMethod === "card" ? installments : 1,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "CPF_REQUIRED") {
          setCpfRequired(true);
        } else {
          setError(data.error ?? "Erro ao iniciar pagamento.");
        }
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

          {/* Forma de pagamento */}
          <div className="mb-6">
            <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-3">
              Forma de pagamento
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`flex flex-col items-center gap-2 p-4 border transition-colors ${
                  paymentMethod === "card"
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/20 hover:border-foreground/50"
                }`}
              >
                <CreditCard size={20} />
                <span className="font-body text-xs font-semibold uppercase tracking-widest">
                  Cartão de Crédito
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setPaymentMethod("pix"); setInstallments(1); }}
                className={`flex flex-col items-center gap-2 p-4 border transition-colors ${
                  paymentMethod === "pix"
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/20 hover:border-foreground/50"
                }`}
              >
                <QrCode size={20} />
                <span className="font-body text-xs font-semibold uppercase tracking-widest">
                  PIX
                </span>
              </button>
            </div>
          </div>

          {paymentMethod === "card" && (
            <div className="mb-6">
              <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-3">
                Parcelas
              </p>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: MAX_INSTALLMENTS }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setInstallments(n)}
                    className={`p-3 border text-center transition-colors ${
                      installments === n
                        ? "border-foreground bg-foreground text-background"
                        : "border-foreground/20 hover:border-foreground/50"
                    }`}
                  >
                    <span className="font-body text-xs font-semibold">
                      {n === 1
                        ? `1x ${totalPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
                        : `${n}x ${(totalPrice / n).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {paymentMethod === "pix" && (
            <div className="mb-8 p-4 border border-foreground/10 bg-foreground/[0.02]">
              <p className="font-body text-xs text-muted-foreground">
                Pagamento instantâneo via QR Code. A confirmação ocorre em segundos após o pagamento.
              </p>
            </div>
          )}

          {cpfRequired && (
            <div className="border border-destructive/30 bg-destructive/5 p-5 mb-6 space-y-3">
              <div>
                <p className="font-body text-sm font-semibold text-destructive mb-1">
                  CPF obrigatório para pagamento
                </p>
                <p className="font-body text-xs text-muted-foreground">
                  Informe seu CPF para continuar. Ele será salvo no seu perfil.
                </p>
              </div>
              <Input
                value={cpfInput}
                onChange={handleCpfInput}
                placeholder="000.000.000-00"
                inputMode="numeric"
                maxLength={14}
                className="border-foreground/30 bg-background font-body focus:border-foreground"
              />
              {cpfInputError && (
                <p className="font-body text-xs text-destructive">{cpfInputError}</p>
              )}
              <Button
                type="button"
                onClick={handleSaveCpf}
                disabled={savingCpf || cpfInput.length < 14}
                className="w-full font-body text-sm font-semibold uppercase tracking-widest"
              >
                {savingCpf ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar CPF e continuar"
                )}
              </Button>
            </div>
          )}

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
            ) : paymentMethod === "pix" ? (
              "Pagar com PIX"
            ) : installments > 1 ? (
              `Pagar ${installments}x de ${(totalPrice / installments).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} no Cartão`
            ) : (
              `Pagar ${totalPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} no Cartão`
            )}
          </Button>

          <p className="font-body text-xs text-muted-foreground text-center mt-4">
            Você será redirecionado ao checkout seguro do Asaas.
          </p>
        </motion.div>
      </div>
    </EcommerceLayout>
  );
}

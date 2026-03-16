import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MarqueeBanner } from "@/components/MarqueeBanner";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";
import { ArrowRightLeft, CheckCircle, Loader2 } from "lucide-react";

interface CurrentRegistration {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  qr_code_token: string;
}

export default function TransferirIngresso() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState<CurrentRegistration | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [transferred, setTransferred] = useState(false);
  const [newData, setNewData] = useState<CurrentRegistration | null>(null);
  const [newTransferToken, setNewTransferToken] = useState("");

  const [form, setForm] = useState({
    novo_nome: "",
    novo_cpf: "",
    novo_email: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token) {
      setError("Link de transferência inválido.");
      setLoading(false);
      return;
    }

    const fetchRegistration = async () => {
      const { data, error: fnError } = await supabase.functions.invoke(
        "transfer-registration",
        {
          method: "GET",
          body: undefined,
          headers: {},
        }
      );

      // Since supabase.functions.invoke doesn't support GET with query params easily,
      // we'll use fetch directly
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transfer-registration?token=${token}`;
      const response = await fetch(url, {
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Ingresso não encontrado.");
      } else {
        setCurrent(result);
      }
      setLoading(false);
    };

    fetchRegistration();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!form.novo_nome || form.novo_nome.trim().length < 3) {
      errors.novo_nome = "Nome deve ter pelo menos 3 caracteres";
    }
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!form.novo_cpf || !cpfRegex.test(form.novo_cpf)) {
      errors.novo_cpf = "CPF inválido. Use o formato 000.000.000-00";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.novo_email || !emailRegex.test(form.novo_email)) {
      errors.novo_email = "E-mail inválido";
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "transfer-registration",
        {
          body: {
            transfer_token: token,
            ...form,
          },
        }
      );

      if (fnError || (data && data.error)) {
        toast.error(data?.error || "Erro ao transferir ingresso.");
        setSubmitting(false);
        return;
      }

      setTransferred(true);
      setNewData(data.registration);
      setNewTransferToken(data.registration.transfer_token);
      toast.success("Ingresso transferido com sucesso!");
    } catch {
      toast.error("Erro ao transferir ingresso.");
    }
    setSubmitting(false);
  };

  const baseUrl = window.location.origin;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container max-w-lg">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="font-display text-3xl mb-2">Link inválido</p>
              <p className="font-body text-muted-foreground">{error}</p>
            </motion.div>
          ) : transferred && newData ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6"
            >
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <h1 className="font-display text-4xl md:text-5xl">
                Transferência Concluída!
              </h1>
              <p className="font-body text-muted-foreground">
                O ingresso agora pertence a <strong>{newData.nome}</strong>.
                <br />
                Um novo QR Code foi gerado. O QR Code anterior foi invalidado.
              </p>

              <div className="inline-block bg-white p-4 rounded">
                <QRCodeSVG
                  value={`${baseUrl}/ingresso/validar?token=${newData.qr_code_token}`}
                  size={200}
                  level="H"
                />
              </div>

              <p className="font-body text-sm text-muted-foreground">
                Novo titular: {newData.nome} — {newData.email}
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <ArrowRightLeft className="h-6 w-6" />
                <h1 className="font-display text-4xl md:text-5xl">
                  Transferir Ingresso
                </h1>
              </div>

              <p className="font-body text-muted-foreground mb-8">
                Titular atual: <strong>{current?.nome}</strong> ({current?.email})
              </p>

              <div className="border border-foreground/10 p-6 mb-8">
                <p className="font-body text-sm text-muted-foreground mb-1">
                  QR Code Atual
                </p>
                <div className="bg-white inline-block p-3 rounded">
                  <QRCodeSVG
                    value={`${baseUrl}/ingresso/validar?token=${current?.qr_code_token}`}
                    size={120}
                    level="H"
                  />
                </div>
                <p className="font-body text-xs text-destructive mt-2">
                  Este QR Code será invalidado após a transferência.
                </p>
              </div>

              <h2 className="font-display text-2xl mb-4">Dados do Novo Titular</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="font-body text-xs uppercase tracking-widest mb-2 block">
                    Nome Completo
                  </Label>
                  <Input
                    value={form.novo_nome}
                    onChange={(e) => setForm({ ...form, novo_nome: e.target.value })}
                    className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                    placeholder="Nome do novo titular"
                  />
                  {formErrors.novo_nome && (
                    <p className="text-destructive text-xs mt-1 font-body">
                      {formErrors.novo_nome}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="font-body text-xs uppercase tracking-widest mb-2 block">
                    CPF
                  </Label>
                  <Input
                    value={form.novo_cpf}
                    onChange={(e) => setForm({ ...form, novo_cpf: e.target.value })}
                    className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                    placeholder="000.000.000-00"
                  />
                  {formErrors.novo_cpf && (
                    <p className="text-destructive text-xs mt-1 font-body">
                      {formErrors.novo_cpf}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="font-body text-xs uppercase tracking-widest mb-2 block">
                    E-mail
                  </Label>
                  <Input
                    type="email"
                    value={form.novo_email}
                    onChange={(e) => setForm({ ...form, novo_email: e.target.value })}
                    className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                    placeholder="novo-titular@email.com"
                  />
                  {formErrors.novo_email && (
                    <p className="text-destructive text-xs mt-1 font-body">
                      {formErrors.novo_email}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground py-4 font-body text-sm font-semibold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {submitting ? "Transferindo..." : "Confirmar Transferência"}
                </button>

                <p className="font-body text-xs text-center text-muted-foreground">
                  Após a transferência, um novo QR Code será gerado e o anterior será invalidado.
                </p>
              </form>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
      <MarqueeBanner />
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MarqueeBanner } from "@/components/MarqueeBanner";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { registrationSchema } from "@/lib/validations";
import { Plus, Trash2, Users } from "lucide-react";

interface Participant {
  nome: string;
  cpf: string;
  nascimento: string;
  cep: string;
  email: string;
}

const emptyParticipant = (): Participant => ({
  nome: "",
  cpf: "",
  nascimento: "",
  cep: "",
  email: "",
});

export default function Inscricao() {
  const navigate = useNavigate();
  const [buyerEmail, setBuyerEmail] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([emptyParticipant()]);
  const [errors, setErrors] = useState<Record<string, string>[]>([{}]);
  const [buyerEmailError, setBuyerEmailError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const addParticipant = () => {
    if (participants.length >= 10) {
      toast.error("Máximo de 10 inscrições por vez.");
      return;
    }
    setParticipants([...participants, emptyParticipant()]);
    setErrors([...errors, {}]);
  };

  const removeParticipant = (index: number) => {
    if (participants.length <= 1) return;
    setParticipants(participants.filter((_, i) => i !== index));
    setErrors(errors.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [e.target.name]: e.target.value };
    setParticipants(updated);
    // Clear error on change
    const updatedErrors = [...errors];
    updatedErrors[index] = { ...updatedErrors[index], [e.target.name]: "" };
    setErrors(updatedErrors);
  };

  const handleBlur = (index: number, field: string) => {
    const p = participants[index];
    const result = registrationSchema.shape[field as keyof typeof registrationSchema.shape]?.safeParse(
      (p as any)[field]
    );
    if (result && !result.success) {
      const updatedErrors = [...errors];
      updatedErrors[index] = { ...updatedErrors[index], [field]: result.error.errors[0]?.message || "Campo inválido" };
      setErrors(updatedErrors);
    }
  };

  const handleBuyerEmailBlur = () => {
    const emailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!buyerEmail) {
      setBuyerEmailError("E-mail do comprador é obrigatório");
    } else if (!emailCheck.test(buyerEmail)) {
      setBuyerEmailError("E-mail do comprador inválido");
    } else {
      setBuyerEmailError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown) {
      toast.error("Aguarde antes de enviar novamente.");
      return;
    }
    // Validate buyer email
    const emailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!buyerEmail || !emailCheck.test(buyerEmail)) {
      setBuyerEmailError("E-mail do comprador inválido");
      return;
    }
    setBuyerEmailError("");

    // Validate each participant
    let hasErrors = false;
    const newErrors: Record<string, string>[] = [];

    for (const p of participants) {
      const result = registrationSchema.safeParse(p);
      if (!result.success) {
        hasErrors = true;
        const fieldErrors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
          if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
        });
        newErrors.push(fieldErrors);
      } else {
        newErrors.push({});
      }
    }

    setErrors(newErrors);
    if (hasErrors) return;

    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("create-registration", {
      body: {
        buyer_email: buyerEmail.trim(),
        participants,
      },
    });

    if (error || (data && data.error)) {
      toast.error(data?.error || "Erro ao enviar inscrições. Tente novamente.");
      setSubmitting(false);
      return;
    }

    toast.success("Inscrições realizadas com sucesso!");
    // Navigate to success page with order data
    navigate("/inscricao/sucesso", {
      state: {
        order_id: data.order_id,
        registrations: data.registrations,
        buyer_email: buyerEmail.trim(),
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-body text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">
              Evento 2026
            </p>
            <h1 className="font-display text-5xl md:text-6xl mb-2">Inscrição</h1>
            <p className="font-body text-muted-foreground mb-6">
              Preencha os dados de cada participante. Você pode inscrever várias pessoas de uma vez.
            </p>
            <div className="bg-accent/50 border border-accent p-4 mb-10 font-body text-sm text-foreground/80">
              ⚠️ Crianças menores de 8 anos não pagam e não precisam de inscrição pelo site.
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Buyer email */}
              <div className="p-6 border border-foreground/10 space-y-4">
                <h2 className="font-display text-2xl flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Dados do Comprador
                </h2>
                <div>
                  <Label className="font-body text-xs uppercase tracking-widest mb-2 block">
                    E-mail do Comprador
                  </Label>
                    <Input
                      type="email"
                      value={buyerEmail}
                      onChange={(e) => {
                        setBuyerEmail(e.target.value);
                        setBuyerEmailError("");
                      }}
                      onBlur={handleBuyerEmailBlur}
                      required
                      className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                      placeholder="email-do-comprador@email.com"
                    />
                  {buyerEmailError && (
                    <p className="text-destructive text-xs mt-1 font-body">{buyerEmailError}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1 font-body">
                    Este e-mail receberá o resumo do pedido e os links de transferência.
                  </p>
                </div>
              </div>

              {/* Participants */}
              {participants.map((p, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 border border-foreground/10 space-y-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl">
                      Participante {index + 1}
                    </h3>
                    {participants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeParticipant(index)}
                        className="text-destructive hover:text-destructive/80 transition-colors p-1"
                        title="Remover participante"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div>
                    <Label className="font-body text-xs uppercase tracking-widest mb-2 block">
                      Nome Completo
                    </Label>
                    <Input
                      name="nome"
                      value={p.nome}
                      onChange={(e) => handleChange(index, e)}
                      onBlur={() => handleBlur(index, "nome")}
                      required
                      className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                      placeholder="Nome completo do participante"
                    />
                    {errors[index]?.nome && (
                      <p className="text-destructive text-xs mt-1 font-body">{errors[index].nome}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-body text-xs uppercase tracking-widest mb-2 block">
                        CPF
                      </Label>
                      <Input
                        name="cpf"
                        value={p.cpf}
                        onChange={(e) => handleChange(index, e)}
                        onBlur={() => handleBlur(index, "cpf")}
                        required
                        className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                        placeholder="000.000.000-00"
                      />
                      {errors[index]?.cpf && (
                        <p className="text-destructive text-xs mt-1 font-body">{errors[index].cpf}</p>
                      )}
                    </div>
                    <div>
                      <Label className="font-body text-xs uppercase tracking-widest mb-2 block">
                        Data de Nascimento
                      </Label>
                      <Input
                        name="nascimento"
                        type="date"
                        value={p.nascimento}
                        onChange={(e) => handleChange(index, e)}
                        onBlur={() => handleBlur(index, "nascimento")}
                        required
                        className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                      />
                      {errors[index]?.nascimento && (
                        <p className="text-destructive text-xs mt-1 font-body">{errors[index].nascimento}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-body text-xs uppercase tracking-widest mb-2 block">
                        CEP
                      </Label>
                      <Input
                        name="cep"
                        value={p.cep}
                        onChange={(e) => handleChange(index, e)}
                        onBlur={() => handleBlur(index, "cep")}
                        required
                        className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                        placeholder="00000-000"
                      />
                      {errors[index]?.cep && (
                        <p className="text-destructive text-xs mt-1 font-body">{errors[index].cep}</p>
                      )}
                    </div>
                    <div>
                      <Label className="font-body text-xs uppercase tracking-widest mb-2 block">
                        E-mail do Participante
                      </Label>
                      <Input
                        name="email"
                        type="email"
                        value={p.email}
                        onChange={(e) => handleChange(index, e)}
                        onBlur={() => handleBlur(index, "email")}
                        required
                        className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                        placeholder="participante@email.com"
                      />
                      {errors[index]?.email && (
                        <p className="text-destructive text-xs mt-1 font-body">{errors[index].email}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Add participant button */}
              <button
                type="button"
                onClick={addParticipant}
                className="w-full border border-dashed border-foreground/20 py-4 flex items-center justify-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Adicionar outro participante
              </button>

              {/* Summary */}
              <div className="border-t border-foreground/10 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-body text-sm text-muted-foreground">
                    Total de inscrições
                  </span>
                  <span className="font-display text-2xl">
                    {participants.length} {participants.length === 1 ? "ingresso" : "ingressos"}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground py-4 font-body text-sm font-semibold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  {submitting ? "Enviando..." : "Confirmar Inscrições"}
                </button>

                <p className="font-body text-xs text-center text-muted-foreground mt-4">
                  Ao se inscrever, você concorda com nossos termos e política de privacidade.
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
      <MarqueeBanner />
    </div>
  );
}

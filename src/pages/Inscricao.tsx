import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MarqueeBanner } from "@/components/MarqueeBanner";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { registrationSchema } from "@/lib/validations";

export default function Inscricao() {
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    nascimento: "",
    cep: "",
    email: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = registrationSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("create-registration", {
      body: result.data,
    });

    if (error || (data && data.error)) {
      toast.error(data?.error || "Erro ao enviar inscrição. Tente novamente.");
      setSubmitting(false);
      return;
    }

    toast.success("Inscrição enviada com sucesso!");
    setForm({ nome: "", cpf: "", nascimento: "", cep: "", email: "" });
    setErrors({});
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-body text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">
              Evento 2026
            </p>
            <h1 className="font-display text-5xl md:text-6xl mb-2">Inscrição</h1>
            <p className="font-body text-muted-foreground mb-10">
              Preencha seus dados para garantir sua vaga no Identidade Santidade 2026.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="nome" className="font-body text-xs uppercase tracking-widest mb-2 block">
                  Nome Completo
                </Label>
                <Input
                  id="nome"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                  placeholder="Seu nome completo"
                />
                {errors.nome && <p className="text-destructive text-xs mt-1 font-body">{errors.nome}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cpf" className="font-body text-xs uppercase tracking-widest mb-2 block">
                    CPF
                  </Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    value={form.cpf}
                    onChange={handleChange}
                    className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                    placeholder="000.000.000-00"
                  />
                  {errors.cpf && <p className="text-destructive text-xs mt-1 font-body">{errors.cpf}</p>}
                </div>
                <div>
                  <Label htmlFor="nascimento" className="font-body text-xs uppercase tracking-widest mb-2 block">
                    Data de Nascimento
                  </Label>
                  <Input
                    id="nascimento"
                    name="nascimento"
                    type="date"
                    value={form.nascimento}
                    onChange={handleChange}
                    className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                  />
                  {errors.nascimento && <p className="text-destructive text-xs mt-1 font-body">{errors.nascimento}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cep" className="font-body text-xs uppercase tracking-widest mb-2 block">
                    CEP
                  </Label>
                  <Input
                    id="cep"
                    name="cep"
                    value={form.cep}
                    onChange={handleChange}
                    className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                    placeholder="00000-000"
                  />
                  {errors.cep && <p className="text-destructive text-xs mt-1 font-body">{errors.cep}</p>}
                </div>
                <div>
                  <Label htmlFor="email" className="font-body text-xs uppercase tracking-widest mb-2 block">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                    placeholder="seu@email.com"
                  />
                  {errors.email && <p className="text-destructive text-xs mt-1 font-body">{errors.email}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground py-4 font-body text-sm font-semibold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {submitting ? "Enviando..." : "Prosseguir para pagamento"}
              </button>

              <p className="font-body text-xs text-center text-muted-foreground">
                Ao se inscrever, você concorda com nossos termos e política de privacidade.
              </p>
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
      <MarqueeBanner />
    </div>
  );
}

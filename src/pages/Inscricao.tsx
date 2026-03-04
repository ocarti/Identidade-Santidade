import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Inscricao() {
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    nascimento: "",
    cep: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Will integrate with Stripe + Cloud later
    toast.success("Inscrição enviada! Em breve você será redirecionado para o pagamento.");
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
                  required
                  className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                  placeholder="Seu nome completo"
                />
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
                    required
                    className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                    placeholder="000.000.000-00"
                  />
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
                    required
                    className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                  />
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
                    required
                    className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                    placeholder="00000-000"
                  />
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
                    required
                    className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-4 font-body text-sm font-semibold uppercase tracking-widest hover:opacity-80 transition-opacity"
              >
                Prosseguir para pagamento
              </button>

              <p className="font-body text-xs text-center text-muted-foreground">
                Ao se inscrever, você concorda com nossos termos e política de privacidade.
              </p>
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";

export default function RecuperarSenha() {
  const { resetPassword } = useCustomerAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Informe seu e-mail.");
      return;
    }

    setSubmitting(true);
    const { error: err } = await resetPassword(email);
    setSubmitting(false);

    if (err) {
      setError(err);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <EcommerceLayout>
        <div className="container max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h1 className="font-display text-4xl md:text-5xl mb-4">E-mail Enviado!</h1>
            <p className="font-body text-muted-foreground mb-6">
              Se o e-mail <strong>{email}</strong> estiver cadastrado, você receberá um link para redefinir sua senha.
            </p>
            <Link
              to="/ecommerce/login"
              className="inline-block border border-foreground/20 px-6 py-3 font-body text-sm font-semibold uppercase tracking-widest hover:bg-foreground/5 transition-colors"
            >
              Voltar ao Login
            </Link>
          </motion.div>
        </div>
      </EcommerceLayout>
    );
  }

  return (
    <EcommerceLayout>
      <div className="container max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-body text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">
            E-Commerce
          </p>
          <h1 className="font-display text-4xl md:text-5xl mb-2">Recuperar Senha</h1>
          <p className="font-body text-muted-foreground mb-6">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </p>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 p-4 mb-6">
              <p className="font-body text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="font-body text-xs uppercase tracking-widest mb-2 block">E-mail</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                placeholder="seu@email.com"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full font-body text-sm font-semibold uppercase tracking-widest py-6"
            >
              {submitting ? "Enviando..." : "Enviar Link de Recuperação"}
            </Button>
          </form>

          <p className="font-body text-sm text-center text-muted-foreground mt-6">
            <Link to="/ecommerce/login" className="text-foreground underline hover:opacity-60">
              Voltar ao login
            </Link>
          </p>
        </motion.div>
      </div>
    </EcommerceLayout>
  );
}

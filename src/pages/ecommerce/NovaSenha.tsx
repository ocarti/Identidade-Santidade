import { useState } from "react";
import { Link } from "react-router-dom";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function NovaSenha() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setSubmitting(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
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
            <h1 className="font-display text-4xl md:text-5xl mb-4">Senha Atualizada!</h1>
            <p className="font-body text-muted-foreground mb-6">
              Sua senha foi alterada com sucesso. Você já pode fazer login.
            </p>
            <Link
              to="/ecommerce/login"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 font-body text-sm font-semibold uppercase tracking-widest hover:opacity-80 transition-opacity"
            >
              Ir para Login
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
          <h1 className="font-display text-4xl md:text-5xl mb-2">Nova Senha</h1>
          <p className="font-body text-muted-foreground mb-6">
            Defina sua nova senha abaixo.
          </p>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 p-4 mb-6">
              <p className="font-body text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="font-body text-xs uppercase tracking-widest mb-2 block">Nova Senha</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="border-foreground/20 bg-transparent font-body focus:border-foreground pr-10"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <Label className="font-body text-xs uppercase tracking-widest mb-2 block">Confirmar Nova Senha</Label>
              <Input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                placeholder="Repita a nova senha"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full font-body text-sm font-semibold uppercase tracking-widest py-6"
            >
              {submitting ? "Salvando..." : "Salvar Nova Senha"}
            </Button>
          </form>
        </motion.div>
      </div>
    </EcommerceLayout>
  );
}

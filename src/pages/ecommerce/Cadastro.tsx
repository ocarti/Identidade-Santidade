import { useState } from "react";
import { Link } from "react-router-dom";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { customerSignUpSchema } from "@/lib/validations";

export default function Cadastro() {
  const { signUp } = useCustomerAuth();
  const [form, setForm] = useState({ nome: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    const result = customerSignUpSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    const { error } = await signUp(result.data.email, result.data.password, result.data.nome);
    setSubmitting(false);

    if (error) {
      setGeneralError(error);
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
            <h1 className="font-display text-4xl md:text-5xl mb-4">Cadastro Realizado!</h1>
            <p className="font-body text-muted-foreground mb-6">
              Sua conta foi criada com sucesso. Você já pode fazer login e realizar compras.
            </p>
            <Link
              to="/ecommerce/login"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 font-body text-sm font-semibold uppercase tracking-widest hover:opacity-80 transition-opacity"
            >
              Fazer Login
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
          <h1 className="font-display text-5xl md:text-6xl mb-6">Cadastro</h1>

          {generalError && (
            <div className="bg-destructive/10 border border-destructive/20 p-4 mb-6">
              <p className="font-body text-sm text-destructive">{generalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="font-body text-xs uppercase tracking-widest mb-2 block">Nome Completo</Label>
              <Input
                value={form.nome}
                onChange={(e) => { setForm({ ...form, nome: e.target.value }); setErrors({ ...errors, nome: "" }); }}
                className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                placeholder="Seu nome completo"
              />
              {errors.nome && <p className="text-destructive text-xs mt-1 font-body">{errors.nome}</p>}
            </div>

            <div>
              <Label className="font-body text-xs uppercase tracking-widest mb-2 block">E-mail</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors({ ...errors, email: "" }); }}
                className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                placeholder="seu@email.com"
              />
              {errors.email && <p className="text-destructive text-xs mt-1 font-body">{errors.email}</p>}
            </div>

            <div>
              <Label className="font-body text-xs uppercase tracking-widest mb-2 block">Senha</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: "" }); }}
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
              {errors.password && <p className="text-destructive text-xs mt-1 font-body">{errors.password}</p>}
            </div>

            <div>
              <Label className="font-body text-xs uppercase tracking-widest mb-2 block">Confirmar Senha</Label>
              <Input
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => { setForm({ ...form, confirmPassword: e.target.value }); setErrors({ ...errors, confirmPassword: "" }); }}
                className="border-foreground/20 bg-transparent font-body focus:border-foreground"
                placeholder="Repita a senha"
              />
              {errors.confirmPassword && <p className="text-destructive text-xs mt-1 font-body">{errors.confirmPassword}</p>}
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full font-body text-sm font-semibold uppercase tracking-widest py-6"
            >
              {submitting ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

          <p className="font-body text-sm text-center text-muted-foreground mt-6">
            Já tem uma conta?{" "}
            <Link to="/ecommerce/login" className="text-foreground underline hover:opacity-60">
              Faça login
            </Link>
          </p>
        </motion.div>
      </div>
    </EcommerceLayout>
  );
}

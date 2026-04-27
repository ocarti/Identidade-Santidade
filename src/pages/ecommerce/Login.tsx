import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EcommerceLayout } from "@/components/ecommerce/EcommerceLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Eye, EyeOff, TriangleAlert } from "lucide-react";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { customerLoginSchema } from "@/lib/validations";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useCustomerAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    const result = customerLoginSchema.safeParse(form);
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

    const { error } = await signIn(result.data.email, result.data.password);
    setSubmitting(false);

    if (error) {
      setGeneralError(error);
    } else {
      navigate("/ecommerce/conta");
    }
  };

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
          <h1 className="font-display text-5xl md:text-6xl mb-6">Login</h1>

          <div className="flex items-start gap-3 border border-yellow-400/60 bg-yellow-50/10 p-4 mb-6">
            <TriangleAlert size={18} className="text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="font-body text-sm text-foreground/80">
              Crianças menores de 8 anos não pagam e não precisam de inscrição pelo site.
            </p>
          </div>

          {generalError && (
            <div className="bg-destructive/10 border border-destructive/20 p-4 mb-6">
              <p className="font-body text-sm text-destructive">{generalError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Sua senha"
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

            <div className="text-right">
              <Link to="/ecommerce/recuperar-senha" className="font-body text-xs text-muted-foreground hover:text-foreground underline">
                Esqueceu a senha?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full font-body text-sm font-semibold uppercase tracking-widest py-6"
            >
              {submitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="font-body text-sm text-center text-muted-foreground mt-6">
            Não tem uma conta?{" "}
            <Link to="/ecommerce/cadastro" className="text-foreground underline hover:opacity-60">
              Cadastre-se
            </Link>
          </p>
        </motion.div>
      </div>
    </EcommerceLayout>
  );
}

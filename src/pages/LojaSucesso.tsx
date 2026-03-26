import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MarqueeBanner } from "@/components/MarqueeBanner";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function LojaSucesso() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    supabase.functions
      .invoke("verify-payment", { body: { session_id: sessionId } })
      .then(({ data, error }) => {
        if (error || data?.error) {
          setStatus("error");
        } else {
          setStatus("success");
        }
      });
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {status === "loading" && (
              <>
                <Loader2 className="mx-auto h-16 w-16 text-muted-foreground mb-4 animate-spin" />
                <h1 className="font-display text-4xl md:text-5xl mb-2">Verificando pagamento...</h1>
                <p className="font-body text-muted-foreground">Aguarde enquanto confirmamos seu pagamento.</p>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h1 className="font-display text-5xl md:text-6xl mb-2">Compra Confirmada!</h1>
                <p className="font-body text-muted-foreground mb-6">
                  Seu pagamento foi processado com sucesso. Retire seus produtos no <strong>checkout do evento</strong> Identidade Santidade.
                </p>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
                <h1 className="font-display text-4xl md:text-5xl mb-2">Erro no Pagamento</h1>
                <p className="font-body text-muted-foreground mb-6">
                  Não foi possível confirmar seu pagamento. Verifique seu e-mail ou entre em contato conosco.
                </p>
              </>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/loja"
                className="border border-foreground/20 px-6 py-3 font-body text-sm font-semibold uppercase tracking-widest hover:bg-foreground/5 transition-colors"
              >
                Voltar à Loja
              </Link>
              <Link
                to="/"
                className="font-body text-sm text-muted-foreground underline hover:text-foreground transition-colors py-3"
              >
                Ir ao início
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
      <MarqueeBanner />
    </div>
  );
}

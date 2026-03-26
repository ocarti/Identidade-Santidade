import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MarqueeBanner } from "@/components/MarqueeBanner";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Download, CheckCircle, ArrowRight, Loader2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Registration {
  id: string;
  nome: string;
  email: string;
  qr_code_token: string;
  transfer_token: string;
}

export default function InscricaoSucesso() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [buyerEmail, setBuyerEmail] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    supabase.functions
      .invoke("verify-payment", { body: { session_id: sessionId } })
      .then(({ data, error }) => {
        if (error || data?.error || data?.type !== "registration") {
          setStatus("error");
        } else {
          setRegistrations(data.registrations || []);
          setBuyerEmail(data.buyer_email || "");
          setStatus("success");
        }
      });
  }, [sessionId]);

  const downloadQRCode = (nome: string, qrToken: string) => {
    const canvas = document.createElement("canvas");
    const size = 400;
    canvas.width = size;
    canvas.height = size + 60;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const svgEl = document.getElementById(`qr-${qrToken}`);
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      ctx.fillStyle = "#000000";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(nome, size / 2, size + 35);

      const link = document.createElement("a");
      link.download = `ingresso-${nome.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const baseUrl = window.location.origin;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container max-w-2xl">
          {status === "loading" && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <Loader2 className="mx-auto h-16 w-16 text-muted-foreground mb-4 animate-spin" />
              <h1 className="font-display text-4xl md:text-5xl mb-2">Verificando pagamento...</h1>
              <p className="font-body text-muted-foreground">Aguarde enquanto confirmamos seu pagamento.</p>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <XCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
              <h1 className="font-display text-4xl md:text-5xl mb-2">Erro no Pagamento</h1>
              <p className="font-body text-muted-foreground mb-6">
                Não foi possível confirmar seu pagamento. Verifique seu e-mail ou entre em contato conosco.
              </p>
              <Link to="/inscricao" className="font-body text-sm text-muted-foreground underline hover:text-foreground transition-colors">
                Voltar para inscrição
              </Link>
            </motion.div>
          )}

          {status === "success" && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h1 className="font-display text-5xl md:text-6xl mb-2">
                  Inscrições Confirmadas!
                </h1>
                <p className="font-body text-muted-foreground">
                  {registrations.length}{" "}
                  {registrations.length === 1 ? "inscrição realizada" : "inscrições realizadas"}{" "}
                  com sucesso. Pagamento confirmado!
                  {buyerEmail && <> E-mail do comprador: <strong>{buyerEmail}</strong></>}
                </p>
              </motion.div>

              <div className="space-y-6">
                {registrations.map((reg, index) => (
                  <motion.div
                    key={reg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="border border-foreground/10 p-6"
                  >
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-shrink-0 bg-white p-4 rounded">
                        <QRCodeSVG
                          id={`qr-${reg.qr_code_token}`}
                          value={`${baseUrl}/ingresso/validar?token=${reg.qr_code_token}`}
                          size={160}
                          level="H"
                        />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="font-display text-2xl mb-1">{reg.nome}</h3>
                        <p className="font-body text-sm text-muted-foreground mb-4">{reg.email}</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => downloadQRCode(reg.nome, reg.qr_code_token)}
                            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 font-body text-xs font-semibold uppercase tracking-widest hover:opacity-80 transition-opacity"
                          >
                            <Download className="h-3 w-3" />
                            Baixar QR Code
                          </button>
                          <Link
                            to={`/ingresso/transferir?token=${reg.transfer_token}`}
                            className="flex items-center justify-center gap-2 border border-foreground/20 px-4 py-2 font-body text-xs font-semibold uppercase tracking-widest hover:bg-foreground/5 transition-colors"
                          >
                            <ArrowRight className="h-3 w-3" />
                            Transferir Ingresso
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-10">
                <Link
                  to="/"
                  className="font-body text-sm text-muted-foreground underline hover:text-foreground transition-colors"
                >
                  Voltar ao início
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
      <MarqueeBanner />
    </div>
  );
}

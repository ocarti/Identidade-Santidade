import { useLocation, Navigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MarqueeBanner } from "@/components/MarqueeBanner";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Download, CheckCircle, ArrowRight } from "lucide-react";
import { useRef } from "react";

interface Registration {
  id: string;
  nome: string;
  email: string;
  qr_code_token: string;
  transfer_token: string;
}

export default function InscricaoSucesso() {
  const location = useLocation();
  const state = location.state as {
    order_id: string;
    registrations: Registration[];
    buyer_email: string;
  } | null;

  if (!state || !state.registrations) {
    return <Navigate to="/inscricao" replace />;
  }

  const { registrations, buyer_email } = state;

  const downloadQRCode = (nome: string, qrToken: string) => {
    const canvas = document.createElement("canvas");
    const size = 400;
    canvas.width = size;
    canvas.height = size + 60;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render QR code from SVG
    const svgEl = document.getElementById(`qr-${qrToken}`);
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      // Add name label
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
              {registrations.length === 1
                ? "inscrição realizada"
                : "inscrições realizadas"}{" "}
              com sucesso. E-mail do comprador: <strong>{buyer_email}</strong>
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
                  {/* QR Code */}
                  <div className="flex-shrink-0 bg-white p-4 rounded">
                    <QRCodeSVG
                      id={`qr-${reg.qr_code_token}`}
                      value={`${baseUrl}/ingresso/validar?token=${reg.qr_code_token}`}
                      size={160}
                      level="H"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-display text-2xl mb-1">{reg.nome}</h3>
                    <p className="font-body text-sm text-muted-foreground mb-4">
                      {reg.email}
                    </p>

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
        </div>
      </main>
      <Footer />
      <MarqueeBanner />
    </div>
  );
}

import { Instagram, Youtube } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";

export function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <img src={logoWhite} alt="Identidade Santidade" className="h-32" />
            <p className="font-body text-sm opacity-70 mt-1">Seja santo, porque Eu sou santo.</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:opacity-60 transition-opacity" aria-label="Instagram">
              <Instagram size={20} />
            </a>
            <a href="#" className="hover:opacity-60 transition-opacity" aria-label="YouTube">
              <Youtube size={20} />
            </a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-primary-foreground/20 text-center">
          <p className="font-body text-xs opacity-50">
            © 2026 Identidade Santidade. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

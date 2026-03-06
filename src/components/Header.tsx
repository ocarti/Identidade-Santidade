import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logoBlack from "@/assets/logo-black.png";

const navItems = [
  { label: "Início", href: "/" },
  { label: "Sobre", href: "/sobre" },
  { label: "Loja", href: "/loja" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center">
          <img src={logoBlack} alt="Identidade Santidade" className="h-32" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="font-body text-sm font-medium uppercase tracking-widest hover:opacity-60 transition-opacity"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/inscricao"
            className="bg-primary text-primary-foreground px-6 py-2 font-body text-sm font-semibold uppercase tracking-widest hover:opacity-80 transition-opacity"
          >
            Inscreva-se
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border overflow-hidden bg-background"
          >
            <nav className="container flex flex-col gap-4 py-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="font-body text-lg uppercase tracking-widest"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/inscricao"
                className="bg-primary text-primary-foreground px-6 py-3 font-body text-center text-sm font-semibold uppercase tracking-widest"
                onClick={() => setOpen(false)}
              >
                Inscreva-se
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

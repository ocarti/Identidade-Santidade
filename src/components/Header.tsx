import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, User, LogOut, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logoBlack from "@/assets/logo-black.png";
import { useCart } from "@/contexts/CartContext";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";

const navItems = [
  { label: "Loja", href: "/ecommerce" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, signOut } = useCustomerAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center">
          <img src={logoBlack} alt="Identidade Santidade" className="h-[6rem]" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/ecommerce"
            className="bg-primary text-primary-foreground px-6 py-2 font-body text-sm font-semibold uppercase tracking-widest hover:opacity-80 transition-opacity"
          >
            Loja
          </Link>
          {user?.email === "ocarti@gmail.com" && (
            <Link
              to="/dashboard"
              className="font-body text-sm font-medium uppercase tracking-widest hover:opacity-60 transition-opacity flex items-center gap-1"
            >
              <BarChart3 size={15} />
              Dashboard
            </Link>
          )}
          <Link
            to={user ? "/ecommerce/conta" : "/ecommerce/login"}
            className="font-body text-sm font-medium uppercase tracking-widest hover:opacity-60 transition-opacity flex items-center gap-1"
          >
            <User size={15} />
            {user ? "Minha Conta" : "Entrar"}
          </Link>
          {user && (
            <button
              onClick={handleSignOut}
              className="font-body text-sm font-medium uppercase tracking-widest hover:opacity-60 transition-opacity flex items-center gap-1 text-foreground"
            >
              <LogOut size={15} />
              Sair
            </button>
          )}
          <Link to="/ecommerce/carrinho" className="relative p-2 hover:opacity-60 transition-opacity">
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-body font-semibold">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
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
              <Link
                to="/ecommerce"
                className="bg-primary text-primary-foreground px-6 py-3 font-body text-center text-sm font-semibold uppercase tracking-widest"
                onClick={() => setOpen(false)}
              >
                Loja
              </Link>
              {user?.email === "ocarti@gmail.com" && (
                <Link
                  to="/dashboard"
                  className="font-body text-lg uppercase tracking-widest flex items-center gap-2"
                  onClick={() => setOpen(false)}
                >
                  <BarChart3 size={18} />
                  Dashboard
                </Link>
              )}
              <Link
                to={user ? "/ecommerce/conta" : "/ecommerce/login"}
                className="font-body text-lg uppercase tracking-widest"
                onClick={() => setOpen(false)}
              >
                {user ? "Minha Conta" : "Entrar"}
              </Link>
              {user && (
                <button
                  onClick={handleSignOut}
                  className="font-body text-lg uppercase tracking-widest text-left flex items-center gap-2 text-foreground"
                >
                  <LogOut size={18} />
                  Sair
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

const products = [
  { id: 1, name: "E-book: Identidade em Cristo", price: "R$ 29,90", category: "E-book" },
  { id: 2, name: "Devocional 30 Dias de Santidade", price: "R$ 39,90", category: "Devocional" },
  { id: 3, name: "Curso Online: Fundamentos da Fé", price: "R$ 97,00", category: "Curso" },
  { id: 4, name: "Kit Estudo Bíblico em Grupo", price: "R$ 49,90", category: "Material" },
];

export default function Loja() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-body text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">
              Infoprodutos
            </p>
            <h1 className="font-display text-5xl md:text-6xl mb-2">Loja</h1>
            <p className="font-body text-muted-foreground mb-12">
              Materiais exclusivos para aprofundar sua caminhada.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="border border-border bg-card group"
              >
                <div className="aspect-square bg-secondary flex items-center justify-center">
                  <ShoppingBag size={48} className="text-muted-foreground/30" />
                </div>
                <div className="p-6">
                  <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    {p.category}
                  </p>
                  <h3 className="font-body font-semibold text-sm mb-3">{p.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-2xl">{p.price}</span>
                    <button className="bg-primary text-primary-foreground p-2 hover:opacity-80 transition-opacity">
                      <ShoppingBag size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

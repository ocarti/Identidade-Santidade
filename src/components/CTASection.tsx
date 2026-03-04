import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-32 bg-primary text-primary-foreground">
      <div className="container text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-6xl md:text-8xl mb-6">
            Sua Identidade
            <br />
            Começa Aqui
          </h2>
          <p className="font-body text-lg max-w-md mx-auto mb-10 opacity-70">
            Vagas limitadas. Não perca a oportunidade de viver algo que vai transformar sua história.
          </p>
          <Link
            to="/inscricao"
            className="inline-flex items-center gap-3 border-2 border-primary-foreground px-10 py-4 font-body text-sm font-semibold uppercase tracking-widest hover:bg-primary-foreground hover:text-primary transition-colors"
          >
            Inscreva-se agora
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import gallery3 from "@/assets/gallery-3.jpg";

export function TestimonialsSection() {
  return (
    <section className="pt-24 pb-0">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-body text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">
              Nossa História
            </p>
            <h2 className="font-display text-5xl md:text-6xl mb-8">
              O Início de Tudo
            </h2>
            <div className="space-y-6 font-body text-muted-foreground leading-relaxed">
              <p>
                O Identidade Santidade nasceu do desejo de reunir jovens que
                buscam viver de forma autêntica e radical na presença de Deus.
                Mais do que um evento, é um movimento que conecta gerações em
                torno de um propósito: descobrir quem somos em Cristo.
              </p>
              <p>
                Desde a nossa primeira edição, temos visto vidas sendo
                transformadas, corações sendo restaurados e uma geração se
                levantando com ousadia para viver a santidade como identidade
                — não como um peso, mas como um privilégio.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="h-72 overflow-hidden"
          >
            <img
              src={gallery3}
              alt="Momento de adoração"
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

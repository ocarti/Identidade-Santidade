import { motion } from "framer-motion";

export function AboutSection() {
  return (
    <section id="sobre" className="-mt-[4.5rem] relative z-10 py-24 bg-primary text-primary-foreground">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-body text-sm uppercase tracking-[0.3em] text-primary-foreground/60 mb-2">
              Sobre o Evento
            </p>
            <h2 className="font-display text-5xl md:text-6xl mb-8">
              Quem Somos
            </h2>
            <div className="space-y-6 font-body text-primary-foreground/80 leading-relaxed">
              <p>
                O Identidade Santidade nasceu do desejo de reunir jovens que buscam
                viver de forma autêntica e radical na presença de Deus. Mais do que
                um evento, é um movimento que conecta gerações em torno de um
                propósito: descobrir quem somos em Cristo.
              </p>
              <p>
                Através de louvor intenso, pregações transformadoras e momentos de
                comunhão, criamos um espaço onde cada pessoa pode ter um encontro
                genuíno com o Espírito Santo — sem máscaras, sem barreiras.
              </p>
              <p>
                Acreditamos que santidade não é distância do mundo, mas sim uma
                identidade que nos define e nos impulsiona a transformar tudo ao
                nosso redor.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {[
              { number: "300+", label: "Jovens Impactados" },
              { number: "4", label: "Edições Realizadas" },
              { number: "1", label: "Propósito: Viver a Santidade Através da Identidade" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.15 }}
                className="border-l-2 border-primary-foreground/30 pl-6"
              >
                <span className="font-display text-5xl md:text-6xl block">
                  {stat.number}
                </span>
                <span className="font-body text-sm uppercase tracking-widest text-primary-foreground/60">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

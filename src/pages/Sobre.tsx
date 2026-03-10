import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { ImageLightbox } from "@/components/ImageLightbox";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery3 from "@/assets/gallery-3.jpg";

export default function Sobre() {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero banner */}
        <section className="relative h-[60vh] flex items-end overflow-hidden">
          <img
            src={gallery1}
            alt="Identidade Santidade"
            className="absolute inset-0 w-full h-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
          <div className="relative container pb-12 text-primary-foreground">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-display text-6xl md:text-8xl">Sobre</h1>
            </motion.div>
          </div>
        </section>

        {/* Nossa história */}
        <section className="py-24">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-16 items-start">
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
                className="aspect-[4/5] overflow-hidden"
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

        {/* Números */}
        <section className="py-24 bg-primary text-primary-foreground">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <p className="font-body text-sm uppercase tracking-[0.3em] text-primary-foreground/60 mb-2">
                Nosso Impacto
              </p>
              <h2 className="font-display text-5xl md:text-6xl">Em Números</h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: "300+", label: "Jovens Impactados" },
                { number: "4", label: "Edições Realizadas" },
                { number: "30+", label: "Voluntários" },
                { number: "1", label: "Propósito: Viver a Santidade Através da Identidade" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="text-center"
                >
                  <span className="font-display text-5xl md:text-7xl block mb-2">
                    {stat.number}
                  </span>
                  <span className="font-body text-xs uppercase tracking-widest text-primary-foreground/60">
                    {stat.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Missão e Visão */}
        <section className="py-24">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-16">
              {[
                {
                  title: "Nossa Missão",
                  text: "Despertar uma geração para viver a santidade como identidade, através de encontros marcantes com a presença de Deus, louvor genuíno e a Palavra que transforma.",
                },
                {
                  title: "Nossa Visão",
                  text: "Ser referência como um movimento jovem que inspira autenticidade, ousadia e compromisso com os valores do Reino de Deus, impactando famílias, igrejas e comunidades.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                  className="border-l-2 border-foreground/20 pl-8"
                >
                  <h3 className="font-display text-4xl md:text-5xl mb-6">
                    {item.title}
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Versículo destaque */}
        <section className="py-24 bg-secondary">
          <div className="container text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="font-display text-4xl md:text-5xl leading-tight mb-6">
                "Sede santos, porque Eu sou santo."
              </p>
              <p className="font-body text-sm uppercase tracking-widest text-muted-foreground">
                1 Pedro 1:16
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

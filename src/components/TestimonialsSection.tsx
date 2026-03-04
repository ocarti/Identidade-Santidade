import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Lucas Oliveira",
    age: 22,
    text: "O evento mudou completamente minha visão sobre identidade em Cristo. Saí transformado.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  },
  {
    name: "Ana Beatriz",
    age: 19,
    text: "Nunca tinha experimentado a presença de Deus de forma tão real. Identidade Santidade é diferente.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
  },
  {
    name: "Gabriel Santos",
    age: 25,
    text: "Cada palestra foi uma palavra direta para minha vida. Recomendo a todos os jovens.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
  },
];

export function TestimonialsSection() {
  return (
    <section id="depoimentos" className="py-24 bg-secondary">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-body text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">
            Depoimentos
          </p>
          <h2 className="font-display text-5xl md:text-6xl mb-16">
            Vidas Transformadas
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="bg-card border border-border p-8 flex flex-col"
            >
              <p className="font-body text-base leading-relaxed flex-1 mb-6">
                "{t.text}"
              </p>
              <div className="flex items-center gap-4">
                <img
                  src={t.image}
                  alt={t.name}
                  className="w-12 h-12 object-cover grayscale"
                />
                <div>
                  <p className="font-body font-semibold text-sm">{t.name}</p>
                  <p className="font-body text-xs text-muted-foreground">{t.age} anos</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

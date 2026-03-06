import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-image.jpg";


export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Jovens em adoração no evento Identidade Santidade"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 container text-center py-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-display text-7xl sm:text-8xl md:text-9xl leading-none">
            Identidade
            <br />
            Santidade
          </h1>
          <p className="font-body text-lg md:text-xl max-w-xl mx-auto mt-6 text-foreground/70">
            Uma experiência transformadora para aqueles que buscam viver uma fé autêntica e radical.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/inscricao"
            className="bg-primary text-primary-foreground px-10 py-4 font-body text-sm font-semibold uppercase tracking-widest hover:opacity-80 transition-opacity"
          >
            Garanta sua vaga
          </Link>
          <a
            href="#sobre"
            className="border-2 border-foreground text-foreground px-10 py-4 font-body text-sm font-semibold uppercase tracking-widest hover:bg-foreground hover:text-background transition-colors"
          >
            Saiba mais
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-6"
        >
          <p className="font-body text-sm uppercase tracking-[0.3em] text-foreground/80">
            5° Edição - 2026
          </p>
        </motion.div>
      </div>

      {/* Marquee */}
      <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground py-3 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="font-display text-lg tracking-widest mx-8">
              IDENTIDADE SANTIDADE • 2026 •
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

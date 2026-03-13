import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-image-new.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-start justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Jovens em adoração no evento Identidade Santidade"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 container pt-10 mt-4">
        <div className="flex flex-col items-center">
          {/* Large typographic title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center"
          >
            <h1 className="font-display text-[clamp(3.75rem,13.5vw,10.5rem)] leading-[0.85] tracking-tight text-foreground">
              IDENTIDADE
            </h1>
            <h1 className="font-display text-[clamp(3.75rem,13.5vw,10.5rem)] leading-[0.85] tracking-tight text-stroke">
              SANTIDADE
            </h1>
          </motion.div>

          {/* Edition badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8"
          >
            <span className="font-body text-xs uppercase tracking-[0.5em] text-foreground border-2 border-foreground px-6 py-2 inline-block font-bold">
              5° Edição — 2026
            </span>
          </motion.div>

          {/* Single CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/inscricao"
              className="bg-primary text-primary-foreground px-12 py-4 font-body text-sm font-semibold uppercase tracking-widest hover:opacity-80 transition-opacity"
            >
              Garanta sua vaga
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Marquee */}
      <div className="absolute bottom-[4.5rem] left-0 right-0 z-20">
        <div className="bg-primary text-primary-foreground py-3 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap flex">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="font-display text-lg tracking-widest mx-8">
                IDENTIDADE SANTIDADE • 2026 •
              </span>
            ))}
          </div>
        </div>
        <div className="h-px bg-background w-full" />
      </div>
    </section>
  );
}

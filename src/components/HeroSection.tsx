import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-image-new.jpg";
import ConfettiBackground from "@/components/ui/confetti-background";


export function HeroSection() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Jovens em adoração no evento Identidade Santidade"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/50" />
        <ConfettiBackground />
      </div>

      {/* Content — 2 columns */}
      <div className="relative z-10 container pt-10 mt-4 -translate-y-[10%]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Left: text */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <h1 className="font-display text-[clamp(3.5rem,10vw,8rem)] leading-[0.85] tracking-tight text-foreground">
                IDENTIDADE
              </h1>
              <h1 className="font-display text-[clamp(3.5rem,10vw,8rem)] leading-[0.85] tracking-tight text-stroke">
                SANTIDADE
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8"
            >
              <span className="font-body text-base uppercase tracking-[0.5em] text-foreground border-2 border-foreground px-6 py-2 inline-block font-bold">
                Edição 2026
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="mt-4"
            >
              <p className="font-body text-lg font-bold text-foreground tracking-wide">
                31 de Julho, 01 e 02 de Agosto de 2026
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-8 flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/ecommerce/conta"
                className="bg-primary text-primary-foreground px-10 py-4 font-body text-sm font-semibold uppercase tracking-widest hover:opacity-80 transition-opacity"
              >
                Garanta sua vaga
              </Link>
            </motion.div>
          </div>

          {/* Right: video */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full aspect-video shadow-2xl overflow-hidden"
          >
            <video
              src="/videos/2025IEDS.mp4"
              poster={heroImage}
              controls
              preload="metadata"
              className="w-full h-full object-cover"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}

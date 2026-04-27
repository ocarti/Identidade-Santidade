import { motion } from "framer-motion";
import { CalendarDays, MapPin, MessageCircle } from "lucide-react";

export function EventDetailsSection() {
  return (
    <>
      {/* Detalhes do Evento — faixa compacta */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-primary text-primary-foreground"
      >
        <div className="container">
          <div className="flex flex-col md:flex-row items-stretch divide-y md:divide-y-0 md:divide-x divide-primary-foreground/15">

            {/* Data */}
            <div className="flex items-center gap-4 px-10 py-8 flex-1">
              <CalendarDays className="h-5 w-5 text-primary-foreground/40 flex-shrink-0" />
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.3em] text-primary-foreground/50 mb-0.5">Data</p>
                <p className="font-body text-sm font-semibold leading-snug">31 de Julho, 01 e 02 de Agosto de 2026</p>
              </div>
            </div>

            {/* Local */}
            <div className="flex items-center gap-4 px-10 py-8 flex-1">
              <MapPin className="h-5 w-5 text-primary-foreground/40 flex-shrink-0" />
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.3em] text-primary-foreground/50 mb-0.5">Local</p>
                <p className="font-body text-sm font-semibold leading-snug">Igreja Batista Betel — Dois Vizinhos, PR</p>
              </div>
            </div>

            {/* Contato — WhatsApp */}
            <div className="flex items-center gap-4 px-10 py-8 flex-1">
              <MessageCircle className="h-5 w-5 text-primary-foreground/40 flex-shrink-0" />
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.3em] text-primary-foreground/50 mb-0.5">Contato</p>
                <a
                  href="https://wa.me/5511999528488"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-sm font-semibold leading-snug hover:opacity-70 transition-opacity underline underline-offset-2"
                >
                  WhatsApp (11) 99952-8488
                </a>
              </div>
            </div>

          </div>
        </div>
      </motion.section>
    </>
  );
}

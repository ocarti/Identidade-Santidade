import { useState } from "react";
import { motion } from "framer-motion";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import gallery6 from "@/assets/gallery-6.jpg";
import { ImageLightbox } from "./ImageLightbox";

const images = [gallery1, gallery2, gallery3, gallery4, gallery5, gallery6];

export function GallerySection() {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  return (
    <section className="py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-body text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">
            Galeria
          </p>
          <h2 className="font-display text-5xl md:text-6xl mb-16">
            Momentos Marcantes
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {images.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="aspect-[3/2] overflow-hidden group"
            >
              <img
                src={src}
                alt={`Momento do evento ${i + 1}`}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105 cursor-pointer"
                loading="lazy"
                onClick={() => setLightboxSrc(src)}
              />
            </motion.div>
          ))}
        </div>


      </div>

      <ImageLightbox
        src={lightboxSrc}
        alt="Momento do evento"
        open={!!lightboxSrc}
        onOpenChange={(open) => !open && setLightboxSrc(null)}
      />
    </section>
  );
}

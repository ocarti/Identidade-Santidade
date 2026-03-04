import { motion } from "framer-motion";

const images = [
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
];

export function GallerySection() {
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
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

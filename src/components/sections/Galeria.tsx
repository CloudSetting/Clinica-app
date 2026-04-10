"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { ZoomIn } from "lucide-react";

const imagenes = [
  {
    src: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1200&auto=format&fit=crop",
    alt: "Recepción del centro médico",
  },
  {
    src: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=1200&auto=format&fit=crop",
    alt: "Sala de consulta moderna",
  },
  {
    src: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=1200&auto=format&fit=crop",
    alt: "Área de espera cómoda",
  },
  {
    src: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=1200&auto=format&fit=crop",
    alt: "Consultorio de psicología",
  },
  {
    src: "https://images.unsplash.com/photo-1504813184591-01572f98c85f?q=80&w=1200&auto=format&fit=crop",
    alt: "Equipamiento médico moderno",
  },
  {
    src: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=1200&auto=format&fit=crop",
    alt: "Pasillo del centro médico",
  },
  {
    src: "https://images.unsplash.com/photo-1643297654416-05795d62e39c?q=80&w=1200&auto=format&fit=crop",
    alt: "Consulta médica en progreso",
  },
  {
    src: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=1200&auto=format&fit=crop",
    alt: "Sala de kinesiología",
  },
  {
    src: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=1200&auto=format&fit=crop",
    alt: "Entrada principal del centro",
  },
];

export default function Galeria() {
  const [index, setIndex] = useState(-1);

  return (
    <section id="galeria" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* Encabezado */}
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2"
          >
            Nuestras instalaciones
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-gray-900"
          >
            Galería
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-500 mt-4 max-w-xl mx-auto text-lg"
          >
            Conoce nuestros espacios diseñados para tu comodidad y bienestar.
          </motion.p>
        </div>

        {/* Grid de imágenes */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {imagenes.map((imagen, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              onClick={() => setIndex(i)}
              className="relative group aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <Image
                src={imagen.src}
                alt={imagen.alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Overlay al hover */}
              <div className="absolute inset-0 bg-blue-950/0 group-hover:bg-blue-950/40 transition-all duration-300 flex items-center justify-center">
                <ZoomIn
                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg"
                  size={36}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        index={index}
        slides={imagenes.map((img) => ({ src: img.src, alt: img.alt }))}
      />
    </section>
  );
}
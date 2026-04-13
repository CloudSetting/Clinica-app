'use client';

import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80')" }}
    >
      <div className="absolute inset-0 bg-primary-dark opacity-75" />

      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">

        <motion.h1
          className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          Centro de Salud <span className="text-blue-300">Integral</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-2xl mb-10 text-gray-200 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
        >
          Atención médica y psicológica de calidad. ¡Agenda tu hora ahora!
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
        >
          <a href="#reservas" className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-4 rounded-full text-lg transition-colors duration-200">
            Agendar hora
          </a>
          <a href="#servicios" className="border-2 border-white text-white hover:bg-white hover:text-primary-dark font-semibold px-8 py-4 rounded-full text-lg transition-colors duration-200">
            Conocer nuestros servicios
          </a>
        </motion.div>

      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-4xl"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        ↓
      </motion.div>

    </section>
  );
}
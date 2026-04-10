"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import Image from "next/image";

const testimonios = [
  {
    id: 1,
    nombre: "M. González",
    servicio: "Psicología Clínica",
    estrellas: 5,
    texto: "Excelente atención desde el primer día. Mi psicóloga me ayudó a manejar la ansiedad de una forma que nunca imaginé posible. El ambiente es muy cálido y profesional.",
    fecha: "Marzo 2024",
    foto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 2,
    nombre: "R. Castillo",
    servicio: "Medicina General",
    estrellas: 5,
    texto: "El Dr. Fuentes es muy dedicado y se toma el tiempo necesario para explicar cada diagnóstico. Por fin encontré un médico de confianza. Muy recomendado.",
    fecha: "Febrero 2024",
    foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 3,
    nombre: "V. Morales",
    servicio: "Nutrición y Dietética",
    estrellas: 5,
    texto: "Gracias al plan nutricional personalizado bajé 8 kilos en 3 meses de forma saludable. La nutricionista es increíble, siempre disponible para resolver dudas.",
    fecha: "Enero 2024",
    foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 4,
    nombre: "C. Navarro",
    servicio: "Kinesiología",
    estrellas: 4,
    texto: "Llegué con un dolor de espalda crónico que tenía hace años y en 6 sesiones noté una mejora enorme. El kinesiólogo explica muy bien cada ejercicio y su propósito.",
    fecha: "Abril 2024",
    foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 5,
    nombre: "A. Pérez",
    servicio: "Psiquiatría",
    estrellas: 5,
    texto: "El Dr. Torres me cambió la vida. Su enfoque empático y profesional me dio las herramientas para controlar mi trastorno. El agendamiento online es muy conveniente.",
    fecha: "Marzo 2024",
    foto: "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: 6,
    nombre: "F. Herrera",
    servicio: "Telemedicina",
    estrellas: 5,
    texto: "La consulta online fue exactamente igual de buena que una presencial. Muy cómodo poder atenderme desde casa. La plataforma funciona perfecto y la atención fue rápida.",
    fecha: "Abril 2024",
    foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
  },
];

function Estrellas({ cantidad }: { cantidad: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={16}
          className={i <= cantidad ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  );
}

export default function Testimonios() {
  const [actual, setActual] = useState(0);
  const [direccion, setDireccion] = useState(1);

  const siguiente = useCallback(() => {
    setDireccion(1);
    setActual((prev) => (prev + 1) % testimonios.length);
  }, []);

  const anterior = () => {
    setDireccion(-1);
    setActual((prev) => (prev - 1 + testimonios.length) % testimonios.length);
  };

  const irA = (index: number) => {
    setDireccion(index > actual ? 1 : -1);
    setActual(index);
  };

  // Auto-avance cada 5 segundos
  useEffect(() => {
    const timer = setInterval(siguiente, 5000);
    return () => clearInterval(timer);
  }, [siguiente]);

  const variantes = {
    entrar: (dir: number) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
    visible: { opacity: 1, x: 0 },
    salir: (dir: number) => ({ opacity: 0, x: dir > 0 ? -80 : 80 }),
  };

  const testimonio = testimonios[actual];

  return (
    <section id="testimonios" className="py-20 px-4 bg-blue-950">
      <div className="max-w-4xl mx-auto">

        {/* Encabezado */}
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-blue-300 font-semibold text-sm uppercase tracking-widest mb-2"
          >
            Lo que dicen nuestros pacientes
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-white"
          >
            Testimonios
          </motion.h2>
        </div>

        {/* Carrusel */}
        <div className="relative">
          <AnimatePresence mode="wait" custom={direccion}>
            <motion.div
              key={actual}
              custom={direccion}
              variants={variantes}
              initial="entrar"
              animate="visible"
              exit="salir"
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 sm:p-10 text-white"
            >
              {/* Ícono de cita */}
              <Quote className="text-blue-300 mb-6 opacity-60" size={40} />

              {/* Texto */}
              <p className="text-blue-50 text-lg sm:text-xl leading-relaxed mb-8 min-h-24">
                &ldquo;{testimonio.texto}&rdquo;
              </p>

              {/* Info del paciente */}
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-blue-300 shrink-0">
                  <Image
                    src={testimonio.foto}
                    alt={testimonio.nombre}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white">{testimonio.nombre}</p>
                  <p className="text-blue-300 text-sm">{testimonio.servicio}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <Estrellas cantidad={testimonio.estrellas} />
                    <span className="text-blue-400 text-xs">{testimonio.fecha}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Botones anterior / siguiente */}
          <button
            onClick={anterior}
            className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all duration-300 hover:scale-110"
            aria-label="Anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={siguiente}
            className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all duration-300 hover:scale-110"
            aria-label="Siguiente"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Puntos indicadores */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonios.map((_, i) => (
            <button
              key={i}
              onClick={() => irA(i)}
              className={`rounded-full transition-all duration-300 ${
                i === actual
                  ? "bg-blue-300 w-6 h-2"
                  : "bg-white/30 hover:bg-white/50 w-2 h-2"
              }`}
              aria-label={`Ir al testimonio ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
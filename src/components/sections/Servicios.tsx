"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Stethoscope,
  Apple,
  Pill,
  Activity,
  Monitor,
} from "lucide-react";

const servicios = [
  {
    icono: Brain,
    nombre: "Psicología Clínica",
    descripcion: "Atención psicológica individualizada para adultos, adolescentes y niños. Tratamiento de ansiedad, depresión y más.",
    color: "bg-purple-50",
    iconColor: "text-purple-600",
    borderColor: "border-purple-100",
  },
  {
    icono: Stethoscope,
    nombre: "Medicina General",
    descripcion: "Consultas médicas integrales, diagnóstico y tratamiento de enfermedades agudas y crónicas.",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
    borderColor: "border-blue-100",
  },
  {
    icono: Apple,
    nombre: "Nutrición y Dietética",
    descripcion: "Planes nutricionales personalizados para mejorar tu salud, peso y calidad de vida.",
    color: "bg-green-50",
    iconColor: "text-green-600",
    borderColor: "border-green-100",
  },
  {
    icono: Pill,
    nombre: "Psiquiatría",
    descripcion: "Evaluación y tratamiento de trastornos mentales con enfoque farmacológico y terapéutico.",
    color: "bg-rose-50",
    iconColor: "text-rose-600",
    borderColor: "border-rose-100",
  },
  {
    icono: Activity,
    nombre: "Kinesiología",
    descripcion: "Rehabilitación física y tratamiento del dolor. Recupera tu movilidad y bienestar.",
    color: "bg-orange-50",
    iconColor: "text-orange-600",
    borderColor: "border-orange-100",
  },
  {
    icono: Monitor,
    nombre: "Telemedicina",
    descripcion: "Consultas médicas en línea desde la comodidad de tu hogar, rápidas y seguras.",
    color: "bg-teal-50",
    iconColor: "text-teal-600",
    borderColor: "border-teal-100",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Servicios() {
  return (
    <section id="servicios" className="py-20 px-4 bg-white">
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
            ¿Qué ofrecemos?
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-gray-900"
          >
            Nuestros Servicios
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-500 mt-4 max-w-xl mx-auto text-lg"
          >
            Contamos con un equipo multidisciplinario para cuidar tu salud física y mental.
          </motion.p>
        </div>

        {/* Grilla de tarjetas */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {servicios.map((servicio, index) => {
  const Icono = servicio.icono;
  return (
    <motion.div
      key={servicio.nombre}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
      className={`
        ${servicio.color} ${servicio.borderColor}
        border rounded-2xl p-6
        hover:scale-105 hover:shadow-lg
        transition-all duration-300 cursor-default
      `}
    
              >
                <div className={`${servicio.iconColor} mb-4`}>
                  <Icono size={36} strokeWidth={1.5} />
                </div>
                <h3 className="text-gray-900 font-bold text-xl mb-2">
                  {servicio.nombre}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {servicio.descripcion}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
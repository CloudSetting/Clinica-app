"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

const equipo = [
  {
    id: 1,
    nombre: "Dra. Carolina Mendoza",
    especialidad: "Psicología Clínica",
    descripcion: "Especialista en terapia cognitivo-conductual y ansiedad.",
    foto: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 2,
    nombre: "Dr. Andrés Fuentes",
    especialidad: "Medicina General",
    descripcion: "Más de 10 años de experiencia en atención primaria.",
    foto: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 3,
    nombre: "Dra. Valentina Rojas",
    especialidad: "Nutrición y Dietética",
    descripcion: "Especialista en nutrición clínica y trastornos alimentarios.",
    foto: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 4,
    nombre: "Dr. Sebastián Torres",
    especialidad: "Psiquiatría",
    descripcion: "Experto en trastornos del ánimo y salud mental adulta.",
    foto: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 5,
    nombre: "Dra. Isidora Vega",
    especialidad: "Kinesiología",
    descripcion: "Rehabilitación deportiva y tratamiento del dolor crónico.",
    foto: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 6,
    nombre: "Dr. Matías Herrera",
    especialidad: "Telemedicina",
    descripcion: "Consultas online rápidas y seguimiento de pacientes crónicos.",
    foto: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 7,
    nombre: "Dra. Francisca Muñoz",
    especialidad: "Psicología Infantil",
    descripcion: "Atención especializada en niños y adolescentes con TEA y TDAH.",
    foto: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 8,
    nombre: "Dr. Rodrigo Castillo",
    especialidad: "Medicina General",
    descripcion: "Enfoque preventivo y atención integral de enfermedades crónicas.",
    foto: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 9,
    nombre: "Dra. Camila Soto",
    especialidad: "Nutrición Deportiva",
    descripcion: "Planes nutricionales para deportistas y alto rendimiento.",
    foto: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 10,
    nombre: "Dr. Felipe Contreras",
    especialidad: "Psiquiatría Infantil",
    descripcion: "Diagnóstico y tratamiento de trastornos mentales en menores.",
    foto: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 11,
    nombre: "Dra. Antonia Lagos",
    especialidad: "Kinesiología",
    descripcion: "Fisioterapia respiratoria y rehabilitación post-operatoria.",
    foto: "https://images.unsplash.com/photo-1643297654416-05795d62e39c?q=80&w=400&auto=format&fit=crop",
  },
  {
    id: 12,
    nombre: "Dr. Ignacio Reyes",
    especialidad: "Psicología Clínica",
    descripcion: "Terapia de pareja, familiar y manejo del estrés laboral.",
    foto: "https://images.unsplash.com/photo-1638202993928-7267aad84c31?q=80&w=400&auto=format&fit=crop",
  },
];

export default function Equipo() {
  const scrollToReservas = (nombreProfesional: string) => {
    const element = document.getElementById("reservas");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      // Cuando conectes el formulario, puedes pasar el nombre así:
      // setSelectedProfesional(nombreProfesional)
      console.log("Profesional seleccionado:", nombreProfesional);
    }
  };

  return (
    <section id="equipo" className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* Encabezado */}
        <div className="text-center mb-14">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-2"
          >
            Profesionales
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-gray-900"
          >
            Nuestro Equipo
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-500 mt-4 max-w-xl mx-auto text-lg"
          >
            Profesionales certificados comprometidos con tu bienestar.
          </motion.p>
        </div>

        {/* Grilla */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
          {equipo.map((profesional, index) => (
            <motion.div
              key={profesional.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
             {/* Foto */}
<div className="aspect-square overflow-hidden relative">
  <Image
    src={profesional.foto}
    alt={profesional.nombre}
    fill
    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
    className="object-cover hover:scale-105 transition-transform duration-500"
  />
</div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
                  {profesional.nombre}
                </h3>
                <span className="text-blue-600 text-xs font-semibold mt-1 mb-2">
                  {profesional.especialidad}
                </span>
                <p className="text-gray-400 text-xs leading-relaxed flex-1">
                  {profesional.descripcion}
                </p>

                {/* Botón */}
                <button
                  onClick={() => scrollToReservas(profesional.nombre)}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white text-xs font-semibold py-2 px-3 rounded-lg transition-all duration-300"
                >
                  <Calendar size={14} />
                  Ver disponibilidad
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
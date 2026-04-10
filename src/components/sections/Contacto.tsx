"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const infoContacto = [
  {
    icono: MapPin,
    titulo: "Dirección",
    lineas: ["Av. Providencia 1234, Oficina 56", "Providencia, Santiago"],
  },
  {
    icono: Phone,
    titulo: "Teléfono",
    lineas: ["+56 2 2345 6789", "+56 9 8765 4321"],
  },
  {
    icono: Mail,
    titulo: "Correo",
    lineas: ["contacto@centromedico.cl"],
  },
  {
    icono: Clock,
    titulo: "Horarios",
    lineas: [
      "Lunes a Viernes: 8:00 – 20:00",
      "Sábado: 9:00 – 14:00",
      "Domingo: Cerrado",
    ],
  },
];

export default function Contacto() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí conectarás con el backend
  };

  return (
    <section id="contacto" className="py-20 px-4 bg-gray-50">
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
            Escríbenos
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-gray-900"
          >
            Contacto
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-500 mt-4 max-w-xl mx-auto text-lg"
          >
            Estamos aquí para ayudarte. Escríbenos o visítanos.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Columna izquierda: Formulario */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl shadow-sm p-8"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Envíanos un mensaje
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.cl"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono (opcional)
                </label>
                <input
                  type="tel"
                  placeholder="+56 9 1234 5678"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Asunto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asunto
                </label>
                <select
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-gray-600"
                >
                  <option value="">Selecciona un asunto</option>
                  <option>Consulta general</option>
                  <option>Agendar una cita</option>
                  <option>Información de servicios</option>
                  <option>Otro</option>
                </select>
              </div>

              {/* Mensaje */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje
                </label>
                <textarea
                  rows={4}
                  placeholder="Escribe tu mensaje aquí..."
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-md"
              >
                Enviar mensaje
              </button>
            </form>
          </motion.div>

          {/* Columna derecha: Mapa + Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            {/* Mapa Google Maps */}
            <div className="rounded-3xl overflow-hidden shadow-sm h-72 lg:h-80">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.9!2d-70.6!3d-33.43!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDI1JzQ4LjAiUyA3MMKwMzYnMDAuMCJX!5e0!3m2!1ses!2scl!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación del centro médico"
              />
            </div>

            {/* Info de contacto */}
            <div className="bg-white rounded-3xl shadow-sm p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {infoContacto.map((item) => {
                const Icono = item.icono;
                return (
                  <div key={item.titulo} className="flex gap-3">
                    <div className="bg-blue-50 text-blue-600 p-2 rounded-xl h-fit">
                      <Icono size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm mb-1">
                        {item.titulo}
                      </p>
                      {item.lineas.map((linea, i) => (
                        <p key={i} className="text-gray-500 text-sm">
                          {linea}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
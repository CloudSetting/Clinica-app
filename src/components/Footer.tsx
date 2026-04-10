"use client";

import { Heart } from "lucide-react";

const enlaces = [
  { nombre: "Inicio", href: "#hero" },
  { nombre: "Servicios", href: "#servicios" },
  { nombre: "Equipo", href: "#equipo" },
  { nombre: "Galería", href: "#galeria" },
  { nombre: "Testimonios", href: "#testimonios" },
  { nombre: "Contacto", href: "#contacto" },
];

const horarios = [
  { dia: "Lunes a Viernes", hora: "8:00 – 20:00" },
  { dia: "Sábado", hora: "9:00 – 14:00" },
  { dia: "Domingo", hora: "Cerrado" },
];

const redes = [
  {
    nombre: "Instagram",
    href: "https://instagram.com",
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    nombre: "Facebook",
    href: "https://facebook.com",
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    nombre: "LinkedIn",
    href: "https://linkedin.com",
    icono: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
];

export default function Footer() {
  const scrollTo = (href: string) => {
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const anio = new Date().getFullYear();

  return (
    <footer className="bg-blue-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Columna 1: Logo y descripcion */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 font-bold text-lg w-10 h-10 rounded-xl flex items-center justify-center">
              CM
            </div>
            <span className="text-xl font-bold">Centro Médico</span>
          </div>
          <p className="text-blue-200 text-sm leading-relaxed">
            Atención médica y psicológica de calidad, con un equipo multidisciplinario comprometido con tu bienestar.
          </p>
          <div className="flex gap-3 mt-2">
            {redes.map((red) => (
              <a
                key={red.nombre}
                href={red.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={red.nombre}
                className="bg-white/10 hover:bg-blue-500 p-2 rounded-xl transition-all duration-300 hover:scale-110"
              >
                {red.icono}
              </a>
            ))}
          </div>
        </div>

        {/* Columna 2: Enlaces rapidos */}
        <div>
          <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-widest">
            Enlaces rápidos
          </h4>
          <ul className="space-y-3">
            {enlaces.map((enlace) => (
              <li key={enlace.nombre}>
                <button
                  onClick={() => scrollTo(enlace.href)}
                  className="text-blue-200 hover:text-white text-sm transition-colors duration-200 inline-flex items-center gap-1 group"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    &rsaquo;
                  </span>
                  {enlace.nombre}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna 3: Horarios */}
        <div>
          <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-widest">
            Horarios
          </h4>
          <ul className="space-y-3">
            {horarios.map((h) => (
              <li key={h.dia} className="flex flex-col">
                <span className="text-white text-sm font-medium">{h.dia}</span>
                <span className="text-blue-300 text-sm">{h.hora}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna 4: Contacto */}
        <div>
          <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-widest">
            Contacto
          </h4>
          <ul className="space-y-3 text-sm text-blue-200">
            <li>Av. Providencia 1234, Of. 56</li>
            <li>Providencia, Santiago</li>
            <li className="pt-1">
              <a
                href="tel:+56223456789"
                className="hover:text-white transition-colors duration-200"
              >
                +56 2 2345 6789
              </a>
            </li>
            <li>
              <a
                href="mailto:contacto@centromedico.cl"
                className="hover:text-white transition-colors duration-200 break-all"
              >
                contacto@centromedico.cl
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-300">
          <p className="flex items-center gap-1">
            &copy; {anio} Centro Médico. Hecho con
            <Heart size={12} className="text-red-400 fill-red-400 mx-0.5" />
            en Santiago, Chile.
          </p>
          <div className="flex gap-5">
            <a
              href="/privacidad"
              className="hover:text-white transition-colors duration-200"
            >
              Política de privacidad
            </a>
            <a
              href="/terminos"
              className="hover:text-white transition-colors duration-200"
            >
              Términos de uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

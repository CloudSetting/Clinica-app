"use client";

import React, { useState, useEffect, useRef } from "react";
import { MoreVertical, LogIn } from "lucide-react";
import Link from "next/link";

// Tus importaciones originales intactas
import Hero from "@/components/sections/Hero";
import Servicios from "@/components/sections/Servicios";
import Equipo from "@/components/sections/Equipo";
import Contacto from "@/components/sections/Contacto";
import Footer from "@/components/Footer";

export default function HomePage() {
  const [menuAbierto, setMenuAbierto] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function manejarClicFuera(evento: MouseEvent) {
      // ESCUDO DE SEGURIDAD: Verificamos de forma estricta que el ref y el target existan
      if (!menuRef.current || !evento.target) return;
      
      if (!menuRef.current.contains(evento.target as Node)) {
        setMenuAbierto(false);
      }
    }
    
    document.addEventListener("mousedown", manejarClicFuera);
    return () => document.removeEventListener("mousedown", manejarClicFuera);
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen">
      
      {/* MENÚ FLOTANTE DE TRES PUNTOS */}
      <div className="fixed top-4 right-4 z-50" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="p-2.5 bg-white/80 backdrop-blur-md hover:bg-white text-slate-700 hover:text-slate-900 rounded-xl transition-all shadow-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95"
          aria-label="Menú de acceso administrativo"
        >
          <MoreVertical size={20} />
        </button>

        {menuAbierto && (
          <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100 shadow-xl overflow-hidden origin-top-right animate-fade-in">
            <div className="p-2">
              <Link
                href="/admin/login"
                onClick={() => setMenuAbierto(false)}
                className="flex items-center gap-3 w-full px-4 py-3 text-xs font-black uppercase tracking-wider text-slate-700 hover:text-blue-600 hover:bg-blue-50/60 rounded-xl transition-all"
              >
                <LogIn size={16} className="text-slate-400" />
                Ingreso de Trabajadores
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* SECCIONES ORIGINALES */}
      <Hero />
      
      <main className="grow container mx-auto px-4 md:px-8">
        <Servicios />
        <hr className="border-gray-100" />
        <Equipo />
        <hr className="border-gray-100" />
        <Contacto />
      </main>

      <Footer />
    </div>
  );
}
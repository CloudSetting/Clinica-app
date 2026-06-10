"use client";

import React, { useState, useEffect, useRef } from "react";
import { MoreVertical, LogIn } from "lucide-react";
import Link from "next/link";

export default function MenuFlotanteAcceso() {
  const [menuAbierto, setMenuAbierto] = useState<boolean>(false);
  
  // 🚀 CORREGIDO: Indicamos a TypeScript que el ref guardará un elemento HTMLDivElement
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 🚀 CORREGIDO: Tipamos el evento global del documento como MouseEvent
    function manejarClicFuera(evento: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(evento.target as Node)) {
        setMenuAbierto(false);
      }
    }
    document.addEventListener("mousedown", manejarClicFuera);
    return () => document.removeEventListener("mousedown", manejarClicFuera);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50" ref={menuRef}>
      {/* Botón de los 3 puntitos */}
      <button
        type="button"
        onClick={() => setMenuAbierto(!menuAbierto)}
        className="p-2.5 bg-white/80 backdrop-blur-md hover:bg-white text-slate-700 hover:text-slate-900 rounded-xl transition-all shadow-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95"
        aria-label="Menú de acceso"
      >
        <MoreVertical size={20} />
      </button>

      {/* Menú Desplegable (Dropdown) */}
      {menuAbierto && (
        <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100 shadow-xl overflow-hidden origin-top-right">
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
  );
}
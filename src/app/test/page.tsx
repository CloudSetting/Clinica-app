"use client";

import FormularioReserva from "@/components/reservas/FormularioReserva";

export default function TestPage() {
  return (
    /* Se cambió bg-gradient-to-br por bg-linear-to-br según la sugerencia de Tailwind */
    <main className="min-h-screen w-full bg-linear-to-br from-slate-200 via-white to-blue-50 py-12 md:py-20 px-4 flex items-center justify-center">
      
      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          {/* Badge con borde sutil */}
          <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-blue-200/50 shadow-sm">
            Entorno de Pruebas
          </span>
          
          <h1 className="text-4xl font-black text-slate-900 mt-6 tracking-tight">
            Test de Flujo de Reserva
          </h1>
          
          <p className="text-slate-500 mt-3 font-medium max-w-md mx-auto">
            Verifica que los pasos, las validaciones y el resumen funcionen correctamente.
          </p>
        </div>

        {/* Contenedor del Formulario */}
        <div className="relative">
          <FormularioReserva />
        </div>
        
        <footer className="mt-16 text-center">
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em]">
            Centro Médico — Prototipo de Agendamiento v1.0
          </p>
          <div className="w-12 h-1 bg-blue-500/20 mx-auto mt-4 rounded-full" />
        </footer>
      </div>
    </main>
  );
}
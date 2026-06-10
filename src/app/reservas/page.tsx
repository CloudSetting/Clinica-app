"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Stethoscope, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Servicio {
  id: string;
  nombre: string;
  descripcion?: string;
}

export default function ReservaPublica() {
  const router = useRouter();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  // Paso actual del formulario multi-step (por si manejas más pasos adelante)
  const [paso, setPaso] = useState<number>(1);

  // 🚀 1. CARGA DINÁMICA DESDE SUPABASE (Trae Kinesiología, Psiquiatría, Nutrición Deportiva, etc.)
  useEffect(() => {
    async function obtenerServicios() {
      try {
        setCargando(true);
        const { data, error } = await supabase
          .from("servicios") // Nombre exacto de tu tabla de especialidades
          .select("id, nombre, descripcion")
          .order("nombre", { ascending: true });

        if (error) throw error;
        if (data) setServicios(data);
      } catch (err) {
        console.error("❌ Error al cargar servicios públicos:", err);
      } finally {
        setCargando(false);
      }
    }
    obtenerServicios();
  }, []);

  // Función para el botón de regresar
  const manejarVolverAtras = () => {
    if (paso > 1) {
      setPaso(paso - 1);
    } else {
      // 🚀 Si está en el paso 1, lo saca del flujo y lo manda a la Landing Page principal
      router.push("/"); 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center justify-center text-slate-800 font-sans">
      
      {/* Encabezado Principal */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black text-blue-950 tracking-tight">Reserva tu Atención</h1>
        <p className="text-slate-500 text-xs mt-1">Sigue los pasos a continuación para agendar y pagar tu cita médica de forma segura.</p>
      </div>

      {/* Contenedor de la Tarjeta Blanca */}
      <div className="bg-white rounded-3xl w-full max-w-3xl border border-slate-200 shadow-xl overflow-hidden relative">
        
        {/* Barra superior de pasos e íconos */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between px-6">
          
          {/* 👇 BOTÓN VOLVER ATRÁS INCORPORADO */}
          <button
            type="button"
            onClick={manejarVolverAtras}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs active:scale-95"
          >
            <ArrowLeft size={14} />
            Volver
          </button>

          {/* Indicadores visuales de progreso */}
          <div className="flex items-center gap-6">
            <div className={`p-2 rounded-xl text-white ${paso >= 1 ? "bg-blue-600 shadow-sm shadow-blue-100" : "bg-slate-200"}`}>
              <Stethoscope size={16} />
            </div>
            <div className="w-4 h-0.5 bg-slate-200" />
            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">2</div>
            <div className="w-4 h-0.5 bg-slate-200" />
            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">3</div>
          </div>

          {/* Espaciador invisible para balancear el layout */}
          <div className="w-16 hidden sm:block" />
        </div>

        {/* Cuerpo del Formulario */}
        <div className="p-6 md:p-8">
          <h2 className="text-base font-black text-slate-900 uppercase tracking-wider mb-6">Selecciona el Servicio</h2>

          {cargando ? (
            <div className="text-center py-16 text-slate-400 font-medium">
              <Loader2 className="animate-spin mx-auto mb-2 text-blue-600" size={28} />
              Sincronizando especialidades disponibles...
            </div>
          ) : servicios.length === 0 ? (
            <div className="text-center py-16 text-slate-400 font-medium">
              No hay especialidades cargadas en el sistema en este momento.
            </div>
          ) : (
            /* 👇 GRID MAPEADO DINÁMICAMENTE CON TODOS LOS REGISTROS DE LA BD */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {servicios.map((servicio) => {
                const seleccionado = servicioSeleccionado === servicio.id;
                return (
                  <button
                    key={servicio.id}
                    type="button"
                    onClick={() => setServicioSeleccionado(servicio.id)}
                    className={`p-6 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between group active:scale-98 ${
                      seleccionado
                        ? "border-blue-600 bg-blue-50/30 ring-4 ring-blue-50"
                        : "border-slate-100 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between w-full mb-3">
                      <div className={`p-3 rounded-xl transition-colors ${
                        seleccionado ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                      }`}>
                        <Stethoscope size={20} />
                      </div>
                    </div>

                    <div>
                      <p className="font-black text-slate-900 text-sm tracking-tight">{servicio.nombre}</p>
                      {servicio.descripcion && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-medium">{servicio.descripcion}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
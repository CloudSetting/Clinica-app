"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Stethoscope, Loader2, User, CalendarDays, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Servicio {
  id: string;
  nombre: string;
  descripcion?: string;
}

interface Profesional {
  id: string;
  nombre?: string;
  apellido?: string;
  nombres?: string;
}

// 🚀 NUEVA INTERFAZ: Define la estructura exacta que retorna Supabase en la consulta relacional
interface SupabaseRelacionResponse {
  profesionales: Profesional | null;
}

export default function ReservaPublica() {
  const router = useRouter();
  
  // Estados de datos de Supabase
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  
  // Estados de selección
  const [servicioIdSeleccionado, setServicioIdSeleccionado] = useState<string | null>(null);
  const [servicioNombreSeleccionado, setServicioNombreSeleccionado] = useState<string | null>(null);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState<string | null>(null);
  
  // Estados de carga
  const [cargandoServicios, setCargandoServicios] = useState<boolean>(true);
  const [cargandoProfesionales, setCargandoProfesionales] = useState<boolean>(false);
  
  const [paso, setPaso] = useState<number>(1);

  // 1. Cargar servicios
  useEffect(() => {
    async function obtenerServicios() {
      try {
        setCargandoServicios(true);
        const { data, error } = await supabase
          .from("servicios")
          .select("id, nombre, descripcion")
          .order("nombre", { ascending: true });

        if (error) throw error;
        if (data) setServicios(data);
      } catch (err) {
        console.error("❌ Error al cargar servicios públicos:", err);
      } finally {
        setCargandoServicios(false);
      }
    }
    obtenerServicios();
  }, []);

  // 2. Filtrar profesionales usando la tabla intermedia (CORREGIDO SIN ANY)
  useEffect(() => {
    async function obtenerProfesionalesPorServicio() {
      if (!servicioIdSeleccionado) return;

      try {
        setCargandoProfesionales(true);
        
        const { data, error } = await supabase
          .from("profesional_servicio")
          .select(`
            profesionales (
              id,
              nombre,
              apellido
            )
          `)
          .eq("servicio_id", servicioIdSeleccionado);

        if (error) throw error;

        if (data) {
          // 🚀 CORREGIDO: Forzamos el cast del array al tipo de la interfaz relacional en lugar de usar any
          const respuestaTipada = data as unknown as SupabaseRelacionResponse[];

          const listaMedicos = respuestaTipada
            .map((item) => item.profesionales)
            .filter((profesional): profesional is Profesional => profesional !== null);
          
          setProfesionales(listaMedicos);
        }
      } catch (err) {
        console.error("❌ Error al obtener profesionales por servicio relacional:", err);
      } finally {
        setCargandoProfesionales(false);
      }
    }

    if (paso === 2) {
      obtenerProfesionalesPorServicio();
    }
  }, [servicioIdSeleccionado, paso]);

  // Funciones de avance
  const seleccionarServicioYAvanzar = (idServicio: string, nombreServicio: string) => {
    setServicioIdSeleccionado(idServicio);
    setServicioNombreSeleccionado(nombreServicio);
    setTimeout(() => {
      setPaso(2);
    }, 150);
  };

  const seleccionarProfesionalYAvanzar = (idProfesional: string) => {
    setProfesionalSeleccionado(idProfesional);
    setTimeout(() => {
      setPaso(3);
    }, 150);
  };

  const manejarVolverAtras = () => {
    if (paso === 2) {
      setProfesionalSeleccionado(null);
      setPaso(1);
    } else if (paso === 3) {
      setPaso(2);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center justify-center text-slate-800 font-sans">
      
      <div className="text-center mb-6">
        <h1 className="text-3xl font-black text-blue-950 tracking-tight">Reserva tu Atención</h1>
        <p className="text-slate-500 text-xs mt-1">Sigue los pasos a continuación para agendar tu cita médica de forma segura.</p>
      </div>

      <div className="bg-white rounded-3xl w-full max-w-3xl border border-slate-200 shadow-xl overflow-hidden relative">
        
        {/* Barra superior de progreso */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between px-6">
          <button
            type="button"
            onClick={manejarVolverAtras}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs active:scale-95"
          >
            <ArrowLeft size={14} />
            Volver
          </button>

          <div className="flex items-center gap-6">
            <div className={`p-2 rounded-xl text-white transition-all ${paso === 1 ? "bg-blue-600 shadow-sm" : "bg-emerald-600"}`}>
              <Stethoscope size={16} />
            </div>
            <div className={`w-4 h-0.5 ${paso >= 2 ? "bg-emerald-600" : "bg-slate-200"}`} />
            
            <div className={`p-2 rounded-xl text-white transition-all ${paso === 2 ? "bg-blue-600 shadow-sm" : paso > 2 ? "bg-emerald-600" : "bg-slate-200 text-slate-400"}`}>
              <User size={16} />
            </div>
            <div className={`w-4 h-0.5 ${paso >= 3 ? "bg-emerald-600" : "bg-slate-200"}`} />
            
            <div className={`p-2 rounded-xl text-white transition-all ${paso === 3 ? "bg-blue-600 shadow-sm" : "bg-slate-200 text-slate-400"}`}>
              <CalendarDays size={16} />
            </div>
          </div>

          <div className="w-16 hidden sm:block" />
        </div>

        {/* Cuerpo del Formulario */}
        <div className="p-6 md:p-8">
          
          {/* PASO 1: SELECCIÓN DE SERVICIO */}
          {paso === 1 && (
            <>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wider mb-6">Selecciona el Servicio</h2>

              {cargandoServicios ? (
                <div className="text-center py-16 text-slate-400 font-medium">
                  <Loader2 className="animate-spin mx-auto mb-2 text-blue-600" size={28} />
                  Sincronizando especialidades disponibles...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {servicios.map((servicio) => {
                    const seleccionado = servicioIdSeleccionado === servicio.id;
                    return (
                      <button
                        key={servicio.id}
                        type="button"
                        onClick={() => seleccionarServicioYAvanzar(servicio.id, servicio.nombre)}
                        className={`p-6 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between group active:scale-98 ${
                          seleccionado ? "border-blue-600 bg-blue-50/30 ring-4 ring-blue-50" : "border-slate-100 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className="mb-3">
                          <div className={`p-3 rounded-xl inline-block transition-colors ${seleccionado ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"}`}>
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
            </>
          )}

          {/* PASO 2: SELECCIÓN DE PROFESIONAL */}
          {paso === 2 && (
            <>
              <div className="mb-6">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">Selecciona al Profesional</h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Profesionales vinculados a: <span className="text-blue-600 font-bold">{servicioNombreSeleccionado}</span>
                </p>
              </div>

              {cargandoProfesionales ? (
                <div className="text-center py-16 text-slate-400 font-medium">
                  <Loader2 className="animate-spin mx-auto mb-2 text-blue-600" size={28} />
                  Buscando especialistas asignados...
                </div>
              ) : profesionales.length === 0 ? (
                <div className="text-center py-16 text-slate-400 font-medium border border-dashed rounded-2xl bg-slate-50/50">
                  <User size={32} className="mx-auto text-slate-300 mb-2" />
                  No hay profesionales agendados para este servicio actualmente.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profesionales.map((medico) => {
                    const seleccionado = profesionalSeleccionado === medico.id;
                    
                    const primerNombre = medico.nombre || medico.nombres || "";
                    const apellidoPaterno = medico.apellido || "";
                    const nombreCompleto = `${primerNombre} ${apellidoPaterno}`.trim() || "Profesional Disponible";

                    const inicialNombre = primerNombre ? primerNombre[0] : "D";
                    const inicialApellido = apellidoPaterno ? apellidoPaterno[0] : "R";

                    return (
                      <button
                        key={medico.id}
                        type="button"
                        onClick={() => seleccionarProfesionalYAvanzar(medico.id)}
                        className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 group active:scale-98 ${
                          seleccionado ? "border-blue-600 bg-blue-50/30 ring-4 ring-blue-50" : "border-slate-100 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full font-black flex items-center justify-center border text-xs tracking-wider transition-all ${
                          seleccionado ? "bg-blue-600 text-white border-blue-600" : "bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-600"
                        }`}>
                          {inicialNombre}{inicialApellido}
                        </div>

                        <div>
                          <p className="font-black text-slate-900 text-sm tracking-tight">
                            Dr(a). {nombreCompleto}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                            Especialista Asignado
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* PASO 3: CALENDARIO */}
          {paso === 3 && (
            <div className="py-12 text-center">
              <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4 animate-bounce" />
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-2">Paso 3: Horarios de Cita</h2>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                Consultando la tabla de disponibilidad para el profesional seleccionado.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
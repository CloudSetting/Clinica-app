"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Clock, Calendar, Trash2, Save, AlertCircle, Loader2 } from "lucide-react";

const DIAS = [
  { id: 1, nombre: "Lunes" },
  { id: 2, nombre: "Martes" },
  { id: 3, nombre: "Miércoles" },
  { id: 4, nombre: "Jueves" },
  { id: 5, nombre: "Viernes" },
  { id: 6, nombre: "Sábado" },
  { id: 0, nombre: "Domingo" },
];

export default function HorariosPage() {
  const [profesionales, setProfesionales] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [excepciones, setExcepciones] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Solución al error de "uncontrolled input": inicializar con strings vacíos
  const [nuevaExcepcion, setNuevaExcepcion] = useState({ fecha: "", motivo: "" });

  const fetchProfesionales = useCallback(async () => {
    const { data } = await supabase.from("profesionales").select("id, nombre, apellido");
    setProfesionales(data || []);
  }, []);

  const fetchConfiguracion = useCallback(async () => {
    if (!selectedId) return;
    setLoading(true);
    
    try {
      const { data: disp } = await supabase
        .from("disponibilidad")
        .select("*")
        .eq("profesional_id", selectedId);
      
      const baseDisp = DIAS.map(dia => {
        const existente = disp?.find(d => d.dia_semana === dia.id);
        return existente || { 
          dia_semana: dia.id, 
          hora_inicio: "09:00", 
          hora_fin: "18:00", 
          duracion_bloque: 30, 
          activo: false 
        };
      });
      setDisponibilidad(baseDisp);

      const { data: exc } = await supabase
        .from("excepciones")
        .select("*")
        .eq("profesional_id", selectedId)
        .order("fecha", { ascending: true });
      setExcepciones(exc || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    fetchProfesionales();
  }, [fetchProfesionales]);

  useEffect(() => {
    if (selectedId) {
      fetchConfiguracion();
    }
  }, [selectedId, fetchConfiguracion]);

  const handleUpdateDia = (diaId, campo, valor) => {
    setDisponibilidad(prev => prev.map(d => 
      d.dia_semana === diaId ? { ...d, [campo]: valor } : d
    ));
  };

  const guardarDisponibilidad = async () => {
    setLoading(true);
    try {
      for (const dia of disponibilidad) {
        const payload = { ...dia, profesional_id: selectedId };
        const { error } = await supabase
          .from("disponibilidad")
          .upsert(payload, { onConflict: 'profesional_id, dia_semana' });
        if (error) throw error;
      }
      alert("¡Horario guardado correctamente!");
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

const agregarExcepcion = async () => {
    // ESTO NOS DIRÁ EN LA CONSOLA SI EL BOTÓN FUNCIONA
    console.log("Botón presionado. Datos actuales:", { nuevaExcepcion, selectedId });

    if (!nuevaExcepcion.fecha) {
      alert("Debes seleccionar una fecha obligatoriamente");
      return;
    }

    if (!selectedId) {
      alert("Error: No hay un profesional seleccionado");
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("excepciones")
        .insert([
          { 
            fecha: nuevaExcepcion.fecha, 
            motivo: nuevaExcepcion.motivo || "Sin motivo", 
            profesional_id: selectedId 
          }
        ]);

      if (error) {
        console.error("Error de Supabase al insertar:", error);
        alert("Error de base de datos: " + error.message);
      } else {
        console.log("Inserción exitosa:", data);
        setNuevaExcepcion({ fecha: "", motivo: "" });
        fetchConfiguracion(); // Refresca la lista
        alert("¡Bloqueo agregado!");
      }
    } catch (err) {
      console.error("Error inesperado:", err);
    } finally {
      setLoading(false);
    }
  };

  const eliminarExcepcion = async (id) => {
    if (!confirm("¿Eliminar este bloqueo?")) return;
    await supabase.from("excepciones").delete().eq("id", id);
    fetchConfiguracion();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 text-gray-800">
      <div className="flex items-center gap-2">
        <Clock className="text-blue-600" size={24} />
        <h1 className="text-2xl font-bold">Gestión de Horarios</h1>
      </div>

      {/* Selector de Profesional */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Seleccionar Profesional</label>
        <select 
          className="w-full p-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">-- Selecciona un especialista --</option>
          {profesionales.map(p => (
            <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
          ))}
        </select>
      </div>

      {selectedId ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
          {loading && (
             <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                <Loader2 className="animate-spin text-blue-600" size={32} />
             </div>
          )}

          {/* Horario Semanal */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Calendar size={20} className="text-blue-500" /> Disponibilidad Semanal
              </h2>
              
              <div className="space-y-3">
                {DIAS.map((dia) => {
                  const config = disponibilidad.find(d => d.dia_semana === dia.id);
                  return (
                    <div key={dia.id} className={`flex flex-wrap items-center gap-4 p-4 rounded-xl border transition-all ${config?.activo ? 'bg-blue-50/30 border-blue-100' : 'bg-gray-50/50 border-transparent text-gray-400'}`}>
                      <div className="w-32 flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={config?.activo || false} 
                          onChange={(e) => handleUpdateDia(dia.id, "activo", e.target.checked)}
                        />
                        <span className="font-bold">{dia.nombre}</span>
                      </div>
                      
                      {config?.activo && (
                        <div className="flex items-center gap-3 flex-1 min-w-70">
                          <input 
                            type="time" 
                            value={config.hora_inicio || "09:00"}
                            onChange={(e) => handleUpdateDia(dia.id, "hora_inicio", e.target.value)}
                            className="border-gray-200 rounded-lg p-1.5 text-sm"
                          />
                          <span className="text-gray-400">a</span>
                          <input 
                            type="time" 
                            value={config.hora_fin || "18:00"}
                            onChange={(e) => handleUpdateDia(dia.id, "hora_fin", e.target.value)}
                            className="border-gray-200 rounded-lg p-1.5 text-sm"
                          />
                          <select 
                            value={config.duracion_bloque || 30}
                            onChange={(e) => handleUpdateDia(dia.id, "duracion_bloque", parseInt(e.target.value))}
                            className="ml-auto border-gray-200 rounded-lg p-1.5 text-xs font-bold"
                          >
                            <option value={30}>30 min</option>
                            <option value={45}>45 min</option>
                            <option value={60}>60 min</option>
                            <option value={90}>90 min</option>
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={guardarDisponibilidad}
                className="mt-8 w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
              >
                <Save size={18} /> Guardar Cambios
              </button>
            </section>
          </div>

          {/* Excepciones */}
          <div className="space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-4">Excepciones</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Fecha</label>
                  <input 
                    type="date" 
                    value={nuevaExcepcion?.fecha || ""} // Asegura valor controlado
                    onChange={(e) => setNuevaExcepcion({...nuevaExcepcion, fecha: e.target.value})}
                    className="w-full border-gray-200 rounded-xl p-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Motivo</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Feriado, Congreso..."
                    value={nuevaExcepcion?.motivo || ""} // Asegura valor controlado
                    onChange={(e) => setNuevaExcepcion({...nuevaExcepcion, motivo: e.target.value})}
                    className="w-full border-gray-200 rounded-xl p-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <button 
                  onClick={agregarExcepcion}
                  className="w-full bg-gray-800 text-white py-2.5 rounded-xl hover:bg-black transition-all font-bold text-sm"
                >
                  Bloquear Fecha
                </button>
              </div>

              <div className="mt-8 space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">Fechas Bloqueadas</p>
                {excepciones.length === 0 && <p className="text-xs text-gray-300 italic py-4">No hay bloqueos activos.</p>}
                {excepciones.map(exc => (
                  <div key={exc.id} className="flex justify-between items-center p-3 bg-red-50/50 border border-red-100 rounded-xl group">
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-red-700">{new Date(exc.fecha).toLocaleDateString('es-ES', { dateStyle: 'medium' })}</div>
                      <div className="text-[10px] text-red-500 font-medium truncate">{exc.motivo}</div>
                    </div>
                    <button onClick={() => eliminarExcepcion(exc.id)} className="text-red-200 hover:text-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
          <AlertCircle className="text-gray-300 mb-2" size={40} />
          <p className="text-gray-400 font-medium">Selecciona un profesional para gestionar su agenda semanal.</p>
        </div>
      )}
    </div>
  );
}
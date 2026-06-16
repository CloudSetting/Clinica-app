"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, DollarSign, Calendar, Clock, User, LogOut } from "lucide-react";

export default function DashboardProfesional() {
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState(null);
  const [citas, setCitas] = useState([]);
  const [metricas, setMetricas] = useState({ totalIngresos: 0, totalCitas: 0 });

  useEffect(() => {
    const cargarDatosPortal = async () => {
      try {
        setLoading(true);

        // 1. Obtener la sesión activa del profesional autenticado en Supabase
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          // Si no hay sesión activa, redirigir al login del sistema
          window.location.href = "/login";
          return;
        }

        // 2. Traer el perfil del profesional cruzándolo por la columna user_id
        const { data: perfilData, error: perfilError } = await supabase
          .from("profesionales")
          .select("*")
          .eq("user_id", user.id) // 🚀 Conexión con la cuenta individual
          .maybeSingle();

        if (perfilError || !perfilData) {
          console.error("No se encontró un perfil profesional asociado a este usuario.");
          setLoading(false);
          return;
        }
        setPerfil(perfilData);

        // 3. Traer las reservas históricas (La política RLS de Supabase filtrará automáticamente las suyas en el servidor)
        const { data: reservasData, error: reservasError } = await supabase
          .from("reservas")
          .select("*")
          .order("fecha", { ascending: false });

        if (reservasError) throw reservasError;
        setCitas(reservasData || []);

        // 4. Calcular métricas financieras e históricos según montos y estados (Requerimiento de control)
        const ingresos = (reservasData || [])
          .filter(cita => cita.pago_estado === "aprobado" || cita.estado === "confirmada")
          .reduce((sum, cita) => sum + (Number(cita.monto) || 0), 0);

        setMetricas({
          totalIngresos: ingresos,
          totalCitas: reservasData?.length || 0
        });

      } catch (error) {
        console.error("❌ Error al procesar el histórico del profesional:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatosPortal();
  }, []);

  // Función para cerrar sesión de forma segura
  const manejarCerrarSesion = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-2">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cargando portal médico...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* ==========================================
            HEADER DINÁMICO DEL PROFESIONAL
           ========================================== */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-xs mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Portal de Recepción de Pagos
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Especialista: <span className="font-bold text-blue-600">Dr(a). {perfil?.nombre} {perfil?.apellido}</span> | {perfil?.especialidad || "Medicina"}
            </p>
          </div>
          <button
            type="button"
            onClick={manejarCerrarSesion}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 px-4 py-2 rounded-xl transition-all active:scale-95 bg-white"
          >
            <LogOut size={14} /> Cerrar Sesión
          </button>
        </div>

        {/* ==========================================
            TARJETAS DE CONTROL MONETARIO Y TIEMPO
           ========================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Tarjeta 1: Histórico de ingresos percibidos */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Monto Recibido (Mes)</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                ${metricas.totalIngresos.toLocaleString("es-CL")}
              </h3>
              <p className="text-[10px] text-emerald-600 font-medium mt-1">Sincronizado con pasarela de pagos</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-xs">
              <DollarSign size={22} />
            </div>
          </div>

          {/* Tarjeta 2: Citas Totales Agendadas */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Atenciones del Histórico</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                {metricas.totalCitas}
              </h3>
              <p className="text-[10px] text-blue-600 font-medium mt-1">Citas confirmadas y agendadas</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-xs">
              <Calendar size={22} />
            </div>
          </div>
        </div>

        {/* ==========================================
            TABLA DETALLADA: HISTÓRICO DE MES
           ========================================== */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Histórico General de Consultas</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-200">
                  <th className="p-4 pl-6">Datos del Paciente</th>
                  <th className="p-4">Fecha y Bloque</th>
                  <th className="p-4">Canal de Pago</th>
                  <th className="p-4 text-right pr-6">Monto Consulta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600 font-medium">
                {citas.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-12 text-center text-slate-400 text-xs font-medium">
                      No se registran órdenes de atención o agendas para tu cuenta individual actualmente.
                    </td>
                  </tr>
                ) : (
                  citas.map((cita) => (
                    <tr key={cita.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center border border-slate-200">
                            <User size={15} />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm tracking-tight">{cita.paciente_nombre}</p>
                            <p className="text-xs text-slate-400">{cita.paciente_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{cita.fecha}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                          <Clock size={12} /> {cita.hora_inicio?.substring(0, 5)} - {cita.hora_fin?.substring(0, 5)} hrs
                        </p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                          cita.pago_estado === "approved" || cita.pago_estado === "aprobado"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {cita.pago_estado === "approved" || cita.pago_estado === "aprobado" ? "Pagado Online" : "Por Pagar"}
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6 font-black text-slate-900 text-sm">
                        ${(data => (Number(data) || 0).toLocaleString("es-CL"))(cita.monto)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
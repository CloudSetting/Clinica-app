"use client";

import React, { useState, useEffect } from "react";
import moment from "moment";
import "moment/locale/es";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Users, 
  FileText, 
  Download,
  Filter,
  Loader2
} from "lucide-react";
// ⚠️ Importamos tu instancia de Supabase configurada
import { supabase } from "@/lib/supabase";

moment.locale("es");

// Mock temporal de transacciones hasta que conectes la tabla de cobros
const HISTORIAL_PAGOS_MOCK = [
  {
    id: "REC-001",
    fecha: "2026-06-08",
    profesional_id: "p1", // Mantenlo sincronizado con tus IDs reales para ver el cruce
    profesional_nombre: "Dra. Ana María Silva",
    paciente_nombre: "Carlos Mendoza",
    servicio: "Psicología Clínica",
    monto_total: 45000,
    comision_clinica: 13500,
    pago_neto_medico: 31500,
    metodo_pago: "Mercado Pago (Tarjeta)",
    estado: "Liquidado"
  },
  {
    id: "REC-002",
    fecha: "2026-06-05",
    profesional_id: "p1",
    profesional_nombre: "Dra. Ana María Silva",
    paciente_nombre: "María José Prieto",
    servicio: "Psicología Clínica",
    monto_total: 45000,
    comision_clinica: 13500,
    pago_neto_medico: 31500,
    metodo_pago: "Mercado Pago (Efectivo)",
    estado: "Liquidado"
  }
];

export default function PortalPagosAdmin() {
  const [pagos, setPagos] = useState(HISTORIAL_PAGOS_MOCK);
  // Inicializamos profesionales como un arreglo vacío listo para la base de datos
  const [profesionales, setProfesionales] = useState([]);
  const [cargandoMedicos, setCargandoMedicos] = useState(true);
  
  // Filtros del Portal: Cambiado a "todos" por defecto para mejor experiencia de Admin
  const [filtroProfesional, setFiltroProfesional] = useState("todos"); 
  const [filtroMes, setFiltroMes] = useState(moment().format("YYYY-MM")); 

  useEffect(() => {
    async function cargarDatosPortal() {
      try {
        setCargandoMedicos(true);
        console.log("🔍 Cargando nómina de profesionales desde Supabase...");
        
        // Consultamos la tabla real usando la estructura exacta compartida
        const { data, error } = await supabase
          .from("profesionales")
          .select("id, nombre, apellido")
          .eq("activo", true)
          .order("nombre", { ascending: true });

        if (error) throw error;

        if (data) {
          // Transformamos el formato mapeando nombre + apellido para el selector
          const listaFormateada = data.map(p => ({
            id: p.id,
            nombre: `${p.nombre} ${p.apellido}`
          }));
          setProfesionales(listaFormateada);
        }

      } catch (err) {
        console.error("❌ Error al traer profesionales de Supabase:", err);
      } finally {
        setCargandoMedicos(false);
      }
    }

    cargarDatosPortal();
  }, []);

  // Lógica de filtrado unificada
  const pagosFiltrados = pagos.filter((pago) => {
    const cumpleProfesional = filtroProfesional === "todos" || pago.profesional_id === filtroProfesional;
    const cumpleMes = !filtroMes || moment(pago.fecha).format("YYYY-MM") === filtroMes;
    return cumpleProfesional && cumpleMes;
  });

  // Cálculos Financieros Acumulados
  const totalRecaudadoClinica = pagosFiltrados.reduce((acc, curr) => acc + curr.monto_total, 0);
  const totalNetoProfesional = pagosFiltrados.reduce((acc, curr) => acc + curr.pago_neto_medico, 0);
  const totalCitasCobradas = pagosFiltrados.length;
  const promedioPorCita = totalCitasCobradas > 0 ? Math.round(totalNetoProfesional / totalCitasCobradas) : 0;

  const exportarLiquidacion = () => {
    alert("📥 Descargando reporte de liquidación en formato PDF/Excel...");
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800">
      
      {/* Encabezado del Portal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Portal de Recepción de Pagos</h1>
          <p className="text-slate-500 text-xs">Historial de recaudación, comisiones y honorarios netos transferidos.</p>
        </div>

        <button
          type="button"
          onClick={exportarLiquidacion}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-blue-100"
        >
          <Download size={14} /> Exportar Período
        </button>
      </div>

      {/* --- BARRA DE FILTROS (MES Y PROFESIONAL) --- */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row gap-4 items-end">
        <div className="w-full sm:w-72">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
            <Filter size={10} /> Ver Profesional
          </label>
          <div className="relative">
            <select
              value={filtroProfesional}
              onChange={(e) => setFiltroProfesional(e.target.value)}
              disabled={cargandoMedicos}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium disabled:opacity-50 appearance-none"
            >
              <option value="todos">Todos los profesionales (Vista Admin)</option>
              {profesionales.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
            {cargandoMedicos && (
              <div className="absolute right-3 top-2.5">
                <Loader2 size={12} className="animate-spin text-slate-400" />
              </div>
            )}
          </div>
        </div>

        <div className="w-full sm:w-52">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
            <Calendar size={10} /> Período Comercial
          </label>
          <input
            type="month"
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
        
        <p className="text-slate-400 text-[11px] font-medium sm:mb-2.5 italic">
          Mostrando datos para {moment(filtroMes, "YYYY-MM").format("MMMM YYYY")}
        </p>
      </div>

      {/* --- TARJETAS DE PANEL DE LIQUIDACIÓN --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign size={22} />
          </div>
          <div>
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">A Recibir (Neto)</span>
            <p className="text-xl font-black text-slate-900">${totalNetoProfesional.toLocaleString("es-CL")}</p>
            <span className="text-[9px] text-emerald-600 font-bold">70% del valor total</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <TrendingUp size={22} />
          </div>
          <div>
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Recaudación Bruta</span>
            <p className="text-xl font-black text-slate-900">${totalRecaudadoClinica.toLocaleString("es-CL")}</p>
            <span className="text-[9px] text-slate-400 font-medium">Comisión clínica: ${(totalRecaudadoClinica - totalNetoProfesional).toLocaleString("es-CL")}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Users size={22} />
          </div>
          <div>
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Atenciones Totales</span>
            <p className="text-xl font-black text-slate-900">{totalCitasCobradas} Citas</p>
            <span className="text-[9px] text-amber-600 font-bold">Con pago confirmado</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <FileText size={22} />
          </div>
          <div>
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Honorario Promedio</span>
            <p className="text-xl font-black text-slate-900">${promedioPorCita.toLocaleString("es-CL")}</p>
            <span className="text-[9px] text-slate-400 font-medium">Valor neto por hora</span>
          </div>
        </div>

      </div>

      {/* --- TABLA DE DETALLE DE COMPROBANTES DE INGRESO --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider">Desglose analítico de transacciones</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3.5">ID Comprobante</th>
                <th className="px-6 py-3.5">Fecha Cita</th>
                <th className="px-6 py-3.5">Profesional</th>
                <th className="px-6 py-3.5">Paciente y Servicio</th>
                <th className="px-6 py-3.5">Valor Arancel</th>
                <th className="px-6 py-3.5">Retención Clínica (30%)</th>
                <th className="px-6 py-3.5 font-bold text-emerald-700">Pago Neto Médico (70%)</th>
                <th className="px-6 py-3.5 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {pagosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 font-medium">
                    No existen registros de cobros o liquidaciones para este período comercial.
                  </td>
                </tr>
              ) : (
                pagosFiltrados.map((pago) => (
                  <tr key={pago.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-500">{pago.id}</td>
                    <td className="px-6 py-4 text-slate-600 font-bold">
                      {moment(pago.fecha).format("DD [de] MMM, YYYY")}
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-bold">{pago.profesional_nombre}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{pago.paciente_nombre}</p>
                      <p className="text-[10px] text-slate-400">{pago.servicio} • {pago.metodo_pago}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      ${pago.monto_total.toLocaleString("es-CL")}
                    </td>
                    <td className="px-6 py-4 text-rose-600 font-medium">
                      -${pago.comision_clinica.toLocaleString("es-CL")}
                    </td>
                    <td className="px-6 py-4 text-emerald-700 font-black bg-emerald-50/20">
                      ${pago.pago_neto_medico.toLocaleString("es-CL")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-green-50 text-green-700 font-black px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide">
                        {pago.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
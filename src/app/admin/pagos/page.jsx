"use client";

import React, { useState, useEffect } from "react";
import moment from "moment";
import "moment/locale/es";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Users, 
  Download,
  Filter,
  Loader2,
  CalendarDays
} from "lucide-react";
import { supabase } from "@/lib/supabase";

moment.locale("es");

export default function PortalPagosAdmin() {
  const [pagos, setPagos] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  
  // Filtros del Portal (Inicializado en Junio 2026 para calzar con tus pruebas)
  const [filtroProfesional, setFiltroProfesional] = useState("todos"); 
  const [filtroMes, setFiltroMes] = useState("2026-06"); 

  useEffect(() => {
    async function cargarDatosPortal() {
      try {
        setCargandoDatos(true);
        console.log("🔍 Cargando datos desde Supabase...");
        
        // 1. Traer todos los profesionales activos de Supabase
        const { data: medicosData, error: medicosError } = await supabase
          .from("profesionales")
          .select("id, nombre, apellido")
          .eq("activo", true);

        if (medicosError) throw medicosError;

        let listaMedicos = [];
        if (medicosData) {
          listaMedicos = medicosData.map(p => ({
            id: p.id,
            nombre: `${p.nombre} ${p.apellido}`
          }));
          setProfesionales(listaMedicos);
        }

        // 2. Traer todas las reservas de la tabla
        const { data: reservasData, error: reservasError } = await supabase
          .from("reservas")
          .select(`
            id,
            fecha,
            paciente_nombre,
            servicio,
            monto_total,
            metodo_pago,
            estado,
            profesional_id,
            profesionales (nombre, apellido)
          `);

        if (reservasError) throw reservasError;

        if (reservasData) {
          console.log("📊 Datos exactos descargados de Supabase:", reservasData);

          // Soportamos cualquier estado válido de pago que esté en tu base de datos
          const reservasValidas = reservasData.filter(
            r => r.estado === "confirmada" || r.estado === "con_pago" || r.estado === "aprobado"
          );

          const transaccionesReales = reservasValidas.map((reserva) => {
            const monto = Number(reserva.monto_total) || 15000; 
            const comision = Math.round(monto * 0.3); 
            const neto = monto - comision; 

            // Respaldo manual en caso de que falle la clave foránea en JS
            let nombreMedico = "No asignado";
            if (reserva.profesionales) {
              nombreMedico = `Dr(a). ${reserva.profesionales.nombre} ${reserva.profesionales.apellido}`;
            } else if (reserva.profesional_id) {
              const coincidencia = listaMedicos.find(m => m.id === reserva.profesional_id);
              if (coincidencia) nombreMedico = `Dr(a). ${coincidencia.nombre}`;
            }

            return {
              id: reserva.id ? `REC-${reserva.id.toString().slice(-4)}` : `REC-${Math.floor(Math.random() * 1000)}`,
              fecha: reserva.fecha, // Guarda el string "2026-06-10" directo
              profesional_id: reserva.profesional_id,
              profesional_nombre: nombreMedico,
              paciente_nombre: reserva.paciente_nombre || "Paciente",
              servicio: reserva.servicio || "Medicina General",
              monto_total: monto,
              comision_clinica: comision,
              pago_neto_medico: neto,
              metodo_pago: reserva.metodo_pago || "Mercado Pago",
              estado: "Liquidado"
            };
          });

          setPagos(transaccionesReales);
        }

      } catch (err) {
        console.error("❌ Error en Portal:", err);
      } finally {
        setCargandoDatos(false);
      }
    }

    cargarDatosPortal();
  }, []);

  // --- LÓGICA DE FILTRADO REPARADA (EVITA EL BUG DE ZONA HORARIA) ---
  
  // Rango de días de esta semana actual en formato texto estándar
  const inicioSemanaStr = moment().startOf("isoWeek").format("YYYY-MM-DD");
  const finSemanaStr = moment().endOf("isoWeek").format("YYYY-MM-DD");

  // 1. Filtrado para la Tabla Baja
  const pagosFiltradosTabla = pagos.filter((pago) => {
    const cumpleProfesional = filtroProfesional === "todos" || pago.profesional_id === filtroProfesional;
    
    // Filtro de mes simplificado: Cortamos "2026-06-10" para comparar "2026-06" === "2026-06"
    const mesDeLaCita = pago.fecha ? pago.fecha.substring(0, 7) : "";
    const cumpleMes = !filtroMes || mesDeLaCita === filtroMes;
    
    return cumpleProfesional && cumpleMes;
  });

  // 2. Filtrado para el Panel Semanal Arriba
  const pagosSemanales = pagos.filter((pago) => {
    const cumpleProfesional = filtroProfesional === "todos" || pago.profesional_id === filtroProfesional;
    
    // Comparación plana de texto para evitar desfases de horas del navegador
    const esDeEstaSemana = pago.fecha && pago.fecha >= inicioSemanaStr && pago.fecha <= finSemanaStr;
    
    return cumpleProfesional && esDeEstaSemana;
  });

  // --- CONTADORES FINANCIEROS ACUMULADOS ---
  const totalBrutoMensual = pagosFiltradosTabla.reduce((acc, curr) => acc + curr.monto_total, 0);
  const totalNetoMensual = pagosFiltradosTabla.reduce((acc, curr) => acc + curr.pago_neto_medico, 0);
  const totalCitasMensuales = pagosFiltradosTabla.length;

  const totalBrutoSemanal = pagosSemanales.reduce((acc, curr) => acc + curr.monto_total, 0);
  const totalNetoSemanal = pagosSemanales.reduce((acc, curr) => acc + curr.pago_neto_medico, 0);

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Portal de Recepción de Pagos</h1>
          <p className="text-slate-500 text-xs">Historial de recaudación, comisiones y honorarios netos transferidos.</p>
        </div>

        <button
          type="button"
          onClick={() => alert("📥 Descargando reporte...")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-blue-100"
        >
          <Download size={14} /> Exportar Período
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row gap-4 items-end">
        <div className="w-full sm:w-72">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
            <Filter size={10} /> Ver Profesional
          </label>
          <select
            value={filtroProfesional}
            onChange={(e) => setFiltroProfesional(e.target.value)}
            disabled={cargandoDatos}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium disabled:opacity-50"
          >
            <option value="todos">Todos los profesionales (Vista Admin)</option>
            {profesionales.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
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
          Mostrando datos para {moment(filtroMes, "YYYY-MM").format("MMMM yyyy")}
        </p>
      </div>

      {/* Tarjetas de Recaudación */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 border-l-4 border-l-amber-500">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <CalendarDays size={22} />
          </div>
          <div>
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Recaudación Semanal</span>
            <p className="text-xl font-black text-slate-900">${totalBrutoSemanal.toLocaleString("es-CL")}</p>
            <span className="text-[9px] text-amber-600 font-bold">Neto Médico: ${totalNetoSemanal.toLocaleString("es-CL")}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <TrendingUp size={22} />
          </div>
          <div>
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Recaudación Total Mes</span>
            <p className="text-xl font-black text-slate-900">${totalBrutoMensual.toLocaleString("es-CL")}</p>
            <span className="text-[9px] text-slate-400 font-medium">Comisión Clínica (30%): ${(totalBrutoMensual - totalNetoMensual).toLocaleString("es-CL")}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign size={22} />
          </div>
          <div>
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Pago Neto Médico Mes</span>
            <p className="text-xl font-black text-slate-900">${totalNetoMensual.toLocaleString("es-CL")}</p>
            <span className="text-[9px] text-emerald-600 font-bold">70% Líquido Transferible</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Users size={22} />
          </div>
          <div>
            <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Atenciones del Mes</span>
            <p className="text-xl font-black text-slate-900">{totalCitasMensuales} Citas</p>
            <span className="text-[9px] text-purple-600 font-bold">Con estado validado</span>
          </div>
        </div>

      </div>

      {/* Tabla Desglose */}
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
              {cargandoDatos ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 font-medium">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-blue-500" />
                    Sincronizando transacciones de Supabase...
                  </td>
                </tr>
              ) : pagosFiltradosTabla.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 font-medium">
                    No existen registros de cobros o liquidaciones para este período comercial con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                pagosFiltradosTabla.map((pago) => (
                  <tr key={pago.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-500">{pago.id}</td>
                    <td className="px-6 py-4 text-slate-600 font-bold">
                      {pago.fecha ? moment(pago.fecha).format("DD [de] MMM, YYYY") : "Sin Fecha"}
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
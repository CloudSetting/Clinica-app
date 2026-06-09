"use client";

import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { 
  List, 
  Calendar as CalendarIcon, 
  Eye, 
  Bell, 
  CheckCircle, 
  XCircle, 
  Clock,
  CreditCard
} from "lucide-react";

// Configuración del idioma en español para Moment y el Calendario
moment.locale("es");
const localizer = momentLocalizer(moment);

// Definimos los datos iniciales fuera del ciclo de efectos para evitar renders en cascada
const DATOS_MOCK_RESERVAS = [
  {
    id: "1",
    paciente_nombre: "Carlos Mendoza",
    paciente_email: "carlos@email.com",
    paciente_telefono: "+56912345678",
    profesional_nombre: "Dra. Ana María Silva",
    profesional_id: "p1",
    servicio: "Psicología Clínica",
    fecha: "2026-06-10",
    hora: "10:00",
    estado: "confirmada",
    tipo_pago: "debit_card",
    mp_status: "approved",
  },
  {
    id: "2",
    paciente_nombre: "María José Prieto",
    paciente_email: "mariajose@email.com",
    paciente_telefono: "+56987654321",
    profesional_nombre: "Dr. Roberto Tobar",
    profesional_id: "p2",
    servicio: "Medicina General",
    fecha: "2026-06-12",
    hora: "15:30",
    estado: "pendiente",
    tipo_pago: "mercado_pago",
    mp_status: "pending",
  },
];

const DATOS_MOCK_PROFESIONALES = [
  { id: "p1", nombre: "Dra. Ana María Silva" },
  { id: "p2", nombre: "Dr. Roberto Tobar" },
];

export default function AdminReservasMaster() {
  const [vista, setVista] = useState("tabla");
  const [reservas, setReservas] = useState(DATOS_MOCK_RESERVAS);
  const [profesionales, setProfesionales] = useState(DATOS_MOCK_PROFESIONALES);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  // Estados de Filtros de la Barra Superior
  const [filtroProfesional, setFiltroProfesional] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // 👈 CORREGIDO: Usamos setProfesionales y setReservas simulando la carga para eliminar la alerta de ESLint
  useEffect(() => {
    async function cargarDatosReales() {
      // De momento re-asignamos los mocks simulando una respuesta asíncrona.
      // Cuando conectes Supabase, solo cambiarás estas líneas por la query real:
      setReservas(DATOS_MOCK_RESERVAS);
      setProfesionales(DATOS_MOCK_PROFESIONALES);
    }
    cargarDatosReales();
  }, []);

  // Motor de filtrado reactivo
  const reservasFiltradas = reservas.filter((reserva) => {
    const cumpleProfesional = filtroProfesional === "todos" || reserva.profesional_id === filtroProfesional;
    const cumpleEstado = filtroEstado === "todos" || reserva.estado === filtroEstado;
    
    const fechaItem = moment(reserva.fecha, "YYYY-MM-DD");
    const cumpleInicio = !fechaInicio || fechaItem.isSameOrAfter(moment(fechaInicio, "YYYY-MM-DD"), "day");
    const cumpleFin = !fechaFin || fechaItem.isSameOrBefore(moment(fechaFin, "YYYY-MM-DD"), "day");

    return cumpleProfesional && cumpleEstado && cumpleInicio && cumpleFin;
  });

  // Convertidor de formato al esquema nativo de react-big-calendar
  const eventosCalendario = reservasFiltradas.map((reserva) => {
    const [horas, minutos] = reserva.hora.split(":").map(Number);
    const start = moment(reserva.fecha, "YYYY-MM-DD").hours(horas).minutes(minutos).toDate();
    const end = moment(start).add(45, "minutes").toDate();

    return {
      id: reserva.id,
      title: `${reserva.servicio} - ${reserva.paciente_nombre}`,
      start,
      end,
      resource: reserva,
    };
  });

  const cambiarEstado = (id, nuevoEstado) => {
    setReservas(prev => prev.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r));
    if (reservaSeleccionada?.id === id) {
      setReservaSeleccionada(prev => prev ? { ...prev, estado: nuevoEstado } : null);
    }
  };

  const enviarRecordatorio = (nombre) => {
    alert(`📢 Recordatorio enviado con éxito al paciente: ${nombre}`);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800">
      
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Panel de Reservas</h1>
          <p className="text-slate-500 text-xs">Administra y supervisa los estados de citas médicas de la clínica.</p>
        </div>

        {/* Switcher de Vistas */}
        <div className="flex bg-white p-1 rounded-xl shadow-xs border border-slate-200">
          <button
            type="button"
            onClick={() => setVista("tabla")}
            className={`flex items-center gap-2 px-4 py-2 font-bold text-xs rounded-lg transition-all ${
              vista === "tabla" ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <List size={14} /> Lista
          </button>
          <button
            type="button"
            onClick={() => setVista("calendario")}
            className={`flex items-center gap-2 px-4 py-2 font-bold text-xs rounded-lg transition-all ${
              vista === "calendario" ? "bg-blue-600 text-white shadow-xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <CalendarIcon size={14} /> Calendario
          </button>
        </div>
      </div>

      {/* --- CONTROLADORES / FILTROS SUPERIORES --- */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Médico / Profesional</label>
          <select
            value={filtroProfesional}
            onChange={(e) => setFiltroProfesional(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="todos">Todos los profesionales</option>
            {profesionales.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estado Agenda</label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="todos">Todos los estados</option>
            <option value="confirmada">Confirmadas</option>
            <option value="pendiente">Pendientes</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Desde</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hasta</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
      </div>

      {/* --- RENDER DINÁMICO DE SECCIONES --- */}
      {vista === "tabla" ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Paciente</th>
                  <th className="px-6 py-3.5">Profesional</th>
                  <th className="px-6 py-3.5">Servicio</th>
                  <th className="px-6 py-3.5">Fecha y Hora</th>
                  <th className="px-6 py-3.5">Estado</th>
                  <th className="px-6 py-3.5">Confirmación Pago</th>
                  <th className="px-6 py-3.5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {reservasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 font-medium">No existen registros para los criterios seleccionados.</td>
                  </tr>
                ) : (
                  reservasFiltradas.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{r.paciente_nombre}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{r.profesional_nombre}</td>
                      <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wide">{r.servicio}</span></td>
                      <td className="px-6 py-4 text-slate-600">
                        <p className="font-bold">{moment(r.fecha).format("DD/MM/YYYY")}</p>
                        <p className="text-[10px] text-slate-400">{r.hora} hrs</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 font-black px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wide ${
                          r.estado === "confirmada" ? "bg-green-50 text-green-700" :
                          r.estado === "pendiente" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                        }`}>
                          {r.estado === "confirmada" && <CheckCircle size={10} />}
                          {r.estado === "pendiente" && <Clock size={10} />}
                          {r.estado === "cancelada" && <XCircle size={10} />}
                          {r.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <CreditCard size={12} className="text-slate-400" />
                          <div>
                            <p className="font-semibold text-slate-700 text-[11px]">{r.tipo_pago}</p>
                            <span className={`text-[9px] font-bold uppercase ${r.mp_status === "approved" ? "text-emerald-600" : "text-amber-600"}`}>
                              {r.mp_status === "approved" ? "Aprobado" : "Pendiente"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setReservaSeleccionada(r)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                            title="Ver Detalle"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => enviarRecordatorio(r.paciente_nombre)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                            title="Notificar Paciente"
                          >
                            <Bell size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs h-137.5 text-xs font-medium">
          <Calendar
            localizer={localizer}
            events={eventosCalendario}
            startAccessor="start"
            endAccessor="end"
            defaultView={Views.MONTH}
            views={["month", "week", "day"]}
            onSelectEvent={(e) => setReservaSeleccionada(e.resource)}
            style={{ height: "100%" }}
            messages={{
              next: "Siguiente",
              previous: "Anterior",
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día",
            }}
          />
        </div>
      )}

      {/* --- MODAL DE ACCIONES Y FICHA COMPLETA --- */}
      {reservaSeleccionada && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-slate-100">
            <h3 className="text-base font-black text-slate-900 mb-4 tracking-tight">Expediente de Cita</h3>
            
            <div className="space-y-3 text-xs border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block">Paciente</span> 
                <p className="text-slate-900 font-bold">{reservaSeleccionada.paciente_nombre}</p>
                <p className="text-slate-400 text-[11px]">{reservaSeleccionada.paciente_email} | {reservaSeleccionada.paciente_telefono}</p>
              </div>
              <div><span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block">Especialista</span> <p className="text-slate-700 font-medium">{reservaSeleccionada.profesional_nombre}</p></div>
              <div><span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block">Prestación</span> <p className="text-slate-700 font-medium">{reservaSeleccionada.servicio}</p></div>
              <div><span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block">Bloque Reservado</span> <p className="text-slate-700 font-medium">{moment(reservaSeleccionada.fecha).format("LL")} - {reservaSeleccionada.hora} hrs</p></div>
              <div>
                <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block mb-1">Estado Administrativo</span> 
                <span className={`font-black inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wide ${
                  reservaSeleccionada.estado === "confirmada" ? "bg-green-50 text-green-700" :
                  reservaSeleccionada.estado === "pendiente" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                }`}>{reservaSeleccionada.estado}</span>
              </div>
            </div>

            {/* Cambiar Estado desde el menú de acciones */}
            <div className="mb-6">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Modificar Estado</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => cambiarEstado(reservaSeleccionada.id, "confirmada")}
                  className="py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-[10px] font-black uppercase tracking-wide transition-colors"
                >
                  Aprobar
                </button>
                <button
                  type="button"
                  onClick={() => cambiarEstado(reservaSeleccionada.id, "pendiente")}
                  className="py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-[10px] font-black uppercase tracking-wide transition-colors"
                >
                  Pausar
                </button>
                <button
                  type="button"
                  onClick={() => cambiarEstado(reservaSeleccionada.id, "cancelada")}
                  className="py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-[10px] font-black uppercase tracking-wide transition-colors"
                >
                  Anular
                </button>
              </div>
            </div>

            {/* Botones de acción inferior */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => enviarRecordatorio(reservaSeleccionada.paciente_nombre)}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-blue-100"
              >
                <Bell size={14} /> Recordatorio
              </button>
              <button
                type="button"
                onClick={() => setReservaSeleccionada(null)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-xs uppercase tracking-wider"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
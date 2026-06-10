"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { 
  Mail, 
  X, 
  Loader2,
  List,
  Calendar as CalendarIcon
} from "lucide-react";
import { supabase } from "@/lib/supabase";

moment.locale("es");
const localizer = momentLocalizer(moment);

const COLORES_ESTADOS = {
  confirmada: { bg: "#e6f4ea", text: "#137333", border: "#137333" },
  con_pago: { bg: "#e6f4ea", text: "#137333", border: "#137333" },
  pendiente: { bg: "#fef7e0", text: "#b06000", border: "#b06000" },
  cancelada: { bg: "#fce8e6", text: "#c5221f", border: "#c5221f" },
  completada: { bg: "#e8f0fe", text: "#1a73e8", border: "#1a73e8" }
};

export default function PanelReservas() {
  const [reservas, setReservas] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [vistaActual, setVistaActual] = useState("calendario");

  // Filtros
  const [filtroProfesional, setFiltroProfesional] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // Modales
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);
  const [verDetalleModal, setVerDetalleModal] = useState(false);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);

      const { data: medicos, error: errMedicos } = await supabase
        .from("profesionales")
        .select("id, nombre, apellido");
      
      if (errMedicos) throw errMedicos;
      if (medicos) setProfesionales(medicos);

      const { data: citas, error: errCitas } = await supabase
        .from("reservas")
        .select("*");
      
      if (errCitas) throw errCitas;

      if (citas) {
        const eventosFormateados = citas.map(c => {
          const start = new Date(`${c.fecha}T${c.hora_inicio || "09:00:00"}`);
          const end = new Date(`${c.fecha}T${c.hora_fin || "10:00:00"}`);

          const doc = medicos?.find(m => m.id === c.profesional_id);
          const nombreDoc = doc ? `${doc.nombre} ${doc.apellido}` : "No asignado";

          return {
            id: c.id,
            title: `${c.paciente_nombre || "Paciente"} - ${c.servicio || "Consulta"} (${doc ? doc.nombre : 'Sin asignación'})`,
            start,
            end,
            resource: {
              ...c,
              medico_nombre: nombreDoc
            }
          };
        });

        setReservas(eventosFormateados);
      }
    } catch (err) {
      console.error("❌ Error cargando el panel de reservas:", err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const cambiarEstadoReserva = async (id, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from("reservas")
        .update({ estado: nuevoEstado })
        .eq("id", id);

      if (error) throw error;
      alert(`Estado actualizado con éxito a: ${nuevoEstado}`);
      setVerDetalleModal(false);
      cargarDatos();
    } catch (err) {
      alert("Error al actualizar el estado.");
      console.error(err);
    }
  };

  const eventosFiltrados = reservas.filter(evento => {
    const res = evento.resource;
    const cumpleProfesional = filtroProfesional === "todos" || res.profesional_id === filtroProfesional;
    const cumpleEstado = filtroEstado === "todos" || res.estado === filtroEstado;
    
    const fechaCitaStr = res.fecha;
    const cumpleRangoInicio = !fechaInicio || fechaCitaStr >= fechaInicio;
    const cumpleRangoFin = !fechaFin || fechaCitaStr <= fechaFin;

    return cumpleProfesional && cumpleEstado && cumpleRangoInicio && cumpleRangoFin;
  });

  const eventStyleGetter = (event) => {
    const estado = event.resource.estado || "pendiente";
    const estilo = COLORES_ESTADOS[estado] || COLORES_ESTADOS.pendiente;
    return {
      style: {
        backgroundColor: estilo.bg,
        color: estilo.text,
        borderRadius: '8px',
        border: `1px solid ${estilo.border}`,
        display: 'block',
        fontSize: '11px',
        fontWeight: 'bold',
        padding: '2px 6px'
      }
    };
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Sincronizando panel de citas...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800">
      
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Panel de Reservas</h1>
          <p className="text-slate-500 text-xs">Administra y supervisa los estados de citas médicas de la clínica.</p>
        </div>

        <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
          <button 
            type="button" 
            onClick={() => setVistaActual("lista")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${vistaActual === "lista" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
          >
            <List size={14} /> Lista
          </button>
          <button 
            type="button" 
            onClick={() => setVistaActual("calendario")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${vistaActual === "calendario" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-600"}`}
          >
            <CalendarIcon size={14} /> Calendario
          </button>
        </div>
      </div>

      {/* Filtros Superiores */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
            Médico / Profesional
          </label>
          <select
            value={filtroProfesional}
            onChange={(e) => setFiltroProfesional(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
          >
            <option value="todos">Todos los profesionales</option>
            {profesionales.map(p => (
              <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
            Estado Agenda
          </label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
          >
            <option value="todos">Todos los estados</option>
            <option value="confirmada">Confirmadas</option>
            <option value="con_pago">Con Pago</option>
            <option value="pendiente">Pendientes</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Desde</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Hasta</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
          />
        </div>

      </div>

      {/* Calendario */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-162.5">
        <Calendar
          localizer={localizer}
          events={eventosFiltrados}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(evento) => {
            setReservaSeleccionada(evento.resource);
            setVerDetalleModal(true);
          }}
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

      {/* Modal Acciones */}
      {verDetalleModal && reservaSeleccionada && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block mb-0.5">Gestión de Turnos</span>
                <h3 className="text-sm font-black text-slate-900">Detalle Completo de la Cita</h3>
              </div>
              <button type="button" onClick={() => setVerDetalleModal(false)} className="text-slate-400 hover:text-slate-600 p-1 bg-white border rounded-xl shadow-xs">
                <X size={14} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl border space-y-2 font-medium">
                <p><span className="text-slate-400 font-bold uppercase text-[10px] block">Paciente:</span> <span className="font-black text-slate-800 text-sm">{reservaSeleccionada.paciente_nombre}</span></p>
                <p><span className="text-slate-400 font-bold uppercase text-[10px] block">Servicio:</span> {reservaSeleccionada.servicio}</p>
                <p><span className="text-slate-400 font-bold uppercase text-[10px] block">Profesional Asignado:</span> <span className="text-blue-600 font-bold">{reservaSeleccionada.medico_nombre}</span></p>
                <p><span className="text-slate-400 font-bold uppercase text-[10px] block">Horario Cita:</span> {reservaSeleccionada.fecha} • {reservaSeleccionada.hora_inicio?.substring(0, 5)} a {reservaSeleccionada.hora_fin?.substring(0, 5)} hrs</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Cambiar Estado Operativo</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => cambiarEstadoReserva(reservaSeleccionada.id, "confirmada")} className="py-2 bg-green-50 text-green-700 font-bold rounded-xl hover:bg-green-100">Confirmar</button>
                  <button type="button" onClick={() => cambiarEstadoReserva(reservaSeleccionada.id, "pendiente")} className="py-2 bg-amber-50 text-amber-700 font-bold rounded-xl hover:bg-amber-100">Pendiente</button>
                  <button type="button" onClick={() => cambiarEstadoReserva(reservaSeleccionada.id, "cancelada")} className="py-2 bg-red-50 text-red-700 font-bold rounded-xl hover:bg-red-100">Cancelar</button>
                </div>
              </div>

              <div className="pt-2 border-t">
                <button
                  type="button"
                  onClick={() => alert(`✉️ Recordatorio enviado al email del paciente: ${reservaSeleccionada.paciente_email || 'No registrado'}`)}
                  className="w-full py-3 bg-blue-600 text-white font-black uppercase tracking-wider text-[10px] rounded-xl flex items-center justify-center gap-2 shadow-md hover:bg-blue-700"
                >
                  <Mail size={12} /> Enviar Recordatorio Manual
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Stethoscope, Loader2, User, CalendarDays, ChevronLeft, ChevronRight, ClipboardCheck, CalendarCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// --- INTERFACES DE TIPADO (TypeScript) ---
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

interface SupabaseRelacionResponse {
  profesionales: Profesional | null;
}

interface HorarioDisponible {
  hora: string;
  disponible: boolean;
}

export default function ReservaPublica() {
  const router = useRouter();
  
  // Estados de datos (Base de Datos)
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [horasDisponibles, setHorasDisponibles] = useState<HorarioDisponible[]>([]);
  
  // Estados de selección y flujo
  const [servicioIdSeleccionado, setServicioIdSeleccionado] = useState<string | null>(null);
  const [servicioNombreSeleccionado, setServicioNombreSeleccionado] = useState<string | null>(null);
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState<string | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>("");
  const [horaSeleccionada, setHoraSeleccionada] = useState<string | null>(null);
  
  // Datos del Paciente (Paso 4)
  const [pacienteNombre, setPacienteNombre] = useState<string>("");
  const [pacienteEmail, setPacienteEmail] = useState<string>("");
  const [pacienteTelefono, setPacienteTelefono] = useState<string>("");
  const [pacienteNotas, setPacienteNotas] = useState<string>("");
  
  // Estados para la navegación del calendario custom
  const [mesActual, setMesActual] = useState<Date>(new Date());
  
  // Estados de carga (Loaders)
  const [cargandoServicios, setCargandoServicios] = useState<boolean>(true);
  const [cargandoProfesionales, setCargandoProfesionales] = useState<boolean>(false);
  const [cargandoHoras, setCargandoHoras] = useState<boolean>(false);
  const [procesandoPago, setProcesandoPago] = useState<boolean>(false);
  const [procesandoReservaDirecta, setProcesandoReservaDirecta] = useState<boolean>(false);
  
  const [paso, setPaso] = useState<number>(1);

  // ==========================================
  // 📥 EFECTO 1: Cargar Servicios Iniciales
  // ==========================================
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

  // ==========================================
  // 📥 EFECTO 2: Filtrar Profesionales (Tabla Intermedia)
  // ==========================================
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
          const respuestaTipada = data as unknown as SupabaseRelacionResponse[];
          const listaMedicos = respuestaTipada
            .map((item) => item.profesionales)
            .filter((profesional): profesional is Profesional => profesional !== null);
          
          setProfesionales(listaMedicos);
        }
      } catch (err) {
        console.error("❌ Error al obtener profesionales relacionales:", err);
      } finally {
        setCargandoProfesionales(false);
      }
    }

    if (paso === 2) {
      obtenerProfesionalesPorServicio();
    }
  }, [servicioIdSeleccionado, paso]);

  // ==========================================
  // 📥 EFECTO 3: Calcular Disponibilidad Horaria Real
  // ==========================================
  useEffect(() => {
    async function obtenerHorasDisponibles() {
      if (!profesionalSeleccionado || !fechaSeleccionada) return;
      
      try {
        setCargandoHoras(true);
        const diaSemana = new Date(fechaSeleccionada + "T00:00:00").getDay();

        const { data: disponibilidad, error: errorDisp } = await supabase
          .from("disponibilidad")
          .select("hora_inicio, hora_fin")
          .eq("profesional_id", profesionalSeleccionado)
          .eq("dia_semana", diaSemana)
          .maybeSingle();

        if (errorDisp || !disponibilidad) {
          generarBloquesPorDefecto();
          return;
        }

        const { data: reservasExistentes } = await supabase
          .from("reservas")
          .select("hora_inicio")
          .eq("profesional_id", profesionalSeleccionado)
          .eq("fecha", fechaSeleccionada)
          .not("estado", "eq", "cancelada");

        const bloques: HorarioDisponible[] = [];
        let inicio = parseInt(disponibilidad.hora_inicio.split(":")[0]);
        const fin = parseInt(disponibilidad.hora_fin.split(":")[0]);
        
        while (inicio < fin) {
          const horaFormateada = `${inicio.toString().padStart(2, "0")}:00`;
          const estaOcupada = reservasExistentes?.some(r => r.hora_inicio?.substring(0, 5) === horaFormateada);
          
          bloques.push({
            hora: horaFormateada,
            disponible: !estaOcupada
          });
          inicio++;
        }
        
        setHorasDisponibles(bloques);
      } catch (err) {
        console.error("❌ Error al procesar agenda horaria:", err);
      } finally {
        setCargandoHoras(false);
      }
    }

    function generarBloquesPorDefecto() {
      const horasEstandar = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00"];
      setHorasDisponibles(horasEstandar.map(h => ({ hora: h, disponible: true })));
    }

    if (paso === 3) {
      obtenerHorasDisponibles();
    }
  }, [fechaSeleccionada, profesionalSeleccionado, paso]);

  // --- LÓGICA GENERADORA DEL CALENDARIO VISUAL ---
  const obtenerDiasDelMes = () => {
    const año = mesActual.getFullYear();
    const mes = mesActual.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const dias = [];
    let desfase = primerDia.getDay() - 1;
    if (desfase === -1) desfase = 6; 
    for (let i = 0; i < desfase; i++) dias.push(null);
    for (let i = 1; i <= ultimoDia.getDate(); i++) dias.push(new Date(año, mes, i));
    return dias;
  };

  const cambiarMes = (direccion: number) => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + direccion, 1));
  };

  const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  // ==========================================
  // 🚀 FLUJO A: CON PAGO (MERCADO PAGO)
  // ==========================================
  const iniciarFlujoPagoMercadoPago = async () => {
    try {
      setProcesandoPago(true);

      if (!pacienteNombre || !pacienteEmail || !pacienteTelefono) {
        alert("Por favor rellena todos los campos requeridos.");
        setProcesandoPago(false);
        return;
      }

      const queryRedirect = new URLSearchParams({
        profesional_id: String(profesionalSeleccionado),
        servicio: String(servicioNombreSeleccionado || "Consulta Médica"),
        fecha: String(fechaSeleccionada),
        hora_inicio: `${horaSeleccionada}:00`,
        paciente_nombre: String(pacienteNombre),
        paciente_email: String(pacienteEmail),
        paciente_telefono: String(pacienteTelefono),
        informacion_adicional: String(pacienteNotas).trim()
      }).toString();

      const respuesta = await fetch("/api/pagos/crear-preferencia", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          servicio: String(servicioNombreSeleccionado),
          precio: 15000, 
          queryRedirect: queryRedirect 
        }),
      });

      if (!respuesta.ok) throw new Error(`Código de servidor ${respuesta.status}`);

      const data = await respuesta.json();

      if (data.sandbox_init_point || data.init_point) {
        window.location.href = data.sandbox_init_point || data.init_point;
      } else {
        alert("Error al inicializar la pasarela: " + (data.error || "Desconocido"));
      }
    } catch (err) {
      const mensajeError = err instanceof Error ? err.message : "Error de Red";
      console.error("❌ Error en checkout:", err);
      alert(`No se pudo conectar con el servidor de Mercado Pago: ${mensajeError}`);
    } finally {
      setProcesandoPago(false);
    }
  };

  // ==========================================
  // 🚀 FLUJO B: SIN PAGO (RESERVA DIRECTA / POR PAGAR)
  // ==========================================
  const iniciarFlujoReservaSinPago = () => {
    try {
      if (!pacienteNombre || !pacienteEmail || !pacienteTelefono) {
        alert("Por favor rellena todos los campos requeridos.");
        return;
      }

      setProcesandoReservaDirecta(true);

      const queryParams = new URLSearchParams({
        tipo_flujo: "presencial", 
        profesional_id: String(profesionalSeleccionado),
        servicio: String(servicioNombreSeleccionado || "Consulta Médica"),
        fecha: String(fechaSeleccionada),
        hora_inicio: `${horaSeleccionada}:00`,
        paciente_nombre: String(pacienteNombre),
        paciente_email: String(pacienteEmail),
        paciente_telefono: String(pacienteTelefono),
        informacion_adicional: String(pacienteNotas).trim()
      }).toString();

      router.push(`/reservas/exito?${queryParams}`);
    } catch (err) {
      console.error("❌ Error en reserva directa:", err);
    }
  };

  // --- CONTROLADORES DE AVANCE Y RETORNO ---
  const seleccionarServicioYAvanzar = (idServicio: string, nombreServicio: string) => {
    setServicioIdSeleccionado(idServicio);
    setServicioNombreSeleccionado(nombreServicio);
    setTimeout(() => setPaso(2), 150);
  };

  const seleccionarProfesionalYAvanzar = (idProfesional: string) => {
    setProfesionalSeleccionado(idProfesional);
    setTimeout(() => setPaso(3), 150);
  };

  const manejarVolverAtras = () => {
    if (paso === 2) {
      setProfesionalSeleccionado(null);
      setPaso(1);
    } else if (paso === 3) {
      setHoraSeleccionada(null);
      setFechaSeleccionada("");
      setPaso(2);
    } else if (paso === 4) {
      setPaso(3);
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
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between px-6">
          <button
            type="button"
            onClick={manejarVolverAtras}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs active:scale-95"
          >
            <ArrowLeft size={14} /> Volver
          </button>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className={`p-2 rounded-xl text-white transition-all ${paso === 1 ? "bg-blue-600 shadow-sm" : "bg-emerald-600"}`}>
              <Stethoscope size={15} />
            </div>
            <div className={`w-3 h-0.5 ${paso >= 2 ? "bg-emerald-600" : "bg-slate-200"}`} />
            
            <div className={`p-2 rounded-xl text-white transition-all ${paso === 2 ? "bg-blue-600 shadow-sm" : paso > 2 ? "bg-emerald-600" : "bg-slate-200 text-slate-400"}`}>
              <User size={15} />
            </div>
            <div className={`w-3 h-0.5 ${paso >= 3 ? "bg-emerald-600" : "bg-slate-200"}`} />
            
            <div className={`p-2 rounded-xl text-white transition-all ${paso === 3 ? "bg-blue-600 shadow-sm" : paso > 3 ? "bg-emerald-600" : "bg-slate-200 text-slate-400"}`}>
              <CalendarDays size={15} />
            </div>
            <div className={`w-3 h-0.5 ${paso >= 4 ? "bg-emerald-600" : "bg-slate-200"}`} />

            <div className={`p-2 rounded-xl text-white transition-all ${paso === 4 ? "bg-blue-600 shadow-sm" : "bg-slate-200 text-slate-400"}`}>
              <ClipboardCheck size={15} />
            </div>
          </div>
          <div className="w-16 hidden sm:block" />
        </div>

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
                          seleccionado ? "border-blue-600 bg-blue-50/30 ring-4 ring-blue-50" : "border-slate-100 hover:border-slate-300 bg-white shadow-xs"
                        }`}
                      >
                        <div className="mb-3">
                          <div className={`p-3 rounded-xl inline-block transition-colors ${seleccionado ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"}`}>
                            <Stethoscope size={20} />
                          </div>
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm tracking-tight">{servicio.nombre}</p>
                          {servicio.descripcion && (
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-medium leading-relaxed">{servicio.descripcion}</p>
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
                    const seleccionado = profesionalSeleccionado === medico?.id;
                    const primerNombre = medico?.nombre || medico?.nombres || "";
                    const apellidoPaterno = medico?.apellido || "";
                    const nombreCompleto = `${primerNombre} ${apellidoPaterno}`.trim() || "Profesional Disponible";

                    return (
                      <button
                        key={medico?.id}
                        type="button"
                        onClick={() => seleccionarProfesionalYAvanzar(medico?.id)}
                        className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 group active:scale-98 ${
                          seleccionado ? "border-blue-600 bg-blue-50/30 ring-4 ring-blue-50" : "border-slate-100 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full font-black flex items-center justify-center border text-xs tracking-wider transition-all ${
                          seleccionado ? "bg-blue-600 text-white border-blue-600" : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          {primerNombre ? primerNombre[0] : "D"}{apellidoPaterno ? apellidoPaterno[0] : "R"}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-sm tracking-tight">Dr(a). {nombreCompleto}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Especialista Asignado</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* PASO 3: SELECCIÓN DE FECHA Y HORAS */}
          {paso === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">Selecciona Fecha y Hora</h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">Revisando disponibilidad en tiempo real.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 lg:col-span-7">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      {nombresMeses[mesActual.getMonth()]} {mesActual.getFullYear()}
                    </span>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => cambiarMes(-1)} className="p-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg active:scale-95"><ChevronLeft size={16} /></button>
                      <button type="button" onClick={() => cambiarMes(1)} className="p-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg active:scale-95"><ChevronRight size={16} /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {diasSemana.map(d => <span key={d} className="text-[10px] font-black text-slate-400 uppercase tracking-wider py-1">{d}</span>)}
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {obtenerDiasDelMes().map((fecha, index) => {
                      if (!fecha) return <div key={`empty-${index}`} className="aspect-square" />;
                      const formatoStr = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, "0")}-${fecha.getDate().toString().padStart(2, "0")}`;
                      const seleccionado = fechaSeleccionada === formatoStr;
                      const hoyStr = new Date().toISOString().split("T")[0];
                      const esPasado = formatoStr < hoyStr;

                      return (
                        <button
                          key={formatoStr}
                          type="button"
                          disabled={esPasado}
                          className={`aspect-square rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center relative ${
                            esPasado ? "bg-slate-50 text-slate-300 border-transparent cursor-not-allowed" : seleccionado ? "bg-blue-600 text-white border-blue-600 shadow-md font-black scale-105" : "bg-white text-slate-800 border-slate-100 hover:border-slate-300 active:scale-95 shadow-xs"
                          }`}
                          onClick={() => { setFechaSeleccionada(formatoStr); setHoraSeleccionada(null); }}
                        >
                          {fecha.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 lg:col-span-5 h-full min-h-75 flex flex-col">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-3">Bloques Horarios</label>
                  {!fechaSeleccionada ? (
                    <div className="text-center my-auto py-12 text-slate-400 text-xs font-medium max-w-50 mx-auto">Selecciona un día en el calendario de la izquierda para ver horas médicas.</div>
                  ) : cargandoHoras ? (
                    <div className="text-center my-auto py-12 text-slate-400 text-xs font-medium flex flex-col items-center gap-2"><Loader2 className="animate-spin text-blue-600" size={24} /> Sincronizando turnos...</div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 overflow-y-auto max-h-62.5 pr-1">
                      {horasDisponibles.map((item) => (
                        <button
                          key={item.hora}
                          type="button"
                          disabled={!item.disponible}
                          onClick={() => setHoraSeleccionada(item.hora)}
                          className={`p-2.5 text-center text-xs font-bold rounded-xl transition-all border ${
                            !item.disponible ? "bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed line-through" : horaSeleccionada === item.hora ? "bg-blue-600 text-white border-blue-600 font-black" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 active:scale-95 shadow-xs"
                          }`}
                        >
                          {item.hora} hrs
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {horaSeleccionada && (
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setPaso(4)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-95"
                  >
                    Ingresar mis datos
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PASO 4: FORMULARIO DE INFORMACIÓN PERSONAL (CON DOBLE BOTONERA) */}
          {paso === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">Datos del Paciente</h2>
                <p className="text-xs text-slate-400 mt-1 font-medium">Por favor ingresa la información de quien asistirá a la cita médica.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Nombre Completo *</label>
                  <input
                    type="text"
                    placeholder="Ej. Juan Carlos Pérez"
                    value={pacienteNombre}
                    onChange={(e) => setPacienteNombre(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:border-blue-600 focus:outline-none transition-colors font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Teléfono de Contacto *</label>
                  <input
                    type="tel"
                    placeholder="Ej. +56912345678"
                    value={pacienteTelefono}
                    onChange={(e) => setPacienteTelefono(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:border-blue-600 focus:outline-none transition-colors font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Correo Electrónico *</label>
                  <input
                    type="email"
                    placeholder="Ej. juan.perez@email.com"
                    value={pacienteEmail}
                    onChange={(e) => setPacienteEmail(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:border-blue-600 focus:outline-none transition-colors font-medium"
                  />
                  <p className="text-[10px] text-slate-400 font-medium">A esta dirección enviaremos el comprobante de pago y el link de atención.</p>
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Información Adicional</label>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Opcional</span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Ej. Indicar si posee alergias médicas, síntomas previos, patologías crónicas o el motivo de la consulta."
                    value={pacienteNotas}
                    onChange={(e) => setPacienteNotas(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:border-blue-600 focus:outline-none transition-colors font-medium resize-none"
                  />
                </div>
              </div>

              {/* CONTENEDOR DE DOBLE BOTONERA DE ACCIÓN FINAL */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-end items-center gap-3">
                
                {/* Botón: Agendar Cita de Forma Directa (Sin pasarela) */}
                <button
                  type="button"
                  disabled={procesandoPago || procesandoReservaDirecta}
                  onClick={iniciarFlujoReservaSinPago}
                  className="w-full sm:w-auto border-2 border-slate-200 hover:border-slate-300 disabled:opacity-50 text-slate-600 font-black text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 bg-white shadow-xs"
                >
                  {procesandoReservaDirecta ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Agendando Cita...
                    </>
                  ) : (
                    <>
                      <CalendarCheck size={14} />
                      Reservar sin Pago
                    </>
                  )}
                </button>

                {/* Botón: Redirección Segura a Pasarela Mercado Pago */}
                <button
                  key="btn-confirmar-pago"
                  type="button"
                  disabled={procesandoPago || procesandoReservaDirecta}
                  onClick={iniciarFlujoPagoMercadoPago}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  {procesandoPago ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Conectando Pasarela...
                    </>
                  ) : (
                    "Confirmar y Continuar a Pago"
                  )}
                </button>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
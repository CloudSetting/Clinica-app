"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  addDays, 
  isBefore, 
  startOfToday,
  parseISO
} from "date-fns";
import { es } from "date-fns/locale";
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Stethoscope, 
  Calendar as CalendarIcon, 
  CheckCircle2,
  Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const PASOS = [
  { id: 1, nombre: "Servicio", icono: <Stethoscope size={20} /> },
  { id: 2, nombre: "Profesional", icono: <User size={20} /> },
  { id: 3, nombre: "Fecha y Hora", icono: <CalendarIcon size={20} /> },
  { id: 4, nombre: "Confirmación", icono: <CheckCircle2 size={20} /> },
];

// --- PASO 1: SERVICIO ---
const Paso1Servicio = ({ reserva, setReserva, irSiguiente }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {["Medicina General", "Psicología Clínica", "Nutrición", "Kinesiología"].map((s) => (
      <button
        key={s}
        onClick={() => { setReserva({ ...reserva, servicio: s }); irSiguiente(); }}
        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
          reserva.servicio === s ? "border-blue-600 bg-blue-50 shadow-sm" : "border-gray-100 hover:border-blue-200 bg-white"
        }`}
      >
        <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><Stethoscope size={24} /></div>
        <span className="font-bold text-gray-800 text-sm">{s}</span>
      </button>
    ))}
  </div>
);

// --- PASO 2: PROFESIONAL ---
const Paso2Profesional = ({ profesionales, reserva, setReserva, irSiguiente, cargando }) => {
  const servicioBuscado = reserva.servicio?.trim().toLowerCase();
  const filtrados = profesionales.filter(p => p.especialidad?.trim().toLowerCase() === servicioBuscado);
  const listaAMostrar = filtrados.length > 0 ? filtrados : profesionales;

  if (cargando) return <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {listaAMostrar.map((p) => (
        <button
          key={p.id}
          onClick={() => { setReserva({ ...reserva, profesional: p }); irSiguiente(); }}
          className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
            reserva.profesional?.id === p.id ? "border-blue-600 bg-blue-50" : "border-gray-100 bg-white hover:border-blue-200"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 text-lg">
            {p.nombre ? p.nombre[0] : "D"}
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-900 leading-tight text-sm">{p.nombre} {p.apellido}</p>
            <p className="text-[10px] text-blue-600 font-black uppercase tracking-tighter">{p.especialidad}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

// --- PASO 3: FECHA Y HORA ---
// --- PASO 3: CALENDARIO E INTERVALOS ---
const Paso3FechaHora = ({ reserva, setReserva, irSiguiente }) => {
  const [mesActual, setMesActual] = useState(new Date());
  const [bloquesOcupados, setBloquesOcupados] = useState([]);
  const [cargandoHoras, setCargandoHoras] = useState(false);

  const fetchDispo = useCallback(async () => {
    if (!reserva.fecha || !reserva.profesional) return;
    setCargandoHoras(true);
    try {
      const { data, error } = await supabase
        .from("reservas")
        .select("hora_inicio")
        .eq("profesional_id", reserva.profesional.id)
        .eq("fecha", reserva.fecha)
        .neq("estado", "cancelada");
      
      if (error) throw error;
      const horasOcupadas = data ? data.filter(r => r.hora_inicio).map(r => r.hora_inicio.substring(0, 5)) : [];
      setBloquesOcupados(horasOcupadas);
    } catch (err) {
      console.error("Error cargando disponibilidad:", err);
    } finally {
      setCargandoHoras(false);
    }
  }, [reserva.fecha, reserva.profesional]);

  useEffect(() => { fetchDispo(); }, [fetchDispo]);

  useEffect(() => {
    if (!reserva.profesional?.id) return;
    const canal = supabase
      .channel(`realtime-reserva-${reserva.profesional.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'reservas', 
        filter: `profesional_id=eq.${reserva.profesional.id}` 
      }, 
      (payload) => { if (payload.new.fecha === reserva.fecha) fetchDispo(); })
      .subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [reserva.fecha, reserva.profesional, fetchDispo]);

  const horasBase = ["09:00", "10:00", "11:00", "12:00", "15:00", "16:00", "17:00", "18:00"];

  const renderCalendario = () => {
    const dias = [];
    const inicio = startOfWeek(startOfMonth(mesActual), { weekStartsOn: 1 });
    const fin = endOfWeek(endOfMonth(mesActual), { weekStartsOn: 1 });
    let dia = inicio;

    while (dia <= fin) {
      const cloneDia = dia;
      const esPasado = isBefore(cloneDia, startOfToday());
      const estaSeleccionado = reserva.fecha === format(cloneDia, "yyyy-MM-dd");
      const esMesActual = isSameMonth(cloneDia, mesActual);

      dias.push(
        <button
          key={cloneDia.toString()}
          disabled={esPasado || !esMesActual}
          onClick={() => setReserva({ ...reserva, fecha: format(cloneDia, "yyyy-MM-dd"), hora: "" })}
          className={`h-10 w-full flex items-center justify-center rounded-xl text-xs font-bold transition-all
            ${!esMesActual ? "opacity-0 pointer-events-none" : ""}
            ${esPasado && esMesActual ? "text-gray-300 line-through cursor-not-allowed" : ""}
            ${!esMesActual ? "" : estaSeleccionado ? "bg-blue-600 text-white shadow-lg scale-110" : "text-gray-700 hover:bg-blue-50"}
          `}
        >
          {format(cloneDia, "d")}
        </button>
      );
      dia = addDays(dia, 1);
    }
    // IMPORTANTE: grid-cols-7 con w-full asegura la distribución horizontal
    return <div className="grid grid-cols-7 gap-1 w-full mt-2">{dias}</div>;
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm w-full box-border">
        {/* Cabecera del mes */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-gray-800 capitalize text-lg">
            {format(mesActual, "MMMM yyyy", { locale: es })}
          </h3>
          <div className="flex gap-2">
            <button onClick={() => setMesActual(subMonths(mesActual, 1))} className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <ChevronLeft size={18}/>
            </button>
            <button onClick={() => setMesActual(addMonths(mesActual, 1))} className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <ChevronRight size={18}/>
            </button>
          </div>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 w-full text-center mb-2">
          {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map(d => (
            <div key={d} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {d}
            </div>
          ))}
        </div>

        {/* Los días del mes */}
        <div className="w-full">
          {renderCalendario()}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {reserva.fecha && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }} 
            className="space-y-4 w-full"
          >
             <div className="flex justify-between items-center px-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <p>Horarios disponibles: {format(parseISO(reserva.fecha), "dd 'de' MMMM")}</p>
                {cargandoHoras && <Loader2 size={14} className="animate-spin text-blue-600"/>}
             </div>
             
             {/* Grid de Horas (4 columnas) */}
             <div className="grid grid-cols-4 gap-2 w-full">
                {horasBase.map(h => {
                  const ocupado = bloquesOcupados.includes(h);
                  return (
                    <button
                      key={h}
                      disabled={ocupado}
                      onClick={() => setReserva({...reserva, hora: h})}
                      className={`py-3 rounded-xl border text-[11px] font-bold transition-all w-full
                        ${ocupado ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed" : 
                          reserva.hora === h ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"}`}
                    >
                      {h}
                    </button>
                  )
                })}
             </div>

             <div className="mt-6 pb-10">
               <button 
                 disabled={!reserva.hora} 
                 onClick={() => irSiguiente()} 
                 className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl
                   ${reserva.hora ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200" : "bg-gray-100 text-gray-300 cursor-not-allowed"}`}
               >
                 Continuar a confirmación
               </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- PASO 4: CONFIRMACIÓN ---
const Paso4Confirmar = ({ reserva, setReserva }) => {
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  const guardarReserva = async () => {
    setEnviando(true);
    const { error } = await supabase.from("reservas").insert([{
      profesional_id: reserva.profesional?.id,
      paciente_nombre: reserva.paciente.nombre,
      paciente_email: reserva.paciente.email,
      servicio: reserva.servicio,
      fecha: reserva.fecha,
      hora: reserva.hora,
      estado: "confirmada"
    }]);
    if (!error) setExito(true);
    else alert("Error: " + error.message);
    setEnviando(false);
  };

  if (exito) return (
    <div className="text-center py-10">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={40}/></div>
      <h3 className="text-2xl font-black">¡Cita Agendada!</h3>
      <button onClick={() => window.location.reload()} className="mt-6 font-bold text-blue-600 underline">Agendar otra</button>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-blue-600 rounded-4xl p-6 text-white shadow-xl shadow-blue-100">
        <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-70">Resumen</p>
        <div className="space-y-3">
          <div className="flex items-center gap-3"><Stethoscope size={18}/><p className="font-bold text-sm">{reserva.servicio}</p></div>
          <div className="flex items-center gap-3"><User size={18}/><p className="font-bold text-sm">{reserva.profesional?.nombre} {reserva.profesional?.apellido}</p></div>
          <div className="flex items-center gap-3"><CalendarIcon size={18}/><p className="font-bold text-sm">{reserva.fecha} — {reserva.hora} hrs</p></div>
        </div>
      </div>
      <div className="space-y-3">
        <input type="text" placeholder="Tu nombre" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setReserva({...reserva, paciente: {...reserva.paciente, nombre: e.target.value}})} />
        <input type="email" placeholder="Tu email" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" onChange={(e) => setReserva({...reserva, paciente: {...reserva.paciente, email: e.target.value}})} />
      </div>
      <button onClick={guardarReserva} disabled={enviando || !reserva.paciente.nombre} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all">
        {enviando ? "Guardando..." : "Finalizar Reserva"}
      </button>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function FormularioReserva() {
  const [pasoActual, setPasoActual] = useState(1);
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reserva, setReserva] = useState({ servicio: "", profesional: null, fecha: "", hora: "", paciente: { nombre: "", email: "" } });

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true);
      const { data } = await supabase.from("profesionales").select("*");
      setProfesionales(data || []);
      setLoading(false);
    };
    fetchDocs();
  }, []);

  return (
    /* SE REFORZÓ EL BORDE: border-2 border-slate-300 para que sea visible */
    <div className="max-w-2xl mx-auto bg-white rounded-4xl shadow-2xl border-2 border-slate-300 overflow-visible relative">
      <div className="bg-gray-50/80 p-6 border-b border-gray-200 flex justify-between relative rounded-t-4xl">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 px-10"></div>
        <div className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 transition-all duration-700" style={{ width: `${((pasoActual - 1) / (PASOS.length - 1)) * 100}%` }}></div>
        {PASOS.map((p) => (
          <div key={p.id} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${pasoActual >= p.id ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200" : "bg-white border-gray-100 text-gray-300"}`}>
            {p.icono}
          </div>
        ))}
      </div>

      <div className="p-8 md:p-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">{PASOS[pasoActual - 1].nombre}</h2>
          {pasoActual > 1 && <button onClick={() => setPasoActual(pasoActual - 1)} className="text-gray-400 font-bold text-xs uppercase flex items-center gap-1 hover:text-blue-600 transition-colors"><ChevronLeft size={14}/> Volver</button>}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={pasoActual} initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }}>
            {pasoActual === 1 && <Paso1Servicio reserva={reserva} setReserva={setReserva} irSiguiente={() => setPasoActual(2)} />}
            {pasoActual === 2 && <Paso2Profesional profesionales={profesionales} reserva={reserva} setReserva={setReserva} irSiguiente={() => setPasoActual(3)} cargando={loading} />}
            {pasoActual === 3 && <Paso3FechaHora reserva={reserva} setReserva={setReserva} irSiguiente={() => setPasoActual(4)} />}
            {pasoActual === 4 && <Paso4Confirmar reserva={reserva} setReserva={setReserva} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
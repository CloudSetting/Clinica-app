"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, addDays, isBefore, startOfToday 
} from "date-fns";
import { es } from "date-fns/locale";
import { 
  ChevronLeft, ChevronRight, User, Stethoscope, 
  Calendar as CalendarIcon, Loader2, CreditCard 
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const PASOS = [
  { id: 1, nombre: "Servicio", icono: <Stethoscope size={20} /> },
  { id: 2, nombre: "Profesional", icono: <User size={20} /> },
  { id: 3, nombre: "Fecha y Hora", icono: <CalendarIcon size={20} /> },
  { id: 4, nombre: "Pago y Confirmación", icono: <CreditCard size={20} /> },
];

// --- PASO 1: SELECCIÓN DE SERVICIO ---
const Paso1Servicio = ({ reserva, setReserva, irSiguiente }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {["Medicina General", "Psicología Clínica", "Nutrición", "Kinesiología"].map((s) => (
      <button
        key={s}
        type="button"
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

// --- PASO 2: SELECCIÓN DE PROFESIONAL (REPARADO CON TRIM) ---
const Paso2Profesional = ({ profesionales, reserva, setReserva, irSiguiente, cargando }) => {
  const servicioBuscado = reserva.servicio?.trim().toLowerCase();
  
  // .trim() elimina cualquier espacio rebelde al inicio o final que venga de la Base de Datos
  const filtrados = profesionales.filter(p => p.especialidad?.trim().toLowerCase() === servicioBuscado);
  const listaAMostrar = filtrados.length > 0 ? filtrados : profesionales;

  if (cargando) return <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {listaAMostrar.map((p) => (
        <button
          key={p.id}
          type="button"
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

// --- PASO 3: CALENDARIO Y DISPONIBILIDAD HORARIA ---
const Paso3FechaHora = ({ reserva, setReserva, irSiguiente }) => {
  const [mesActual, setMesActual] = useState(new Date());
  const [bloquesOcupados, setBloquesOcupados] = useState([]);
  const [cargandoHoras, setCargandoHoras] = useState(false);

  const fetchDispo = useCallback(async () => {
    if (!reserva.fecha || !reserva.profesional) return;
    setCargandoHoras(true);
    try {
      const { data } = await supabase
        .from("reservas")
        .select("hora_inicio") 
        .eq("profesional_id", reserva.profesional.id)
        .eq("fecha", reserva.fecha)
        .neq("estado", "cancelada");
        
      setBloquesOcupados(
        data ? data.map(r => r.hora_inicio ? r.hora_inicio.substring(0, 5) : "") : []
      );
    } catch (err) { 
      console.error("Error al obtener disponibilidad:", err); 
    } finally { 
      setCargandoHoras(false); 
    }
  }, [reserva.fecha, reserva.profesional]);

  useEffect(() => { fetchDispo(); }, [fetchDispo]);

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
        <button key={cloneDia.toString()} type="button" disabled={esPasado || !esMesActual} onClick={() => setReserva({ ...reserva, fecha: format(cloneDia, "yyyy-MM-dd"), hora: "" })}
          className={`h-10 w-full flex items-center justify-center rounded-xl text-xs font-bold transition-all ${!esMesActual ? "opacity-0 pointer-events-none" : esPasado ? "text-gray-300 line-through" : estaSeleccionado ? "bg-blue-600 text-white shadow-lg" : "text-gray-700 hover:bg-blue-50"}`}
        >{format(cloneDia, "d")}</button>
      );
      dia = addDays(dia, 1);
    }
    return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>{dias}</div>;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-gray-800 capitalize">{format(mesActual, "MMMM yyyy", { locale: es })}</h3>
          <div className="flex gap-2">
            <button type="button" onClick={() => setMesActual(subMonths(mesActual, 1))} className="p-2 bg-gray-50 rounded-xl"><ChevronLeft size={18}/></button>
            <button type="button" onClick={() => setMesActual(addMonths(mesActual, 1))} className="p-2 bg-gray-50 rounded-xl"><ChevronRight size={18}/></button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '8px' }}>
          {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map(d => <div key={d} className="text-[10px] font-black text-gray-400 uppercase">{d}</div>)}
        </div>
        {renderCalendario()}
      </div>
      {reserva.fecha && (
        <div className="space-y-4">
          {cargandoHoras ? (
            <div className="text-center py-4"><Loader2 className="animate-spin mx-auto text-blue-600" size={20} /></div>
          ) : (
            <>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Horarios disponibles:</p>
              <div className="grid grid-cols-4 gap-2">
                {horasBase.map(h => (
                  <button key={h} type="button" disabled={bloquesOcupados.includes(h)} onClick={() => setReserva({...reserva, hora: h})}
                    className={`py-3 rounded-xl border text-[11px] font-bold transition-all ${bloquesOcupados.includes(h) ? "bg-gray-50 text-gray-200 line-through" : reserva.hora === h ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"}`}
                  >{h}</button>
                ))}
              </div>
            </>
          )}
          <button type="button" disabled={!reserva.hora || cargandoHoras} onClick={() => irSiguiente()} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest mt-4 shadow-xl disabled:opacity-50">Continuar</button>
        </div>
      )}
    </div>
  );
};

// --- PASO 4: FORMULARIO Y PASARELA (CALCULA HORA_FIN) ---
const Paso4Confirmar = ({ reserva, setReserva }) => {
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState({});

  const validarForm = () => {
    const err = {};
    if (!reserva.paciente.nombre || reserva.paciente.nombre.length < 2) err.nombre = "Requerido";
    if (!reserva.paciente.email || !reserva.paciente.email.includes("@")) err.email = "Email inválido";
    if (!reserva.paciente.telefono || reserva.paciente.telefono.length < 8) err.telefono = "Formato inválido";
    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const iniciarPago = async () => {
    if (!validarForm()) return;
    setEnviando(true);
    
    // Calculamos la hora de fin (+1 hora) para no romper el NOT NULL de Supabase
    const horaEntera = parseInt(reserva.hora.split(":")[0], 10);
    const horaFinCalculada = `${String(horaEntera + 1).padStart(2, "0")}:00`;

    console.log("🚀 Generando preferencia en Mercado Pago con parámetros URL seguros...");
    
    try {
      // 1. Preparamos los parámetros limpios que queremos que vuelvan a nuestra página de éxito
      const datosUrl = new URLSearchParams({
        profesional_id: reserva.profesional?.id || "",
        paciente_nombre: reserva.paciente.nombre || "",
        paciente_email: reserva.paciente.email.trim().toLowerCase(), 
        paciente_telefono: reserva.paciente.telefono || "",
        fecha: reserva.fecha || "",
        hora_inicio: reserva.hora || "",
        hora_fin: horaFinCalculada,
        servicio: reserva.servicio || ""
      });

      // 2. Llamamos a tu API pasándole los datos
      const response = await fetch('/api/pagos/crear-preferencia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servicio: reserva.servicio,
          precio: 15000,
          // Mandamos los datos estructurados al backend
          reservaData: {
            profesional_id: reserva.profesional?.id,
            paciente_nombre: reserva.paciente.nombre,
            paciente_email: reserva.paciente.email.trim().toLowerCase(),
            paciente_telefono: reserva.paciente.telefono,
            fecha: reserva.fecha,
            hora_inicio: reserva.hora,
            hora_fin: horaFinCalculada
          },
          // 👈 TRUCO MAESTRO: Forzamos a Mercado Pago a que al volver exitosamente, 
          // inyecte los datos directamente en la barra de direcciones de nuestra página de éxito
          queryRedirect: datosUrl.toString()
        })
      });

      const data = await response.json();

      if (data.init_point) {
        console.log("💳 Enlace de Mercado Pago listo. Redirigiendo...");
        window.location.href = data.sandbox_init_point || data.init_point;
      } else {
        throw new Error(data.details || "No se pudo generar la pasarela de pago");
      }
    } catch (err) {
      console.error("❌ Error API Pago:", err);
      alert(`Error al conectar con Mercado Pago: ${err.message}`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200 grid grid-cols-2 gap-4 text-[11px]">
        <div className="col-span-2 border-b pb-2 flex justify-between"><span className="font-black text-blue-600 uppercase">Resumen</span><span className="font-bold">$15.000</span></div>
        <div><p className="text-gray-400 font-bold uppercase">Profesional</p><p className="font-black text-gray-700">{reserva.profesional?.nombre} {reserva.profesional?.apellido}</p></div>
        <div><p className="text-gray-400 font-bold uppercase">Servicio</p><p className="font-black text-gray-700">{reserva.servicio}</p></div>
        <div><p className="text-gray-400 font-bold uppercase">Fecha</p><p className="font-black text-gray-700">{reserva.fecha}</p></div>
        <div><p className="text-gray-400 font-bold uppercase">Hora</p><p className="font-black text-gray-700">{reserva.hora} hrs</p></div>
      </div>

      <div className="space-y-4">
        <input 
          placeholder="Nombre completo" 
          value={reserva.paciente.nombre}
          className={`w-full p-4 border rounded-2xl outline-none ${errores.nombre ? 'border-red-500 bg-red-50' : 'border-gray-100'}`} 
          onChange={(e) => setReserva({...reserva, paciente: {...reserva.paciente, nombre: e.target.value}})} 
        />
        <input 
          placeholder="Email" 
          value={reserva.paciente.email}
          className={`w-full p-4 border rounded-2xl outline-none ${errores.email ? 'border-red-500 bg-red-50' : 'border-gray-100'}`} 
          onChange={(e) => setReserva({...reserva, paciente: {...reserva.paciente, email: e.target.value}})} 
        />
        <input 
          placeholder="Teléfono" 
          value={reserva.paciente.telefono}
          className={`w-full p-4 border rounded-2xl outline-none ${errores.telefono ? 'border-red-500 bg-red-50' : 'border-gray-100'}`} 
          onChange={(e) => setReserva({...reserva, paciente: {...reserva.paciente, telefono: e.target.value}})} 
        />
        <textarea 
          placeholder="Notas adicionales (opcional)..." 
          value={reserva.notas}
          className="w-full p-4 border border-gray-100 rounded-2xl h-24 resize-none outline-none focus:border-blue-400" 
          onChange={(e) => setReserva({...reserva, notas: e.target.value})}
        />
      </div>

      <button 
        type="button"
        onClick={(e) => { e.preventDefault(); iniciarPago(); }} 
        disabled={enviando}
        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest transition-opacity shadow-xl"
        style={{ opacity: enviando ? 0.5 : 1, border: 'none', cursor: 'pointer' }}
      >
        {enviando ? "PROCESANDO..." : "PAGAR Y RESERVAR $15.000"}
      </button>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL EXPORTADO ---
export default function FormularioReserva() {
  const [pasoActual, setPasoActual] = useState(1);
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reserva, setReserva] = useState({ 
    servicio: "", 
    profesional: null, 
    fecha: "", 
    hora: "", 
    notas: "", 
    paciente: { nombre: "", email: "", telefono: "" } 
  });

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const { data } = await supabase.from("profesionales").select("*");
        setProfesionales(data || []);
      } catch (err) {
        console.error("Error cargando profesionales:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-4xl shadow-2xl border-2 border-slate-100 overflow-hidden">
      <div className="bg-slate-50/50 p-6 flex justify-between border-b">
        {PASOS.map((p) => (
          <div key={p.id} className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${pasoActual >= p.id ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-100 text-gray-300"}`}>{p.icono}</div>
        ))}
      </div>

     <div className="p-8 min-h-137.5">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900">{PASOS[pasoActual - 1].nombre}</h2>
          {pasoActual > 1 && (
            <button type="button" onClick={() => setPasoActual(pasoActual - 1)} className="text-gray-400 font-bold text-xs uppercase flex items-center gap-1 hover:text-gray-600 transition-colors">
              <ChevronLeft size={14}/> Volver
            </button>
          )}
        </div>
        
        {pasoActual === 1 && <Paso1Servicio reserva={reserva} setReserva={setReserva} irSiguiente={() => setPasoActual(2)} />}
        {pasoActual === 2 && <Paso2Profesional profesionales={profesionales} reserva={reserva} setReserva={setReserva} irSiguiente={() => setPasoActual(3)} cargando={loading} />}
        {pasoActual === 3 && <Paso3FechaHora reserva={reserva} setReserva={setReserva} irSiguiente={() => setPasoActual(4)} />}
        {pasoActual === 4 && <Paso4Confirmar reserva={reserva} setReserva={setReserva} />}
      </div>
    </div>
  );
}
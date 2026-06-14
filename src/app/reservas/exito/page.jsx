"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase"; 

function ContenidoExito() {
  const searchParams = useSearchParams();
  const [guardando, setGuardando] = useState(true);
  const [errorSupabase, setErrorSupabase] = useState(null);

  // Parámetros estándar de Mercado Pago
  const status = searchParams.get("status");
  const paymentId = searchParams.get("payment_id");
  const preferenceId = searchParams.get("preference_id");
  
  // Detector de reserva directa sin pago
  const tipoFlujo = searchParams.get("tipo_flujo");
  const esReservaPresencial = tipoFlujo === "presencial";
  
  // Condición unificada de entrada
  const procederConRegistro = status === "approved" || esReservaPresencial;

  useEffect(() => {
    const registrarCitaReal = async () => {
      if (!procederConRegistro) {
        setGuardando(false);
        return;
      }

      try {
        console.log("💾 Insertando registro sincronizado en Supabase...");

        const horaInicioStr = searchParams.get("hora_inicio") || "09:00:00";
        
        let horaFinStr = searchParams.get("hora_fin");
        if (!horaFinStr && horaInicioStr) {
          const horaEntera = parseInt(horaInicioStr.split(":")[0]);
          horaFinStr = `${(horaEntera + 1).toString().padStart(2, "0")}:00:00`;
        }

        const estadoTipoPago = esReservaPresencial ? "por_pagar" : "con_pago";
        const estadoPagoDetalle = esReservaPresencial ? "pendiente" : "aprobado";

        // Mapeo directo y estricto hacia las columnas reales de tu tabla 'reservas'
        const { error } = await supabase
          .from("reservas")
          .insert([
            {
              profesional_id: searchParams.get("profesional_id") || null, 
              servicio: searchParams.get("servicio") || "Consulta Médica", 
              paciente_nombre: searchParams.get("paciente_nombre") || "Paciente Autoconfirmado",
              paciente_email: searchParams.get("paciente_email") || "correo@temporal.cl",
              paciente_telefono: searchParams.get("paciente_telefono") || "+56900000000",
              
              // 🚀 SINCRONIZADO: Ahora guarda directo en la columna text que acabas de crear
              informacion_adicional: searchParams.get("informacion_adicional") || null, 
              
              fecha: searchParams.get("fecha") || new Date().toISOString().split('T')[0],
              hora_inicio: horaInicioStr,
              hora_fin: horaFinStr || "10:00:00",
              estado: "confirmada", 
              tipo_pago: estadoTipoPago, 
              pago_id: esReservaPresencial ? "RESERVA_SIN_PAGO" : (paymentId || preferenceId),
              pago_estado: estadoPagoDetalle 
            }
          ]);

        if (error) throw error;
        
        console.log("🎉 ¡Cita registrada exitosamente en Supabase!");
      } catch (err) {
        console.error("❌ Error Supabase:", err);
        setErrorSupabase(err.message || "Error al intentar registrar el turno.");
      } finally {
        setGuardando(false);
      }
    };

    registrarCitaReal();
  }, [procederConRegistro, esReservaPresencial, paymentId, preferenceId, searchParams, setErrorSupabase]);

  // RENDER A: Procesando Registro
  if (procederConRegistro && guardando) {
    return (
      <div className="text-center py-10 max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100 animate-pulse">
        <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
        <h3 className="text-xl font-bold text-slate-900">Confirmando tu reserva...</h3>
        <p className="text-slate-500 text-sm mt-2">Estamos guardando tu espacio médico en la base de datos de la clínica.</p>
      </div>
    );
  }

  // RENDER B: Éxito total
  if (procederConRegistro && !errorSupabase) {
    return (
      <div className="text-center py-10 max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">¡Cita Agendada!</h3>
        <p className="text-slate-500 text-xs mt-2 leading-relaxed">
          {esReservaPresencial 
            ? "Tu espacio ha sido bloqueado con éxito. Recuerda realizar el pago de la consulta directamente en la recepción de la clínica."
            : "Tu pago ha sido procesado con éxito y la cita médica quedó agendada en nuestro sistema."}
        </p>
        
        <p className="text-[10px] bg-slate-100 text-slate-500 font-mono py-1 px-3 rounded-lg mt-4 inline-block border font-bold">
          {esReservaPresencial ? "Modo: Pago Presencial" : `Comprobante MP: ${paymentId}`}
        </p>

        <div className="mt-6 space-y-2 text-xs">
          <button type="button" onClick={() => window.location.href = "/reservas"} className="w-full py-3 bg-blue-600 text-white font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 shadow-md transition-all active:scale-95">Agendar otra cita</button>
          <button type="button" onClick={() => window.location.href = "/"} className="w-full py-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition-all">Volver al inicio público</button>
        </div>
      </div>
    );
  }

  // RENDER C: Fallo o Error
  return (
    <div className="text-center py-10 max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
      <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
        <XCircle size={40} />
      </div>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Hubo un problema</h3>
      <p className="text-slate-500 text-xs mt-2 max-w-xs mx-auto leading-relaxed">
        {errorSupabase ? `Error crítico del servidor: ${errorSupabase}` : "La pasarela de Mercado Pago no pudo validar los fondos de la transacción automáticamente."}
      </p>
      <div className="mt-6">
        <button type="button" onClick={() => window.location.href = "/reservas"} className="w-full py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all hover:bg-slate-800 active:scale-95 shadow-md">Intentar agendar nuevamente</button>
      </div>
    </div>
  );
}

export default function PaginaExito() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <Suspense fallback={
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-2" size={40} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando verificación...</p>
        </div>
      }>
        <ContenidoExito />
      </Suspense>
    </main>
  );
}
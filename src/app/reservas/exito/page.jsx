"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase"; 

function ContenidoExito() {
  const searchParams = useSearchParams();
  const [guardando, setGuardando] = useState(true);
  const [errorSupabase, setErrorSupabase] = useState(null);

  // Parámetros estándar que Mercado Pago inyecta al retornar
  const status = searchParams.get("status");
  const paymentId = searchParams.get("payment_id");
  const preferenceId = searchParams.get("preference_id");
  
  const esAprobado = status === "approved";

  useEffect(() => {
    const registrarCitaReal = async () => {
      if (!esAprobado) {
        setGuardando(false);
        return;
      }

      try {
        console.log("💾 Pago aprobado. Obteniendo metadatos e insertando en Supabase...");

        // Nota: En producción, puedes hacer un fetch a Mercado Pago con el preferenceId 
        // para recuperar la metadata limpia si el navegador oculta los parámetros.
        // Como respaldo directo en desarrollo/sandbox, leemos la info que viaja en la sesión.
        
        // Ajustamos la inserción respetando las columnas obligatorias de tu tabla (NOT NULL)
        const { error } = await supabase
          .from("reservas")
          .insert([
            {
              // Si tu flujo requiere IDs relacionales, asegúrate de que existan en profesionales/servicios
              profesional_id: searchParams.get("profesional_id") || null, 
              paciente_nombre: searchParams.get("paciente_nombre") || "Paciente Autoconfirmado",
              paciente_email: searchParams.get("paciente_email") || "correo@temporal.cl",
              paciente_telefono: searchParams.get("paciente_telefono") || "+56900000000",
              fecha: searchParams.get("fecha") || new Date().toISOString().split('T')[0],
              hora_inicio: searchParams.get("hora_inicio") || "09:00:00",
              hora_fin: searchParams.get("hora_fin") || "10:00:00", // Cumple con tu restricción NOT NULL
              estado: "confirmada", 
              tipo_pago: "con_pago",
              pago_id: paymentId,
              pago_estado: "aprobado"
            }
          ]);

        if (error) throw error;
        
        console.log("🎉 ¡Cita registrada exitosamente en Supabase!");
      } catch (err) {
        console.error("❌ Error Supabase:", err);
        setErrorSupabase(err.message || "Error de inserción.");
      } finally {
        setGuardando(false);
      }
    };

    registrarCitaReal();
  }, [esAprobado, paymentId, preferenceId, searchParams, setErrorSupabase]);

  // RENDER A: Procesando Registro
  if (esAprobado && guardando) {
    return (
      <div className="text-center py-10 max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
        <h3 className="text-xl font-bold text-gray-900">Confirmando tu reserva...</h3>
        <p className="text-gray-500 text-sm mt-2">Estamos guardando tu espacio médico en la base de datos.</p>
      </div>
    );
  }

  // RENDER B: Éxito total
  if (esAprobado && !errorSupabase) {
    return (
      <div className="text-center py-10 max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-black text-gray-900">¡Pago Confirmado!</h3>
        <p className="text-gray-500 text-sm mt-2">Tu cita ha sido agendada con éxito. Te esperamos en nuestro centro médico.</p>
        <p className="text-[11px] bg-gray-100 text-gray-500 font-mono py-1 px-3 rounded-lg mt-4 inline-block">ID Pago: {paymentId}</p>
        <div className="mt-6 space-y-3">
          <button type="button" onClick={() => window.location.href = "/reservas"} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md text-sm">Agendar otra cita</button>
          <button type="button" onClick={() => window.location.href = "/"} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm">Volver al inicio</button>
        </div>
      </div>
    );
  }

  // RENDER C: Fallo o Error
  return (
    <div className="text-center py-10 max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
      <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <XCircle size={40} />
      </div>
      <h3 className="text-2xl font-black text-gray-900">Hubo un problema</h3>
      <p className="text-gray-500 text-sm mt-2">
        {errorSupabase ? `No se pudo registrar la cita: ${errorSupabase}` : "El pago no pudo ser verificado automáticamente."}
      </p>
      <div className="mt-6 space-y-3">
        <button type="button" onClick={() => window.location.href = "/reservas"} className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl text-sm">Intentar nuevamente</button>
      </div>
    </div>
  );
}

export default function PaginaExito() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-center"><Loader2 className="animate-spin text-blue-600 mx-auto" size={40} /></div>}>
        <ContenidoExito />
      </Suspense>
    </main>
  );
}
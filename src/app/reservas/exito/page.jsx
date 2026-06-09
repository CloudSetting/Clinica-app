"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase"; 

function ContenidoExito() {
  const searchParams = useSearchParams();
  const [guardando, setGuardando] = useState(true);
  const [errorSupabase, setErrorSupabase] = useState(null);

  // Capturamos los parámetros esenciales que vienen desde el formulario
  const status = searchParams.get("status");
  const paymentId = searchParams.get("payment_id");
  const pacienteNombre = searchParams.get("paciente_nombre");
  
  const esAprobado = status === "approved";

  useEffect(() => {
    const registrarCitaTrasPago = async () => {
      // Si el pago no está aprobado o no contiene los datos del paciente, detenemos el proceso
      if (!esAprobado || !pacienteNombre) {
        setGuardando(false);
        return;
      }

      try {
        console.log("💾 ¡Pago confirmado en URL! Insertando cita en Supabase...");

        // Insertamos la fila mapeando exactamente los campos de tu tabla 'reservas'
        const { error } = await supabase
          .from("reservas")
          .insert([
            {
              profesional_id: searchParams.get("profesional_id") || null,
              fecha: searchParams.get("fecha"),
              hora_inicio: searchParams.get("hora_inicio"), 
              paciente_nombre: pacienteNombre,
              paciente_email: searchParams.get("paciente_email"),
              paciente_telefono: searchParams.get("paciente_telefono"),
              servicio: searchParams.get("servicio"),
              estado: "confirmada", // La cita se registra directamente como confirmada/pagada
              tipo_pago: "mercado_pago_sandbox",
              pago_id: paymentId
            }
          ]);

        if (error) throw error;
        
        console.log("🎉 Cita guardada de forma exitosa en Supabase.");
      } catch (err) {
        console.error("❌ Error detectado al insertar en Supabase:", err);
        // 👈 Eliminado el ': any' de TypeScript para evitar que rompa en archivos .jsx
        setErrorSupabase(err.message || "Error al intentar guardar en la base de datos.");
      } finally {
        setGuardando(false);
      }
    };

    registrarCitaTrasPago();
    // 👈 Agregadas las dependencias obligatorias exigidas por las reglas de ESLint
  }, [esAprobado, searchParams, paymentId, pacienteNombre, setErrorSupabase]);

  // PANTALLA A: Cargando (Se muestra mientras se ejecuta el insert en Supabase)
  if (esAprobado && guardando) {
    return (
      <div className="text-center py-10 max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
        <h3 className="text-xl font-bold text-gray-900">Confirmando tu reserva...</h3>
        <p className="text-gray-500 text-sm mt-2">Estamos registrando tu cita de forma segura en nuestro sistema.</p>
      </div>
    );
  }

  // PANTALLA B: Éxito total (El pago fue aprobado Y la cita ya se guardó en Supabase)
  if (esAprobado && !errorSupabase) {
    return (
      <div className="text-center py-10 max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={40} />
        </div>
        
        <h3 className="text-2xl font-black text-gray-900">¡Pago Confirmado!</h3>
        <p className="text-gray-500 text-sm mt-2">
          Tu cita ha sido agendada con éxito. Te esperamos en nuestro centro médico.
        </p>
        
        <p className="text-[11px] bg-gray-100 text-gray-500 font-mono py-1 px-3 rounded-lg mt-4 inline-block">
          ID Transacción: {paymentId}
        </p>
        
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => window.location.href = "/reservas"}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md text-sm"
          >
            Agendar otra cita
          </button>
          <button
            type="button"
            onClick={() => window.location.href = "/"}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-sm"
          >
            Volver al menú principal
          </button>
        </div>
      </div>
    );
  }

  // PANTALLA C: Error (Si el pago falló o Supabase rechazó el registro)
  return (
    <div className="text-center py-10 max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
      <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <XCircle size={40} />
      </div>
      
      <h3 className="text-2xl font-black text-gray-900">Hubo un problema</h3>
      <p className="text-gray-500 text-sm mt-2">
        {errorSupabase 
          ? `Error de sincronización: ${errorSupabase}`
          : "No pudimos verificar tu pago de manera automática. Si se realizó el cobro, comunícate con soporte técnico."}
      </p>
      
      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={() => window.location.href = "/reservas"}
          className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors text-sm"
        >
          Intentar nuevamente
        </button>
        <button
          type="button"
          onClick={() => window.location.href = "/"}
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-sm"
        >
          Ir al inicio
        </button>
      </div>
    </div>
  );
}

// Componente principal contenedor con Suspense integrado
export default function PaginaExito() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Suspense fallback={
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto" size={40} />
          <p className="mt-2 text-gray-500 text-sm">Cargando detalles del pago...</p>
        </div>
      }>
        <ContenidoExito />
      </Suspense>
    </main>
  );
}
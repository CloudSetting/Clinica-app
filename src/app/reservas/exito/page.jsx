"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

// Componente interno que maneja la lectura limpia de parámetros
function ContenidoExito() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const paymentId = searchParams.get("payment_id");

  // Si no hay status en la URL (por ejemplo, entraron escribiendo la ruta a mano), asumimos error/invalidez
  const esAprobado = status === "approved";

  if (esAprobado) {
    return (
      <div className="text-center py-10 max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-black text-gray-900">¡Pago Confirmado!</h3>
        <p className="text-gray-500 text-sm mt-2">
          Tu cita ha sido agendada con éxito. Te esperamos en nuestro centro médico.
        </p>
        {paymentId && (
          <p className="text-[11px] bg-gray-100 text-gray-500 font-mono py-1 px-3 rounded-lg mt-4 inline-block">
            ID Transacción: {paymentId}
          </p>
        )}
        <button
          type="button"
          onClick={() => window.location.href = "/reservas"}
          className="mt-6 w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Agendar otra cita
        </button>
      </div>
    );
  }

  // Render para estados fallidos, pendientes o nulos
  return (
    <div className="text-center py-10 max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
      <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <XCircle size={40} />
      </div>
      <h3 className="text-2xl font-black text-gray-900">Hubo un problema</h3>
      <p className="text-gray-500 text-sm mt-2">
        No pudimos confirmar tu pago de manera automática. Si se realizó el cobro en tu cuenta, por favor comunícate con soporte técnico.
      </p>
      <button
        type="button"
        onClick={() => window.location.href = "/reservas"}
        className="mt-6 w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
      >
        Intentar nuevamente
      </button>
    </div>
  );
}

// Componente principal contenedor con Suspense
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
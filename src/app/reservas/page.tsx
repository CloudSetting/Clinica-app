'use client';

export const dynamic = 'force-dynamic'; // 👈 ESTO OBLIGA A NEXT.JS A EVITAR EL PRERENDER

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { CheckCircle2, ArrowRight, XCircle, Loader2 } from 'lucide-react';

function ContenidoPagoExitoso() {
  const searchParams = useSearchParams();

  const paymentId = searchParams.get('payment_id');
  const statusPago = searchParams.get('status');

  const esExitoso = statusPago === 'approved';

  if (!esExitoso) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <XCircle size={48} />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-gray-900">Hubo un problema</h1>
            <p className="text-gray-500 text-sm">
              No pudimos confirmar tu pago. Si se realizó el cobro, por favor comunícate con soporte.
            </p>
          </div>

          <div className="pt-4">
            <Link 
              href="/reservas" 
              className="w-full py-4 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              Intentar nuevamente
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center space-y-6">
        
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={48} />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-gray-900">¡Cita Confirmada!</h1>
          <p className="text-gray-500 text-sm">
            Tu pago ha sido procesado con éxito. Te esperamos en nuestro centro médico.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 text-left text-xs text-gray-400 space-y-1">
          <p><span className="font-bold text-gray-500">ID de Pago:</span> {paymentId}</p>
          <p><span className="font-bold text-gray-500">Estado:</span> Pago Aprobado</p>
        </div>

        <div className="pt-4">
          <Link 
            href="/" 
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            Volver al Inicio
            <ArrowRight size={18} />
          </Link>
        </div>

      </div>
    </main>
  );
}

export default function PagoExitosoPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
          <p className="text-gray-600 font-medium">Cargando detalles de tu reserva...</p>
        </div>
      }
    >
      <ContenidoPagoExitoso />
    </Suspense>
  );
}
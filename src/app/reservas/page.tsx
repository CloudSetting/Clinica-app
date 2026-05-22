import FormularioReserva from "@/components/reservas/FormularioReserva";

export default function PaginaPublicaReservas() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-black text-blue-900 mb-2">
          Reserva tu Atención
        </h1>
        <p className="text-gray-600">
          Sigue los pasos a continuación para agendar y pagar tu cita médica de forma segura.
        </p>
      </div>
      
      {/* Cargamos tu formulario público de 4 pasos con pasarela */}
      <FormularioReserva />
    </main>
  );
}